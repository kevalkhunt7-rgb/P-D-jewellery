export const DEFAULT_SPECIFICATIONS = [
  "Base Material",
  "Purity",
  "Metal Color",
  "Gross Weight",
  "Net Weight",
  "Gender",
  "Occasion",
  "Plating Type",
  "Diamond Carat",
  "Number of Diamonds",
  "Diamond Color",
  "BIS Hallmark Number",
  "Certificate Details",
];

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeLabel = (label) => normalizeText(label).toLowerCase();

const stripNumericValue = (value) => {
  const text = normalizeText(value);
  if (!text) return "";

  const parsed = Number.parseFloat(text.replace(/[^0-9.\-]+/g, ""));

  return Number.isFinite(parsed) ? String(parsed) : text;
};

/**
 * Generates a stable id for default specifications.
 * If no label is supplied (custom specification), generates a unique id.
 */
const createSpecificationId = (label, fallbackIndex) => {
  if (!label) {
    return (
      globalThis.crypto?.randomUUID?.() ||
      `spec_${Date.now()}_${Math.random().toString(36).slice(2)}`
    );
  }

  const normalized = normalizeLabel(label) || "custom";

  if (fallbackIndex !== undefined) {
    return `spec_${fallbackIndex}_${normalized.replace(/[^a-z0-9]+/g, "_")}`;
  }

  return `spec_${normalized.replace(/[^a-z0-9]+/g, "_")}`;
};

export const createDefaultSpecifications = () =>
  DEFAULT_SPECIFICATIONS.map((label, index) => ({
    id: createSpecificationId(label, index),
    label,
    value: "",
  }));

export const normalizeSpecifications = (specifications = []) =>
  (Array.isArray(specifications) ? specifications : [])
    .map((item, index) => {
      const label = normalizeText(item?.label);
      const value = normalizeText(item?.value);
      const labelKey = normalizeLabel(label);

      const id =
        item?.id ||
        item?._id ||
        createSpecificationId(label, index);

      if (
        labelKey === "gross weight" ||
        labelKey === "net weight" ||
        labelKey === "diamond carat" ||
        labelKey === "number of diamonds"
      ) {
        return {
          id,
          label,
          value: stripNumericValue(value),
        };
      }

      if (labelKey === "diamond color") {
        return {
          id,
          label,
          value: value.toUpperCase(),
        };
      }

      return {
        id,
        label,
        value,
      };
    })
    .filter((item) => item.label);

const getLegacyValueForLabel = (product = {}, label) => {
  const labelKey = normalizeLabel(label);

  switch (labelKey) {
    case "base material":
      return product.material || product.baseMaterial || product.metalType || "";

    case "purity":
      return product.purity || "";

    case "metal color":
      return product.metalColor || product.color || "";

    case "gross weight":
      return product.grossWeight ?? product.weight ?? "";

    case "net weight":
      return product.netWeight ?? "";

    case "gender":
      return product.gender || "";

    case "occasion":
      return Array.isArray(product.occasion)
        ? product.occasion.join(", ")
        : product.occasion || "";

    case "plating type":
      return product.plating || product.platingType || "";

    case "diamond carat":
      return product.diamondWeight ?? "";

    case "number of diamonds":
      return product.diamondPieces ?? "";

    case "diamond color":
      return product.diamondColor ?? "";

    case "bis hallmark number":
      return product.bisHallmarkNumber ?? "";

    case "certificate details":
      return product.certificateDetails ?? "";

    default:
      return "";
  }
};

export const buildInitialSpecifications = (product = null) => {
  const existingSpecifications = normalizeSpecifications(
    product?.specifications
  );

  const specificationMap = new Map();

  existingSpecifications.forEach((item) => {
    specificationMap.set(normalizeLabel(item.label), item);
  });

  DEFAULT_SPECIFICATIONS.forEach((label, index) => {
    const key = normalizeLabel(label);

    if (!specificationMap.has(key)) {
      specificationMap.set(key, {
        id: createSpecificationId(label, index), // ✅ FIX
        label,
        value: normalizeText(
          getLegacyValueForLabel(product || {}, label)
        ),
      });
    }
  });

  return Array.from(specificationMap.values());
};

export const getSpecificationValue = (
  specifications = [],
  label
) => {
  const labelKey = normalizeLabel(label);

  const matchedSpecification = normalizeSpecifications(
    specifications
  ).find(
    (item) => normalizeLabel(item.label) === labelKey
  );

  return matchedSpecification?.value || "";
};

export const buildLegacySpecificationPayload = (
  specifications = []
) => {
  const normalizedSpecifications =
    normalizeSpecifications(specifications);

  const getValue = (label) =>
    getSpecificationValue(normalizedSpecifications, label);

  const genderValue = getValue("Gender").toLowerCase();

  return {
    specifications: normalizedSpecifications,

    material: getValue("Base Material"),
    purity: getValue("Purity"),
    metalColor: getValue("Metal Color"),
    grossWeight: getValue("Gross Weight"),
    netWeight: getValue("Net Weight"),

    gender: ["male", "female", "unisex"].includes(genderValue)
      ? genderValue
      : "unisex",

    occasion: getValue("Occasion"),
    plating: getValue("Plating Type"),

    diamondWeight: getValue("Diamond Carat"),
    diamondPieces: getValue("Number of Diamonds"),
    diamondColor: getValue("Diamond Color"),

    bisHallmarkNumber: getValue("BIS Hallmark Number"),
    certificateDetails: getValue("Certificate Details"),
  };
};