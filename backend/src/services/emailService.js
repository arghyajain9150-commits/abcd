import nodemailer from 'nodemailer';

// ── Transport setup ────────────────────────────────────────────────
// Using Resend SMTP (free 3000 emails/month)
// Alternative: replace host/port/auth with Gmail SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

const FROM = process.env.EMAIL_FROM || 'noreply@campus.edu';

// ── Appointment Confirmation ───────────────────────────────────────
export async function sendAppointmentConfirmation({
  to, studentName, doctorName, specialty, slotTime, slotDate, queuePos,
}) {
  const formattedDate = new Date(slotDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#F5F7F3;border-radius:16px;">
      <div style="background:#2F7A68;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">CHAMP</h1>
        <p style="color:#E4EFEA;margin:4px 0 0;font-size:13px;">Campus Health Management Platform</p>
      </div>

      <h2 style="color:#17322C;font-size:18px;">Appointment Confirmed ✅</h2>
      <p style="color:#5B7169;">Hi <strong>${studentName}</strong>, your appointment has been booked!</p>

      <div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #E1E3DA;margin:16px 0;">
        <p style="margin:0 0 8px;color:#17322C;"><strong>Doctor:</strong> ${doctorName}</p>
        <p style="margin:0 0 8px;color:#17322C;"><strong>Specialty:</strong> ${specialty}</p>
        <p style="margin:0 0 8px;color:#17322C;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px;color:#17322C;"><strong>Time:</strong> ${slotTime}</p>
        <p style="margin:0;background:#E4EFEA;display:inline-block;padding:4px 12px;border-radius:999px;color:#2F7A68;font-weight:600;">Queue Position: #${queuePos}</p>
      </div>

      <p style="color:#5B7169;font-size:13px;">📍 Campus Health Centre, Block A, Ground Floor</p>
      <p style="color:#5B7169;font-size:13px;">You'll receive a reminder 30 minutes before your slot.</p>

      <hr style="border:none;border-top:1px solid #E1E3DA;margin:20px 0;" />
      <p style="color:#5B7169;font-size:11px;text-align:center;">CHAMP · Campus Health Management Platform</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Appointment Confirmed — ${doctorName} at ${slotTime}`,
    html,
  });
}

// ── 30-min Reminder ───────────────────────────────────────────────
export async function sendReminderEmail({
  to, studentName, doctorName, slotTime, queuePos,
}) {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="color:#17322C;">⏰ Reminder: Your appointment is in 30 minutes</h2>
      <p>Hi <strong>${studentName}</strong>, just a reminder!</p>
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Time:</strong> ${slotTime}</p>
      <p><strong>Queue Position:</strong> #${queuePos}</p>
      <p style="color:#5B7169;">Please head to the Campus Health Centre, Block A, Ground Floor.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Reminder: Appointment with ${doctorName} in 30 minutes`,
    html,
  });
}

// ── Cancellation Email ────────────────────────────────────────────
export async function sendCancellationEmail({
  to, studentName, doctorName, slotTime, slotDate,
}) {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="color:#D6483C;">Appointment Cancelled</h2>
      <p>Hi <strong>${studentName}</strong>, your appointment has been cancelled.</p>
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Time:</strong> ${slotTime} on ${slotDate}</p>
      <p style="color:#5B7169;">You can book a new appointment anytime through CHAMP.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Appointment Cancelled — ${doctorName}`,
    html,
  });
}
