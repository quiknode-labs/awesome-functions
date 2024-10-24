''' 
  Important notes:
    1. Replace "your_email@example.com", "recipient@example.com", and "your_email_password" with actual values.
    2. If you're using Gmail, you might need to use an "App Password" instead of your regular password. You can set this up in your Google Account settings.
    3. The SMTP server (smtp.gmail.com) is set for Gmail. If you're using a different email provider, you'll need to change this to your provider's SMTP server.
    4. Make sure to handle the email credentials securely. Avoid hardcoding them in the script. Consider using environment variables or a secure key management system.
'''

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def main(params):
    # Extract dataset and network from metadata in params
    dataset = params['metadata']['dataset']
    network = params['metadata']['network']
    # Extract user data from params, if any
    user_data = params.get('user_data', {})
    
    # Prepare email content
    subject = f"Data from {dataset} dataset on {network} network"
    body = json.dumps({
        'message': f"This is data from the {dataset} dataset on the {network} network.",
        'user_data': user_data,
        'params': params
    }, indent=2)

    # Email configuration
    sender_email = "your_email@example.com"  # Replace with your email
    receiver_email = "recipient@example.com"  # Replace with recipient's email
    password = "your_email_password"  # Replace with your email password or app-specific password

    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    # Add body to email
    message.attach(MIMEText(body, "plain"))

    try:
        # Create SMTP session
        with smtplib.SMTP('smtp.gmail.com', 587) as server:  # Using Gmail SMTP server, adjust if using a different provider
            server.starttls()  # Enable security
            server.login(sender_email, password)
            text = message.as_string()
            server.sendmail(sender_email, receiver_email, text)
        print("Email sent successfully")
    except Exception as e:
        print(f"Error sending email: {str(e)}")

    # Return anything that you will consume on API side or helping you check your execution later
    return {
        'message': f"Email sent with data from the {dataset} dataset on the {network} network.",
        'user_data': user_data,
        'params': params
    }