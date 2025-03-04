export const generateNotificationEmail = (name: string, email: string, phone: string | undefined, message: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission | Field Track LLC</title>
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
    .content { 
      padding: 30px; 
      background-color: #ffffff;
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
    }
    .message-box { 
      background-color: #f9f9f9; 
      padding: 20px; 
      border-radius: 4px; 
      margin-top: 15px;
      border-left: 4px solid #0e4426;
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
    .label {
      font-weight: bold;
      color: #0e4426;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Field Track LLC Inquiry</h2>
    </div>
    <div class="content">
      <p>A new inquiry has been submitted through the website contact form. Details are below:</p>
      
      <div class="info-section">
        <div class="info-item">
          <span class="label">Name:</span> ${name}
        </div>
        <div class="info-item">
          <span class="label">Email:</span> ${email}
        </div>
        ${phone ? `<div class="info-item"><span class="label">Phone:</span> ${phone}</div>` : ''}
      </div>
      
      <div class="info-item">
        <span class="label">Message & Requirements:</span>
      </div>
      <div class="message-box">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p style="margin-top: 25px;">This inquiry may be regarding precision agriculture services, field data analysis, or other agricultural technology needs.</p>
      
      <p style="margin-top: 15px; font-size: 14px; color: #666666; text-align: right;">
        Received: ${new Date().toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
    <div class="footer">
      <p>This is an automated notification from the Field Track LLC website.</p>
      <p>&copy; ${new Date().getFullYear()} Field Track LLC. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const generateNotificationEmailText = (name: string, email: string, phone: string | undefined, message: string) => `
NEW FIELD TRACK LLC INQUIRY

A new inquiry has been submitted through the website contact form.

Name: ${name}
Email: ${email}${phone ? `\nPhone: ${phone}` : ''}

Message & Requirements:
${message}

This inquiry may be regarding precision agriculture services, field data analysis, or other agricultural technology needs.

Received: ${new Date().toLocaleString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

This is an automated notification from the Field Track LLC website.
© ${new Date().getFullYear()} Field Track LLC. All rights reserved.
`; 