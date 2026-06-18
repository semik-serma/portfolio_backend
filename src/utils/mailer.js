import nodemailer from 'nodemailer'

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service:'gmail',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "semikserma@gmail.com",
    pass: "fvwppfzezrlcsnhd",
  },
});

// Wrap in an async IIFE so we can use await.
export const sendmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
      to: email,
      subject: "Hello ✔",
      text: "Hello world?", // plain‑text body
      html: `<div style="
      max-width: 400px;
      margin: 50px auto;
      padding: 30px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9f9;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      text-align: center;
  ">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p style="font-size: 16px; color: #555;">Use the following One-Time Password to complete your verification:</p>
      <div style="
          display: inline-block;
          margin: 20px 0;
          padding: 15px 25px;
          font-size: 24px;
          letter-spacing: 4px;
          color: #fff;
          background-color: #4CAF50;
          border-radius: 8px;
          font-weight: bold;
      ">
          ${otp}
      </div>
      <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes.</p>
  </div>
  `, // HTML body
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Email sending failed (Invalid credentials?). Local Development Fallback: OTP for", email, "is", otp);
  }
};