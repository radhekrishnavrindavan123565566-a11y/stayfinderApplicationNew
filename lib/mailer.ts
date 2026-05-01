import nodemailer from "nodemailer";

// Create transporter — uses Gmail SMTP by default (free)
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("[Mailer] SMTP credentials not configured — emails will be logged to console only");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_NAME  = process.env.SMTP_FROM_NAME  || "Nestora";
const FROM_EMAIL = process.env.SMTP_USER        || "noreply@nestora.in";

// ── OTP email ─────────────────────────────────────────────────────────────────
export async function sendOtpEmail(to: string, otp: string, purpose = "verification"): Promise<void> {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Nestora OTP</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f43f5e,#fb923c);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Nestora</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Find Your Place. Feel At Home.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#71717a;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your OTP Code</p>
              <h2 style="margin:0 0 24px;color:#18181b;font-size:18px;font-weight:700;">
                ${purpose === "verify-register" ? "Verify your email address" : "One-Time Password"}
              </h2>
              <!-- OTP Box -->
              <div style="background:#fef2f2;border:2px dashed #f43f5e;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#f43f5e;font-family:'Courier New',monospace;">${otp}</span>
              </div>
              <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
                This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.6;">
                If you didn't request this OTP, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f4f4f5;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">
                © ${new Date().getFullYear()} Nestora · Uttar Pradesh, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!transporter) {
    console.log(`[MAILER DEV] OTP email to ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `${otp} is your Nestora verification code`,
    html,
    text: `Your Nestora OTP is: ${otp}\n\nValid for 10 minutes. Do not share with anyone.`,
  });

  console.log(`[Mailer] OTP email sent to ${to}`);
}

// ── Generic email ─────────────────────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[MAILER DEV] Email to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to, subject, html,
    text: text || subject,
  });
  console.log(`[Mailer] Email sent to ${to}: ${subject}`);
}
