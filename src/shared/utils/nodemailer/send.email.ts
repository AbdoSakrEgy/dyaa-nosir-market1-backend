import { createTransport } from "nodemailer";
import { env } from "../../../config/env.js";

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = createTransport({
    host: env.NODEMAILER_HOST as string,
    port: env.NODEMAILER_PORT,
    secure: true,
    service: "gmail",
    auth: {
      user: env.NODEMAILER_SENDER_EMAIL,
      pass: env.NODEMAILER_SENDER_EMAIL_GOOGLE_APP_PASSWORD,
    },
    // tls: {
    //   rejectUnauthorized: false, // Only for development
    // },
  });
  try {
    const info = await transporter.sendMail({
      from: `${env.APP_NAME} <${env.NODEMAILER_SENDER_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });
    const isEmailSended =
      Array.isArray(info?.accepted) && info.accepted.length > 0;
    return { isEmailSended, info };
  } catch (err) {
    return { isEmailSended: false, err: err + "" };
  }
};
