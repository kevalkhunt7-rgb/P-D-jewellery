import { transporter } from "../config/emailService.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: "Admin email is not configured",
      });
    }

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: adminEmail,
      replyTo: email,
      subject: `Customer Inquiry: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2C2C2C;">
          <h2 style="color: #B76E79; border-bottom: 1px solid #E8C7B7; padding-bottom: 10px;">New Customer Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #FDF8F3; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="margin-top: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Received from the Contact Us page</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Your message has been sent. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
};
