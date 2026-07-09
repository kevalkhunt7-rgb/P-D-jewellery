import PDFDocument from "pdfkit";
import Settings from "../model/settingsModel.js";

/**
 * Helper to get the correct currency symbol and price based on order display currency
 */
const formatPrice = (order, amount, displayAmount) => {
  const currency = order.displayCurrency || "INR";
  const symbol = currency === "USD" ? "$" : "₹";
  const value = displayAmount !== undefined && displayAmount !== null ? displayAmount : amount;
  return `${symbol}${Number(value).toFixed(2)}`;
};

/**
 * Generates a PDF invoice for a given order
 * @param {Object} order - The order document from the database
 * @returns {Promise<Buffer>} - Resolves to the PDF buffer
 */
export const generateInvoicePDF = async (order) => {
  // Fetch store settings for branding and header info
  let storeSettings = {};
  try {
    const settingsDoc = await Settings.findOne();
    if (settingsDoc && settingsDoc.general) {
      storeSettings = settingsDoc.general;
    }
  } catch (error) {
    console.error("Error fetching store settings for invoice PDF:", error);
  }

  const storeName = storeSettings.storeName || "P&D Luxury Jewellery";
  const storeEmail = storeSettings.storeEmail || "pdluxuryjewellery@gmail.com";
  const storePhone = storeSettings.phone || "+91 9876543210";
  const storeAddress = storeSettings.address || "123 Jewelry Street, Surat, Gujarat";

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "LETTER", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", (err) => {
        reject(err);
      });

      // Colors
      const primaryColor = "#1f2937"; // Dark Grey
      const accentColor = "#b45309";  // Amber/Gold
      const textColor = "#374151";    // Medium Grey
      const borderColor = "#e5e7eb";  // Light Grey Border
      const tableHeaderBg = "#f3f4f6"; // Table Header Background

      // ================= HEADER SECTION =================
      // Gold Accent Line at top
      doc.rect(50, 40, 512, 5).fillColor(accentColor).fill();

      // Store Title
      doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(storeName, 50, 60);

      // Store Details (left)
      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(textColor)
        .text(storeAddress, 50, 85, { width: 220 })
        .text(`Phone: ${storePhone}`, 50, 110)
        .text(`Email: ${storeEmail}`, 50, 122);

      // Invoice Details (right)
      doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("INVOICE", 350, 60, { align: "right", width: 212 });

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(textColor);
      
      const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
      doc.text(`Invoice No: ${invoiceNo}`, 350, 85, { align: "right", width: 212 });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 97, { align: "right", width: 212 });
      doc.text(`Payment: ${order.paymentMethod || "Razorpay"}`, 350, 109, { align: "right", width: 212 });
      doc.text(`Status: ${order.orderStatus}`, 350, 121, { align: "right", width: 212 });

      // Divider Line
      doc.moveTo(50, 145)
        .lineTo(562, 145)
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      // ================= BILLING / SHIPPING SECTION =================
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(primaryColor)
        .text("BILL TO:", 50, 160);

      const address = order.shippingAddress || {};
      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(textColor)
        .text(address.fullName || "", 50, 175)
        .text(address.address || "", 50, 187, { width: 250 })
        .text(`${address.city || ""}, ${address.state || ""} - ${address.postalCode || ""}`, 50, 212)
        .text(`Phone: ${address.phone || ""}`, 50, 224);

      // Order Summary Block on the right of Bill To
      doc.rect(350, 160, 212, 75)
        .fillColor("#fafafa")
        .strokeColor(borderColor)
        .lineWidth(1)
        .fillAndStroke();
      doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("ORDER SUMMARY", 360, 170);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(textColor)
        .text(`Order ID: ${order._id.toString()}`, 360, 190, { width: 192 })
        .text(`Items: ${order.orderItems?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}`, 360, 205)
        .text(`Paid: ${order.isPaid ? "Yes" : "No"}`, 360, 217);

      // ================= ITEMS TABLE =================
      let y = 260;

      // Table Header Background
      doc.rect(50, y, 512, 22).fillColor(tableHeaderBg).fill();

      // Headers
      doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(9);

      doc.text("Item Description", 60, y + 7, { width: 240 });
      doc.text("Purity/Weight", 300, y + 7, { width: 90 });
      doc.text("Qty", 400, y + 7, { width: 30, align: "center" });
      doc.text("Unit Price", 440, y + 7, { width: 60, align: "right" });
      doc.text("Total", 500, y + 7, { width: 52, align: "right" });

      y += 22;
      doc.font("Helvetica").fontSize(9).fillColor(textColor);

      // Rows
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item, index) => {
          // Check page break if needed (standard invoice is 1 page usually, but let's be safe)
          if (y > 650) {
            doc.addPage();
            y = 50;
            // Redraw header if we have pagination
            doc.rect(50, y, 512, 22).fillColor(tableHeaderBg).fill();
            doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(9);
            doc.text("Item Description", 60, y + 7, { width: 240 });
            doc.text("Purity/Weight", 300, y + 7, { width: 90 });
            doc.text("Qty", 400, y + 7, { width: 30, align: "center" });
            doc.text("Unit Price", 440, y + 7, { width: 60, align: "right" });
            doc.text("Total", 500, y + 7, { width: 52, align: "right" });
            y += 22;
            doc.font("Helvetica").fontSize(9).fillColor(textColor);
          }

          // Row line divider
          doc.moveTo(50, y)
            .lineTo(562, y)
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .stroke();

          const itemName = item.name || "Jewelry Item";
          const purity = item.purity || "N/A";
          const weight = item.netWeight ? `${item.netWeight}g` : "";
          const spec = purity && weight ? `${purity} / ${weight}` : purity || weight || "N/A";

          // Format pricing using the display helper
          const unitPriceFormatted = formatPrice(order, item.price, item.displayPrice);
          const totalPriceFormatted = formatPrice(order, item.totalPrice, item.displayTotalPrice);

          doc.text(itemName, 60, y + 6, { width: 230 });
          doc.text(spec, 300, y + 6, { width: 90 });
          doc.text(item.quantity.toString(), 400, y + 6, { width: 30, align: "center" });
          doc.text(unitPriceFormatted, 440, y + 6, { width: 60, align: "right" });
          doc.text(totalPriceFormatted, 500, y + 6, { width: 52, align: "right" });

          y += 25; // row height
        });
      }

      // Border at bottom of table
      doc.moveTo(50, y)
        .lineTo(562, y)
        .strokeColor(primaryColor)
        .lineWidth(1)
        .stroke();
      y += 15;

      // ================= SUMMARY SECTION =================
      const summaryLeft = 350;
      const summaryWidth = 212;

      // Display Helper values
      const subtotalVal = formatPrice(order, order.itemsPrice, order.displayItemsPrice);
      const taxVal = formatPrice(order, order.taxPrice, order.displayTaxPrice);
      const shippingVal = formatPrice(order, order.shippingPrice, order.displayShippingPrice);
      
      let discountVal = null;
      // Calculate display discount amount if any
      const orderDiscount = order.discountAmount || 0;
      if (orderDiscount > 0) {
        if (order.displayCurrency === "USD" && order.exchangeRate) {
          const displayDiscount = Number((orderDiscount / order.exchangeRate).toFixed(2));
          discountVal = formatPrice(order, orderDiscount, displayDiscount);
        } else {
          discountVal = formatPrice(order, orderDiscount, orderDiscount);
        }
      }

      const totalVal = formatPrice(order, order.totalPrice, order.displayTotalPrice);

      doc.font("Helvetica").fontSize(9).fillColor(textColor);

      // Subtotal Row
      doc.text("Subtotal:", summaryLeft, y, { width: 120, align: "right" });
      doc.font("Helvetica-Bold").text(subtotalVal, summaryLeft + 120, y, { width: 92, align: "right" });
      y += 16;

      // Tax Row
      doc.font("Helvetica").text("Tax:", summaryLeft, y, { width: 120, align: "right" });
      doc.font("Helvetica-Bold").text(taxVal, summaryLeft + 120, y, { width: 92, align: "right" });
      y += 16;

      // Shipping Row
      doc.font("Helvetica").text("Shipping:", summaryLeft, y, { width: 120, align: "right" });
      doc.font("Helvetica-Bold").text(shippingVal, summaryLeft + 120, y, { width: 92, align: "right" });
      y += 16;

      // Discount Row
      if (discountVal) {
        doc.font("Helvetica").text("Discount:", summaryLeft, y, { width: 120, align: "right" });
        doc.font("Helvetica-Bold").text(`-${discountVal}`, summaryLeft + 120, y, { width: 92, align: "right" });
        y += 16;
      }

      // Total Row Highlight
      doc.rect(summaryLeft, y - 4, summaryWidth, 24)
        .fillColor("#f9fafb")
        .strokeColor(borderColor)
        .lineWidth(1)
        .fillAndStroke();
      doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Grand Total:", summaryLeft + 10, y + 3, { width: 100, align: "left" });
      
      doc.fillColor(accentColor)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(totalVal, summaryLeft + 110, y + 3, { width: 92, align: "right" });

      y += 40;

      doc.fillColor(textColor)
        .font("Helvetica")
        .fontSize(8)
        .text("Thank you for shopping with P&D Luxury Jewellery!", 50, y, { align: "center", width: 512 });

      doc.fillColor("#9ca3af")
        .text("If you have any questions about this invoice, please contact support.", 50, y + 12, { align: "center", width: 512 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
