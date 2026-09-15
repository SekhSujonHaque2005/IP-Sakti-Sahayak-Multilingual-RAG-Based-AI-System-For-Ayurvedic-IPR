import pytest
from app.core.email import send_welcome_email, SMTP_USERNAME

def test_smtp_credentials():
    # Send an actual test email to the configured SMTP user
    # If the credentials are bad, this will throw an SMTPAuthenticationError
    print(f"\nAttempting to send a test email to {SMTP_USERNAME}...")
    try:
        send_welcome_email(SMTP_USERNAME)
        print("Success! The SMTP keys are working perfectly.")
    except Exception as e:
        pytest.fail(f"Failed to send email. Check your SMTP keys in .env. Error: {e}")
