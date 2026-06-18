export const template = ({
  otpCode,
  receiverName,
  subject,
}: {
  otpCode: string;
  receiverName: string;
  subject: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background:#eef2f6; font-family:Arial, Helvetica, sans-serif; color:#17202a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:#eef2f6; margin:0; padding:0;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 18px 45px rgba(20, 39, 63, 0.14);">
          <tr>
            <td style="background:#123524; padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:28px 30px 18px;">
                    <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:#d8a31f; color:#17202a; font-size:12px; line-height:16px; font-weight:700; letter-spacing:0.7px; text-transform:uppercase;">
                      Dyaa Nosir Market
                    </div>
                    <h1 style="margin:18px 0 8px; color:#ffffff; font-size:28px; line-height:36px; font-weight:800;">
                      ${subject}
                    </h1>
                    <p style="margin:0; color:#dce9df; font-size:15px; line-height:23px;">
                      Your trusted place for tractors, tractor spare parts, and car spare parts.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:8px; background:#d8a31f; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 30px 12px;">
              <h2 style="margin:0 0 12px; color:#17202a; font-size:22px; line-height:30px; font-weight:800;">
                Hello ${receiverName},
              </h2>
              <p style="margin:0; color:#4d5b68; font-size:16px; line-height:26px;">
                Use the verification code below to continue with your account. This code helps us keep your account and orders protected.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 30px 26px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:440px; background:#f8faf8; border:1px solid #dfe7df; border-radius:16px;">
                <tr>
                  <td align="center" style="padding:24px 18px;">
                    <p style="margin:0 0 10px; color:#65727e; font-size:13px; line-height:18px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase;">
                      Verification code
                    </p>
                    <div style="display:inline-block; padding:14px 22px; border-radius:14px; background:#ffffff; border:2px dashed #d8a31f; color:#123524; font-size:34px; line-height:42px; font-weight:800; letter-spacing:7px;">
                      ${otpCode}
                    </div>
                    <p style="margin:14px 0 0; color:#7a8793; font-size:13px; line-height:20px;">
                      Copy this code exactly as shown.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 30px 26px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8e8; border-left:4px solid #d8a31f; border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0; color:#604813; font-size:14px; line-height:22px;">
                      If you did not request this code, you can safely ignore this email. For questions about products, quotes, availability, or online orders, contact the shop directly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 30px 34px;">
              <p style="margin:0; color:#4d5b68; font-size:15px; line-height:24px;">
                Best regards,<br />
                <strong style="color:#17202a;">Dyaa Nosir Market Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f4f6f8; padding:22px 30px; border-top:1px solid #e4e9ee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="color:#7a8793; font-size:12px; line-height:20px;">
                    &copy; 2026 Dyaa Nosir Market. All rights reserved.
                  </td>
                  <td align="right" style="color:#7a8793; font-size:12px; line-height:20px;">
                    <a href="[SupportLink]" style="color:#123524; text-decoration:none; font-weight:700;">Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
