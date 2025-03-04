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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Field Track LLC Inquiry</h2>
    </div>
    <div class="content">
      <p>A new inquiry has been submitted through the website contact form. Details are below:</p>
      
      <p><span class="label">Name:</span> ${name}</p>
      <p><span class="label">Email:</span> ${email}</p>
      ${phone ? `<p><span class="label">Phone:</span> ${phone}</p>` : ''}
      
      <p><span class="label">Message & Requirements:</span></p>
      <div class="message-box">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p style="margin-top: 25px;">This inquiry may be regarding precision agriculture services, field data analysis, or other agricultural technology needs.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Field Track LLC. All rights reserved.
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

© ${new Date().getFullYear()} Field Track LLC
`; 