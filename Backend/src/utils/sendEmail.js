import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true only for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your Famly account",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to Famly!</h2>
        <p>Your email verification code is:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This code is valid for <b>5 minutes</b>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
    });
};