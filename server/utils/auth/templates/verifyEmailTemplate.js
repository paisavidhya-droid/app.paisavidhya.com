// utils/auth/templates/verifyEmailTemplate.js
export function buildVerifyEmailHTML({
  appName = "Paisavidhya",
  verifyUrl,
  supportEmail = "support@yourdomain.com",
  logoUrl = `${process.env.APP_URL}/logo.png`,
  userName,
  expiresMinutes = 10,
}) {
  const safeName = userName ? userName : "there";
  const preheader = `Verify your email to finish setting up ${appName}. Link expires in ${expiresMinutes} minutes.`;

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Verify your email • ${appName}</title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings
            xmlns:o="urn:schemas-microsoft-com:office:office"
          >
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      /* Reset + base */
      body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
      }
      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      table,
      td {
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
      }
      img {
        -ms-interpolation-mode: bicubic;
      }
      a {
        text-decoration: none;
      }

      /* Layout */
      body {
        background: #f9fafb;
        color: #111827;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      .card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
      }
      .px {
        padding-left: 32px;
        padding-right: 32px;
      }
      .py {
        padding-top: 32px;
        padding-bottom: 32px;
      }

      .logo {
        padding: 8px 24px 16px 24px;
      }
      .h1 {
        font-size: 24px;
        line-height: 1.3;
        font-weight: 700;
        color: #111827;
        margin: 0 0 12px 0;
      }
      .text {
        font-size: 16px;
        line-height: 1.6;
        color: #374151;
        margin: 0;
      }
      .muted {
        font-size: 13px;
        line-height: 1.6;
        color: #6b7280;
        margin: 0;
      }

      .sp-8 {
        height: 8px;
        line-height: 8px;
        font-size: 8px;
      }
      .sp-12 {
        height: 12px;
        line-height: 12px;
        font-size: 12px;
      }
      .sp-16 {
        height: 16px;
        line-height: 16px;
        font-size: 16px;
      }
      .sp-20 {
        height: 20px;
        line-height: 20px;
        font-size: 20px;
      }
      .sp-24 {
        height: 24px;
        line-height: 24px;
        font-size: 24px;
      }
      .sp-28 {
        height: 28px;
        line-height: 28px;
        font-size: 28px;
      }
      .sp-32 {
        height: 32px;
        line-height: 32px;
        font-size: 32px;
      }

      /* Button (non-Outlook) */
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #ffffff !important;
        font-weight: 600;
        border-radius: 10px;
        padding: 14px 26px;
      }
      .link {
        color: #2563eb;
        word-break: break-all;
      }

      /* Footer */
      .footer {
        text-align: center;
        padding: 16px 8px 0 8px;
        font-size: 12px;
        color: #9ca3af;
      }

      /* Dark mode */
      @media (prefers-color-scheme: dark) {
        body {
          background: #0f172a !important;
          color: #e5e7eb !important;
        }
        .card {
          background: #1f2937 !important;
        }
        .text {
          color: #e5e7eb !important;
        }
        .muted {
          color: #9ca3af !important;
        }
        .btn {
          background: #3b82f6 !important;
        }
      }

      /* Mobile */
      @media screen and (max-width: 600px) {
        .px {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        .py {
          padding-top: 24px !important;
          padding-bottom: 24px !important;
        }
        .logo {
          padding: 8px 20px 16px 20px !important;
        }
      }
    </style>
  </head>
  <body>
    <!-- Preheader (hidden) -->
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
      "
    >
      ${preheader}
    </div>

    <table
      role="presentation"
      width="100%"
      bgcolor="#f9fafb"
      style="padding: 32px 0; border-radius: 16px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            style="max-width: 600px"
            class="container"
          >
            <tr>
              <td align="center" style="padding: 8px 24px">
                <img
                  src="${logoUrl}"
                  alt="${appName}"
                  width="120"
                  style="display: block"
                />
              </td>
            </tr>

            <tr>
              <td>
                <table
                  role="presentation"
                  width="100%"
                  bgcolor="#ffffff"
                  class="card"
                  style="
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
                  "
                >
                  <tr>
                    <td>
                      <h1
                        style="
                          margin: 0 0 12px;
                          font-size: 24px;
                          line-height: 1.3;
                          font-weight: 700;
                        "
                      >
                        Verify your email
                      </h1>
                      <p
                        style="
                          margin: 0 0 16px;
                          font-size: 16px;
                          line-height: 1.6;
                        "
                      >
                        Hi ${safeName},
                      </p>
                      <p
                        style="
                          margin: 0 0 20px;
                          font-size: 16px;
                          line-height: 1.6;
                        "
                      >
                        Please confirm this email address to finish setting up
                        your ${appName} account. This link expires in
                        <strong>${expiresMinutes} minutes</strong>.
                      </p>

                      <!-- Button -->
                      <div style="text-align: center; margin: 28px 0">
                        <!--[if mso]>
                          <v:roundrect
                            xmlns:v="urn:schemas-microsoft-com:vml"
                            xmlns:w="urn:schemas-microsoft-com:office:word"
                            href="${verifyUrl}"
                            style="
                              height: 44px;
                              v-text-anchor: middle;
                              width: 220px;
                            "
                            arcsize="12%"
                            stroke="f"
                            fillcolor="#2563EB"
                          >
                            <w:anchorlock />
                            <center
                              style="
                                color: #ffffff;
                                font-family: Segoe UI, Helvetica, Arial,
                                  sans-serif;
                                font-size: 16px;
                                font-weight: 600;
                              "
                            >
                              Verify Email
                            </center>
                          </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-- -->
                        <a
                          href="${verifyUrl}"
                          class="btn"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Verify your email"
                          >Verify Email</a
                        >

                        <!--<![endif]-->
                      </div>

                      <!-- Fallback link -->
                      <!-- <p
                        class="muted"
                        style="
                          margin: 20px 0 0;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #6b7280;
                        "
                      >
                        Having trouble with the button? Paste this link into
                        your browser:<br />
                        <a href="${verifyUrl}" class="link">${verifyUrl}</a>
                      </p>-->

                      <!-- Safety + ignore -->
                      <p
                        class="muted"
                        style="
                          margin: 16px 0 0;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #6b7280;
                        "
                      >
                        If you didn’t request this, you can safely ignore this
                        email.
                      </p>

                      <p
                        style="
                          margin: 24px 0 0;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        Thanks,<br />
                        The ${appName} Team
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 16px 8px">
                <p
                  class="muted"
                  style="margin: 0; font-size: 12px; color: #6b7280"
                >
                  Need help?
                  <a href="mailto:${supportEmail}" style="color: #1d4ed8"
                    >Contact support</a
                  >
                </p>
                <p
                  class="muted"
                  style="margin: 6px 0 0; font-size: 11px; color: #94a3b8"
                >
                  © ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

  `;
}

export function buildVerifyEmailText({
  appName = "Paisavidhya",
  verifyUrl,
  expiresMinutes = 10,
}) {
  return `Verify your email for ${appName}

Please confirm this email address to finish setting up your ${appName} account.
This link expires in ${expiresMinutes} minutes.

Verify: ${verifyUrl}

If you didn't request this, you can ignore this email.`;
}
