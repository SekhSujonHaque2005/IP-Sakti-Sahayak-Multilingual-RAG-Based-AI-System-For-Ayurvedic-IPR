import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = os.getenv("SMTP_USERNAME")  # e.g., your-email@gmail.com
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Gmail App Password

def send_email_sync(to_email: str, subject: str, html_content: str):
    """
    Synchronously sends an email using Gmail SMTP.
    This should be called via FastAPI BackgroundTasks.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"WARNING: SMTP credentials not set. Simulating email to {to_email}")
        print(f"Subject: {subject}\nBody: {html_content[:100]}...")
        return
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"VaidyaSetu <{SMTP_USERNAME}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
        server.quit()
        print(f"Successfully sent email to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_welcome_email(to_email: str):
    subject = "Welcome to VaidyaSetu!"
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to VaidyaSetu!</h2>
            <p>Thank you for joining India's premier Ayurveda Intellectual Property platform.</p>
            <p>You can now explore thousands of legal documents, patents, and regulations with our AI assistant.</p>
            <br>
            <p>Best Regards,</p>
            <p>The VaidyaSetu Team</p>
        </body>
    </html>
    """
    send_email_sync(to_email, subject, html_content)

def send_password_reset_email(to_email: str, token: str):
    # In production, link to the actual frontend URL (e.g. https://vaidyasetu.com/reset-password?token=...)
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    subject = "VaidyaSetu Password Reset Request"
    html_content = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. This link is valid for 15 minutes.</p>
            <p><a href="{reset_link}">Click here to reset your password</a></p>
            <p>If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    send_email_sync(to_email, subject, html_content)
