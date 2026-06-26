import { createTransport } from "nodemailer";
import { env } from "../../../config/env.js";
import { logger } from "../../../config/logger.js";

interface EmailDeliveryResult {
  isEmailSent: boolean;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailDeliveryResult> => {
  // step: avoid slow SMTP attempts when deployment mail config is incomplete
  if (
    !env.NODEMAILER_SENDER_EMAIL ||
    !env.NODEMAILER_SENDER_EMAIL_GOOGLE_APP_PASSWORD
  ) {
    logger.warn({ to, subject }, "Email config is missing credentials");
    return { isEmailSent: false };
  }

  const transporter = createTransport({
    ...(env.NODEMAILER_HOST
      ? {
          host: env.NODEMAILER_HOST,
          port: env.NODEMAILER_PORT,
          secure: env.NODEMAILER_PORT === 465,
        }
      : {
          service: "gmail",
        }),
    auth: {
      user: env.NODEMAILER_SENDER_EMAIL,
      pass: env.NODEMAILER_SENDER_EMAIL_GOOGLE_APP_PASSWORD,
    },
    connectionTimeout: env.NODEMAILER_TIMEOUT_MS,
    greetingTimeout: env.NODEMAILER_TIMEOUT_MS,
    socketTimeout: env.NODEMAILER_TIMEOUT_MS,
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
    const isEmailSent =
      Array.isArray(info?.accepted) && info.accepted.length > 0;

    if (!isEmailSent) {
      logger.warn(
        { to, subject, rejected: info.rejected },
        "Email was not accepted for delivery",
      );
    }

    return { isEmailSent };
  } catch (err) {
    logger.error({ err, to, subject }, "Email send failed");
    return { isEmailSent: false };
  }
};
