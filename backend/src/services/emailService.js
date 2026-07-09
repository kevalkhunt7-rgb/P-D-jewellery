import { transporter } from "../config/emailService.js";
import { generateInvoicePDF } from "./pdfService.js";
import User from "../model/userModel.js";

/**
 * Ensures the order's user details are fully populated.
 * If user is just an ObjectId, it queries the database.
 */
const ensureUser = async (order) => {
  if (order.user && typeof order.user === "object" && order.user.email) {
    return order.user;
  }
  const user = await User.findById(order.user);
  if (!user) {
    throw new Error(`Customer/User not found for ID: ${order.user}`);
  }
  return user;
};

/**
 * Format price helpers for emails
 */
const formatPrice = (order, amount, displayAmount) => {
  const currency = order.displayCurrency || "INR";
  const symbol = currency === "USD" ? "$" : "₹";
  const value = displayAmount !== undefined && displayAmount !== null ? displayAmount : amount;
  return `${symbol}${Number(value).toFixed(2)}`;
};

// ================= HTML TEMPLATE PARTS =================
const getHeaderHtml = (title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      padding: 25px 20px;
      text-align: center;
      border-bottom: 4px solid #b45309;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 18px;
      color: #111827;
      margin-top: 0;
      border-bottom: 2px solid #f3f4f6;
      padding-bottom: 10px;
    }
    .status-badge {
      display: inline-block;
      background-color: #fef3c7;
      color: #d97706;
      font-weight: bold;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      text-transform: uppercase;
      margin: 10px 0 20px 0;
    }
    .order-details {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .order-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .order-details th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #9ca3af;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .order-details td {
      padding: 10px 0;
      font-size: 13px;
      border-bottom: 1px dotted #e5e7eb;
      color: #374151;
    }
    .order-details tr:last-child td {
      border-bottom: none;
    }
    .totals-table {
      width: 100%;
      margin-top: 15px;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
    }
    .totals-table td {
      padding: 4px 0;
      font-size: 13px;
      border: none;
      color: #4b5563;
    }
    .totals-table .grand-total {
      font-size: 15px;
      font-weight: bold;
      color: #b45309;
      padding-top: 8px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      background-color: #b45309;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>P&D Luxury Jewellery</h1>
    </div>
    <div class="content">
`;

const getFooterHtml = () => `
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} P&D Luxury Jewellery. All rights reserved.<br>
      123 Jewellery Street, Surat, Gujarat, India<br>
      This is an automated system email. Please do not reply directly to this address.
    </div>
  </div>
</body>
</html>
`;

// ================= EXPORTED NOTIFICATION SERVICE METHODS =================

/**
 * Asynchronously sends an Order Confirmation email with a generated PDF invoice attached.
 * @param {Object} order - The order document from the database
 */
export const sendOrderConfirmationEmail = (order) => {
  // Execute asynchronously
  (async () => {
    try {
      const user = await ensureUser(order);
      const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;

      console.log(`[Email Service] Generating PDF invoice for order ${order._id}...`);
      const pdfBuffer = await generateInvoicePDF(order);

      const itemsHtml = order.orderItems.map(item => {
        const specs = item.purity ? ` (${item.purity})` : "";
        return `
          <tr>
            <td>${item.name}${specs}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatPrice(order, item.totalPrice, item.displayTotalPrice)}</td>
          </tr>
        `;
      }).join("");

      const discountHtml = (order.discountAmount || 0) > 0
        ? `<tr>
             <td>Discount:</td>
             <td style="text-align: right; color: #10b981;">-${formatPrice(order, order.discountAmount, order.displayCurrency === "USD" && order.exchangeRate ? (order.discountAmount / order.exchangeRate) : order.discountAmount)}</td>
           </tr>`
        : "";

      const emailHtml = `
        ${getHeaderHtml("Order Confirmation")}
        <h2>Order Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for shopping with P&D Luxury Jewellery. Your order has been placed successfully. Below are your order details. We have also attached your official PDF invoice to this email.</p>
        
        <div class="order-details">
          <p style="margin-top: 0; font-size: 13px; color: #6b7280;">
            <strong>Order ID:</strong> ${order._id}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod || "Razorpay"}<br>
            <strong>Shipping To:</strong> ${order.shippingAddress?.fullName}, ${order.shippingAddress?.address}, ${order.shippingAddress?.city} - ${order.shippingAddress?.postalCode}
          </p>

          <table style="width: 100%;">
            <thead>
              <tr>
                <th style="width: 60%;">Item</th>
                <th style="text-align: center; width: 15%;">Qty</th>
                <th style="text-align: right; width: 25%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPrice(order, order.itemsPrice, order.displayItemsPrice)}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td style="text-align: right;">${formatPrice(order, order.taxPrice, order.displayTaxPrice)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td style="text-align: right;">${formatPrice(order, order.shippingPrice, order.displayShippingPrice)}</td>
            </tr>
            ${discountHtml}
            <tr class="grand-total">
              <td><strong>Grand Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order, order.totalPrice, order.displayTotalPrice)}</strong></td>
            </tr>
          </table>
        </div>

        <p>We will notify you as soon as your order status updates or ships. If you need any assistance, feel free to contact us.</p>
        ${getFooterHtml()}
      `;

      console.log(`[Email Service] Sending order confirmation email to ${user.email}...`);
      await transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'P&D Luxury Jewellery'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `P&D Luxury Jewellery - Order Confirmation #${invoiceNo}`,
        html: emailHtml,
        attachments: [
          {
            filename: `invoice_${invoiceNo.toLowerCase()}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      });

      console.log(`[Email Service] Order confirmation email successfully sent to ${user.email}`);
    } catch (error) {
      console.error(`[Email Service Error] Failed to send order confirmation email for order ${order._id}:`, error);
    }
  })();
};

/**
 * Asynchronously sends an Order Status Update email.
 * @param {Object} order - The order document from the database
 */
export const sendOrderStatusUpdateEmail = (order) => {
  // Execute asynchronously
  (async () => {
    try {
      const user = await ensureUser(order);
      const status = order.orderStatus;

      let statusMsg = "";
      let statusColor = "#d97706"; // Default amber

      switch (status) {
        case "CONFIRMED":
          statusMsg = "Your order payment has been confirmed and is now being processed.";
          statusColor = "#059669"; // Green
          break;
        case "PACKED":
          statusMsg = "Your items have been carefully packed and prepared for shipment.";
          statusColor = "#2563eb"; // Blue
          break;
        case "SHIPPED":
          statusMsg = "Great news! Your order has been shipped and is on its way to your destination.";
          statusColor = "#7c3aed"; // Purple
          break;
        case "DELIVERED":
          statusMsg = "Your package has been successfully delivered. We hope you love your new jewelry!";
          statusColor = "#059669"; // Green
          break;
        case "CANCELLED":
          statusMsg = "Your order has been cancelled.";
          statusColor = "#dc2626"; // Red
          break;
        case "FAILED":
          statusMsg = "Your payment transaction or order has failed. Please contact us if you need help.";
          statusColor = "#dc2626"; // Red
          break;
        default:
          statusMsg = `Your order status has changed to ${status}.`;
          break;
      }

      const emailHtml = `
        ${getHeaderHtml("Order Update")}
        <h2>Order Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>We are writing to update you on your order status.</p>
        
        <div style="text-align: center;">
          <span class="status-badge" style="background-color: ${statusColor}1A; color: ${statusColor};">
            ${status}
          </span>
        </div>

        <p>${statusMsg}</p>

        <div class="order-details">
          <p style="margin: 0; font-size: 13px; color: #4b5563;">
            <strong>Order ID:</strong> ${order._id}<br>
            <strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span><br>
            <strong>Total Amount:</strong> ${formatPrice(order, order.totalPrice, order.displayTotalPrice)}<br>
            <strong>Shipping To:</strong> ${order.shippingAddress?.fullName}, ${order.shippingAddress?.address}, ${order.shippingAddress?.city}
          </p>
        </div>

        <p>If you have any questions or require modifications to your shipping details, please contact us immediately.</p>
        ${getFooterHtml()}
      `;

      console.log(`[Email Service] Sending status update [${status}] email to ${user.email}...`);
      await transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'P&D Luxury Jewellery'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `P&D Luxury Jewellery - Order Update: Status is now ${status} (Order #${order._id.toString().slice(-8).toUpperCase()})`,
        html: emailHtml
      });

      console.log(`[Email Service] Status update email successfully sent to ${user.email}`);
    } catch (error) {
      console.error(`[Email Service Error] Failed to send status update email for order ${order._id}:`, error);
    }
  })();
};

/**
 * Asynchronously sends a Cancellation Approved email.
 * @param {Object} order - The order document from the database
 */
export const sendCancellationApprovedEmail = (order) => {
  // Execute asynchronously
  (async () => {
    try {
      const user = await ensureUser(order);

      const refundAmountFormatted = formatPrice(order, order.refundAmount, order.displayCurrency === "USD" && order.exchangeRate ? (order.refundAmount / order.exchangeRate) : order.refundAmount);

      const emailHtml = `
        ${getHeaderHtml("Cancellation Approved")}
        <h2>Cancellation Request Approved</h2>
        <p>Dear ${user.name},</p>
        <p>This is to inform you that your request to cancel your order has been approved by our administrator.</p>

        <div class="status-badge" style="background-color: #d1fae5; color: #065f46; text-align: center; display: block; margin: 15px auto; max-width: 250px;">
          CANCELLATION APPROVED
        </div>

        <div class="order-details" style="border-left: 4px solid #059669;">
          <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.7;">
            <strong>Order ID:</strong> ${order._id}<br>
            <strong>Status:</strong> CANCELLED<br>
            <strong>Refund Amount:</strong> ${refundAmountFormatted}<br>
            <strong>Refund Method:</strong> ${order.paymentMethod === "COD" ? "Not Required (COD)" : "Original Payment Method"}
          </p>
        </div>

        <p style="font-size: 15px; color: #b45309; font-weight: bold; background-color: #fffbeb; padding: 12px; border-radius: 6px; border: 1px solid #fef3c7;">
          Refund Notice: Admin approved your request. Your amount will be refunded in 5-7 business days.
        </p>

        <p>If you have any further questions regarding this cancellation or refund timeline, please contact our help desk.</p>
        ${getFooterHtml()}
      `;

      console.log(`[Email Service] Sending cancellation approved email to ${user.email}...`);
      await transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'P&D Luxury Jewellery'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `P&D Luxury Jewellery - Order Cancellation Approved (Order #${order._id.toString().slice(-8).toUpperCase()})`,
        html: emailHtml
      });

      console.log(`[Email Service] Cancellation approved email successfully sent to ${user.email}`);
    } catch (error) {
      console.error(`[Email Service Error] Failed to send cancellation approved email for order ${order._id}:`, error);
    }
  })();
};
