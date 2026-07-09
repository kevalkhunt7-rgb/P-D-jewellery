const SPECIFICATION_LABELS = {
  baseMaterial: "Base Material",
  purity: "Purity",
  metalColor: "Metal Color",
  grossWeight: "Gross Weight",
  netWeight: "Net Weight",
  gender: "Gender",
  occasion: "Occasion",
  platingType: "Plating Type",
  diamondCarat: "Diamond Carat",
  numberOfDiamonds: "Number of Diamonds",
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeLabel = (label) => normalizeText(label).toLowerCase();

const hasValue = (value) => normalizeText(value) !== "";

const parseNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatListValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean).join(", ");
  }

  return normalizeText(value);
};

export const normalizeSpecifications = (input) => {
  let source = input;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item) => {
      if (typeof item === "string") {
        return {
          label: item.trim(),
          value: "",
        };
      }

      return {
        label: normalizeText(item?.label),
        value: normalizeText(item?.value),
      };
    })
    .filter((item) => item.label);
};

export const buildLegacySpecifications = (product = {}) => {
  const specifications = [
    { label: SPECIFICATION_LABELS.baseMaterial, value: product.material || product.baseMaterial || product.metalType },
    { label: SPECIFICATION_LABELS.purity, value: product.purity },
    { label: SPECIFICATION_LABELS.metalColor, value: product.metalColor || product.color },
    {
      label: SPECIFICATION_LABELS.grossWeight,
      value: hasValue(product.grossWeight) ? `${product.grossWeight} g` : product.weight,
    },
    {
      label: SPECIFICATION_LABELS.netWeight,
      value: hasValue(product.netWeight) ? `${product.netWeight} g` : "",
    },
    { label: SPECIFICATION_LABELS.gender, value: product.gender },
    { label: SPECIFICATION_LABELS.occasion, value: formatListValue(product.occasion) },
    { label: SPECIFICATION_LABELS.platingType, value: product.plating || product.platingType },
    {
      label: SPECIFICATION_LABELS.diamondCarat,
      value: hasValue(product.diamondWeight) ? `${product.diamondWeight} ct` : "",
    },
    { label: SPECIFICATION_LABELS.numberOfDiamonds, value: product.diamondPieces },
  ];

  return specifications
    .map((item) => ({
      label: item.label,
      value: normalizeText(item.value),
    }))
    .filter((item) => item.label && item.value);
};

export const resolveProductSpecifications = (product = {}) => {
  const normalized = normalizeSpecifications(product.specifications);
  return normalized.length > 0 ? normalized : buildLegacySpecifications(product);
};

export const mapSpecificationsToLegacyFields = (specifications = []) => {
  const mappedValues = normalizeSpecifications(specifications).reduce((accumulator, item) => {
    accumulator[normalizeLabel(item.label)] = normalizeText(item.value);
    return accumulator;
  }, {});

  const legacyFields = {};

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.baseMaterial)]) {
    legacyFields.material = mappedValues[normalizeLabel(SPECIFICATION_LABELS.baseMaterial)];
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.purity)]) {
    legacyFields.purity = mappedValues[normalizeLabel(SPECIFICATION_LABELS.purity)];
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.metalColor)]) {
    legacyFields.metalColor = mappedValues[normalizeLabel(SPECIFICATION_LABELS.metalColor)];
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.grossWeight)]) {
    const grossWeight = parseNumber(mappedValues[normalizeLabel(SPECIFICATION_LABELS.grossWeight)]);
    if (grossWeight !== undefined) {
      legacyFields.grossWeight = grossWeight;
    }
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.netWeight)]) {
    const netWeight = parseNumber(mappedValues[normalizeLabel(SPECIFICATION_LABELS.netWeight)]);
    if (netWeight !== undefined) {
      legacyFields.netWeight = netWeight;
    }
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.gender)]) {
    const genderValue = mappedValues[normalizeLabel(SPECIFICATION_LABELS.gender)].toLowerCase();
    if (["male", "female", "unisex"].includes(genderValue)) {
      legacyFields.gender = genderValue;
    }
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.occasion)]) {
    legacyFields.occasion = mappedValues[normalizeLabel(SPECIFICATION_LABELS.occasion)]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.platingType)]) {
    legacyFields.plating = mappedValues[normalizeLabel(SPECIFICATION_LABELS.platingType)];
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.diamondCarat)]) {
    const diamondWeight = parseNumber(mappedValues[normalizeLabel(SPECIFICATION_LABELS.diamondCarat)]);
    if (diamondWeight !== undefined) {
      legacyFields.diamondWeight = diamondWeight;
    }
  }

  if (mappedValues[normalizeLabel(SPECIFICATION_LABELS.numberOfDiamonds)]) {
    const diamondPieces = parseNumber(mappedValues[normalizeLabel(SPECIFICATION_LABELS.numberOfDiamonds)]);
    if (diamondPieces !== undefined) {
      legacyFields.diamondPieces = diamondPieces;
    }
  }

  return legacyFields;
};
