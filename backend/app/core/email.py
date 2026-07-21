import smtplib
from datetime import datetime
from email.mime.text import MIMEText

from app.config import settings

_CURRENT_YEAR = datetime.now().year


def _base_html(body: str) -> str:
    return f"""\
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-size:22px;font-weight:700;color:#7C3AED;letter-spacing:-0.03em;">Nexora</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
              {body}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                Nexora CRM<br>
                &copy; {_CURRENT_YEAR} Nexora. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_email(to: str, subject: str, html: str) -> bool:
    if not settings.MAILTRAP_SMTP_USERNAME or not settings.MAILTRAP_SMTP_PASSWORD:
        return False

    msg = MIMEText(_base_html(html), "html")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to

    try:
        with smtplib.SMTP("sandbox.smtp.mailtrap.io", 2525, timeout=10) as server:
            server.starttls()
            server.login(settings.MAILTRAP_SMTP_USERNAME, settings.MAILTRAP_SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, [to], msg.as_string())
        print(f"[EMAIL] Sent '{subject}' to {to}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to}: {e}")
        return False


def send_password_reset_email(email: str, token: str) -> bool:
    if not settings.MAILTRAP_SMTP_USERNAME or not settings.MAILTRAP_SMTP_PASSWORD:
        print(f"[EMAIL] Mailtrap SMTP not configured. Reset token for {email}: {token}")
        return False

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    body = f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding-bottom:8px;">
      <h1 style="margin:0;font-size:20px;font-weight:600;color:#111827;letter-spacing:-0.02em;">Reset your password</h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
        We received a request to reset your Nexora password. Click the button below to choose a new one. This link expires in 30 minutes.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius:8px;background-color:#7C3AED;padding:12px 24px;">
            <a href="{reset_url}" target="_blank" style="display:inline-block;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">Reset password</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </td>
  </tr>
  <tr>
    <td style="border-top:1px solid #f3f4f6;padding-top:16px;">
      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <a href="{reset_url}" style="color:#7C3AED;text-decoration:underline;font-size:12px;word-break:break-all;">{reset_url}</a>
      </p>
    </td>
  </tr>
</table>"""
    return _send_email(email, "Reset your Nexora password", body)


def send_verification_email(email: str, token: str) -> bool:
    if not settings.MAILTRAP_SMTP_USERNAME or not settings.MAILTRAP_SMTP_PASSWORD:
        print(f"[EMAIL] Mailtrap SMTP not configured. Verification token for {email}: {token}")
        return False

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    body = f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding-bottom:8px;">
      <h1 style="margin:0;font-size:20px;font-weight:600;color:#111827;letter-spacing:-0.02em;">Verify your email</h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
        Thanks for creating a Nexora account. Click the button below to verify your email address and get started. This link expires in 24 hours.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius:8px;background-color:#7C3AED;padding:12px 24px;">
            <a href="{verify_url}" target="_blank" style="display:inline-block;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">Verify email</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
        If you didn't create an account with Nexora, you can safely ignore this email.
      </p>
    </td>
  </tr>
  <tr>
    <td style="border-top:1px solid #f3f4f6;padding-top:16px;">
      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <a href="{verify_url}" style="color:#7C3AED;text-decoration:underline;font-size:12px;word-break:break-all;">{verify_url}</a>
      </p>
    </td>
  </tr>
</table>"""
    return _send_email(email, "Verify your Nexora email", body)
