from supabase import Client
from typing import Dict
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class ContactService:
    def __init__(self, client: Client):
        self.client = client
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_email = settings.SMTP_EMAIL
        self.smtp_password = settings.SMTP_PASSWORD
        self.recipient_email = settings.RECIPIENT_EMAIL
    
    async def send_contact_message(
        self, 
        category: str,
        subject: str,
        message: str,
        user_id: str,
        user_email: str
    ) -> Dict[str, str]:
        """
        Save contact message to database and send email.
        """
        try:
            # Save to database FIRST
            contact_data = {
                "user_id": user_id,
                "user_email": user_email,
                "category": category,
                "subject": subject,
                "message": message,
                "status": "new",
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = self.client.table("contacts").insert(contact_data).execute()
            
            if not response.data:
                raise Exception("Failed to save contact message")
            
            # Try to send email but DON'T crash if it fails
            try:
                self._send_email(category, subject, message, user_email)
                logger.info(f"Email sent successfully for contact {response.data[0]['id']}")
            except Exception as email_error:
                # Log the error but don't crash
                logger.error(f"Failed to send email notification: {email_error}")
                # Don't raise - just continue
            
            return {
                "message": "Your message has been sent successfully!",
                "contact_id": response.data[0]["id"]
            }
                
        except Exception as e:
            raise Exception(f"Failed to send contact message: {str(e)}")
    
    def _send_email(self, category: str, subject: str, message: str, user_email: str):
        """Send email using SMTP."""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[{category.upper()}] {subject}"
            msg['From'] = self.smtp_email
            msg['To'] = self.recipient_email
            msg['Reply-To'] = user_email
            
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <div style="background-color: #5B6FB5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">📬 New Contact Form Submission</h2>
                  </div>
                  <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong>Category:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <span style="background-color: #5B6FB5; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                            {category.upper()}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong>From:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          {user_email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          <strong>Subject:</strong>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                          {subject}
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #5B6FB5; border-radius: 4px;">
                      <strong style="display: block; margin-bottom: 10px;">Message:</strong>
                      <div style="white-space: pre-wrap; word-wrap: break-word;">
                        {message}
                      </div>
                    </div>
                    <div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 4px; text-align: center; font-size: 12px; color: #666;">
                      💡 <strong>Tip:</strong> You can reply directly to this email to respond to {user_email}
                    </div>
                  </div>
                  <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>This email was sent from your SBOM Manager contact form</p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            part = MIMEText(html, 'html')
            msg.attach(part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
            server.quit()
                
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            raise