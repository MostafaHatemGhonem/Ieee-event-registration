# 📧 Email Template Usage Guide

## Template Variables

Replace these placeholders when sending the email:

| Variable         | Description            | Example              |
| ---------------- | ---------------------- | -------------------- |
| `{{FULL_NAME}}`  | Full name (English)    | `Ahmed Mohamed Ali`  |
| `{{EMAIL}}`      | Email address          | `user@example.com`   |
| `{{NID}}`        | National ID            | `30112012345678`     |
| `{{PHONE}}`      | Phone number           | `01012345678`        |
| `{{EVENT_NAME}}` | Event name             | `IEEE Event 2025`    |
| `{{DATE}}`       | Registration date      | `2025-12-17`         |
| `{{QR_BASE64}}`  | QR code as base64 data | `iVBORw0KGgoAAAA...` |

---

## QR Code Generation

The QR code is sent as **base64-encoded image**:

```html
<img src="data:image/png;base64,{{QR_BASE64}}" alt="QR Code" />
```

**QR Data Format:** `IEEE-BSU-{NationalID}`

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
