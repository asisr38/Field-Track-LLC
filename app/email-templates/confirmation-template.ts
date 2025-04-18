export const generateConfirmationEmail = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Field Track LLC</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #0e4426; 
      padding: 25px; 
      border-radius: 4px 4px 0 0;
      text-align: center;
    }
    .header h2 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 15px;
    }
    .content { 
      padding: 30px; 
      background-color: #ffffff;
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
    }
    .cta-button {
      display: inline-block;
      background-color: #0e4426;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .services {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .services h3 {
      margin-top: 0;
      color: #0e4426;
    }
    .services ul {
      margin-bottom: 0;
      padding-left: 20px;
    }
    .footer {
      background-color: #eeeeee;
      text-align: center;
      padding: 15px;
      font-size: 14px;
      color: #666666;
      border-radius: 0 0 4px 4px;
      border: 1px solid #dddddd;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thank You for Contacting Field Track LLC</h2>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      
      <p>Thank you for reaching out to Field Track LLC. We've received your inquiry and appreciate your interest in our precision agriculture services.</p>
      
      <p>A member of our team will review your message and get back to you as soon as possible. </p>
      
      <p>In the meantime, you can learn more about our services on our website.</p>
      
      <p>Best regards,<br>
      Richard M. Smith, Ph.D.<br>
      Field Track LLC Team</p>
    </div>
    <div class="footer">
      <p>This is an automated response. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Field Track LLC. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const generateConfirmationEmailText = (name: string) => `
THANK YOU FOR CONTACTING FIELD TRACK LLC

Hello ${name},

Thank you for reaching out to Field Track LLC. We've received your inquiry and appreciate your interest in our precision agriculture services.

A member of our team will review your message and get back to you as soon as possible.

In the meantime, you can learn more about our services on our website.

Best regards,
Richard M. Smith, Ph.D.
Field Track LLC Team

This is an automated response. Please do not reply to this email.

© ${new Date().getFullYear()} Field Track LLC. All rights reserved.
`;
