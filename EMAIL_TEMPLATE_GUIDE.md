# 📧 Email Template Usage Guide

## Template Variables

Replace these placeholders when sending the email:

| Variable               | Description        | Example                           |
| ---------------------- | ------------------ | --------------------------------- |
| `{{ATTENDEE_ID}}`      | Unique attendee ID | `demo-123`                        |
| `{{FULL_NAME_ARABIC}}` | Arabic full name   | `محمد أحمد علي`                   |
| `{{EMAIL}}`            | Email address      | `user@example.com`                |
| `{{FACULTY}}`          | Faculty/College    | `كلية الهندسة`                    |
| `{{PHONE}}`            | Phone number       | `01012345678`                     |
| `{{EVENT_DATE}}`       | Event date         | `15 ديسمبر 2025`                  |
| `{{EVENT_TIME}}`       | Event time         | `10:00 صباحاً`                    |
| `{{EVENT_LOCATION}}`   | Event location     | `قاعة المؤتمرات - جامعة بني سويف` |

---

## QR Code Generation

The QR code is generated using `api.qrserver.com`:

```html
<img
  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=IEEE-BSU-{{ATTENDEE_ID}}"
/>
```

**QR Data Format:** `IEEE-BSU-{attendee_id}`

---

## Backend Integration

### Example: Node.js (Express + Nodemailer)

```javascript
const nodemailer = require("nodemailer");
const fs = require("fs");

// Read template
const emailTemplate = fs.readFileSync("./email-template.html", "utf8");

// Send email function
async function sendApprovalEmail(attendee) {
  // Replace variables
  let emailHtml = emailTemplate
    .replace(/{{ATTENDEE_ID}}/g, attendee.id)
    .replace(/{{FULL_NAME_ARABIC}}/g, attendee.fullNameArabic)
    .replace(/{{EMAIL}}/g, attendee.email)
    .replace(/{{FACULTY}}/g, attendee.faculty)
    .replace(/{{PHONE}}/g, attendee.phone)
    .replace(/{{EVENT_DATE}}/g, "15 ديسمبر 2025")
    .replace(/{{EVENT_TIME}}/g, "10:00 صباحاً")
    .replace(/{{EVENT_LOCATION}}/g, "قاعة المؤتمرات - جامعة بني سويف");

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: "IEEE Beni-Suef <noreply@ieeebsu.org>",
    to: attendee.email,
    subject: "🎉 تأكيد التسجيل - IEEE Beni-Suef Event",
    html: emailHtml,
  };

  // Send email
  await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${attendee.email}`);
}

// Usage
const attendee = {
  id: "123",
  fullNameArabic: "محمد أحمد علي",
  email: "mohamed@example.com",
  faculty: "كلية الهندسة",
  phone: "01012345678",
};

sendApprovalEmail(attendee);
```

### Example: .NET (C# + MailKit)

```csharp
using MailKit.Net.Smtp;
using MimeKit;

public async Task SendApprovalEmail(Attendee attendee)
{
    // Read template
    var template = File.ReadAllText("email-template.html");

    // Replace variables
    var emailHtml = template
        .Replace("{{ATTENDEE_ID}}", attendee.Id)
        .Replace("{{FULL_NAME_ARABIC}}", attendee.FullNameArabic)
        .Replace("{{EMAIL}}", attendee.Email)
        .Replace("{{FACULTY}}", attendee.Faculty)
        .Replace("{{PHONE}}", attendee.Phone)
        .Replace("{{EVENT_DATE}}", "15 ديسمبر 2025")
        .Replace("{{EVENT_TIME}}", "10:00 صباحاً")
        .Replace("{{EVENT_LOCATION}}", "قاعة المؤتمرات - جامعة بني سويف");

    // Create email
    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("IEEE Beni-Suef", "noreply@ieeebsu.org"));
    message.To.Add(new MailboxAddress(attendee.FullNameArabic, attendee.Email));
    message.Subject = "🎉 تأكيد التسجيل - IEEE Beni-Suef Event";

    var bodyBuilder = new BodyBuilder();
    bodyBuilder.HtmlBody = emailHtml;
    message.Body = bodyBuilder.ToMessageBody();

    // Send email
    using var client = new SmtpClient();
    await client.ConnectAsync("smtp.gmail.com", 587, false);
    await client.AuthenticateAsync("your-email@gmail.com", "your-password");
    await client.SendAsync(message);
    await client.DisconnectAsync(true);

    Console.WriteLine($"✅ Email sent to {attendee.Email}");
}
```

---

## Testing the Template

### Option 1: Preview in Browser

1. Open `email-template.html` directly in browser
2. Manually replace variables to see how it looks

### Option 2: Online Email Testing Tools

- [Litmus](https://litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Mailtrap](https://mailtrap.io/)

### Option 3: Send Test Email

```javascript
// Quick test
sendApprovalEmail({
  id: "TEST-123",
  fullNameArabic: "اسم تجريبي",
  email: "your-email@gmail.com",
  faculty: "كلية الهندسة",
  phone: "01234567890",
});
```

---

## Customization

### Update Logo

Replace line in `<div class="header">`:

```html
<img src="https://your-domain.com/ieee-logo.png" alt="IEEE Logo" />
```

### Change Colors

Edit CSS variables in `<style>`:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success badge */
background-color: #10b981;

/* QR section background */
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
```

### Add Event Logo/Banner

Insert before content:

```html
<div style="text-align: center; padding: 20px;">
  <img
    src="https://your-domain.com/event-banner.jpg"
    alt="Event"
    style="max-width: 100%;"
  />
</div>
```

---

## Email Providers Compatibility

✅ **Tested on:**

- Gmail
- Outlook
- Yahoo Mail
- Apple Mail
- Mobile clients (iOS/Android)

⚠️ **Note:** Some email clients may block external images. Consider:

- Embedding QR as base64
- Storing QR as attachment
- Using a reliable CDN

---

## QR Code Alternatives

### Option 1: QR Server API (Current)

```html
<img
  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=IEEE-BSU-{{ATTENDEE_ID}}"
/>
```

###Option 2: Generate and Attach

```javascript
const QRCode = require('qrcode');

// Generate QR as buffer
const qrBuffer = await QRCode.toBuffer(`IEEE-BSU-${attendee.id}`);

// Attach to email
mailOptions.attachments = [{
  filename: 'qr-code.png',
  content: qrBuffer,
  cid: 'qrcode@ieee'
}];

// Reference in HTML
<img src="cid:qrcode@ieee">
```

### Option 3: Base64 Embed

```javascript
const qrBase64 = await QRCode.toDataURL(`IEEE-BSU-${attendee.id}`);

// In template
<img src="${qrBase64}">
```

---

## Deployment Checklist

- [ ] Replace all `{{VARIABLES}}` with actual data
- [ ] Update event details (date, time, location)
- [ ] Add real IEEE logo URL
- [ ] Configure SMTP settings
- [ ] Test with different email clients
- [ ] Verify QR code scans correctly
- [ ] Check mobile responsiveness
- [ ] Add unsubscribe link (if required)
- [ ] Ensure GDPR compliance

---

## Support

For questions or issues, contact the backend team to integrate this template with the approval workflow.
