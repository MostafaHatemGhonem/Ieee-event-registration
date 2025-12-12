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

The backend team needs to:

1. Read the `email-template.html` file
2. Replace all `{{VARIABLES}}` with actual attendee data
3. Configure SMTP settings (Gmail, SendGrid, or any email service)
4. Send the email when approving an attendee registration

---

## Testing the Template

### Preview in Browser

Open `email-template.html` directly in your browser to see how it looks.

### Online Email Testing Tools

- [Litmus](https://litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Mailtrap](https://mailtrap.io/)

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
