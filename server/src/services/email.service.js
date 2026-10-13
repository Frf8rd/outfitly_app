// Trimite emailuri prin Resend (același serviciu ca pe site). Fără RESEND_API_KEY (dev) doar afișează în consolă.
export async function sendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[EMAIL dev] către ${to} | ${subject}\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Stilora <onboarding@resend.dev>", to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export const sendResetCodeEmail = (user, code) =>
  sendEmail({
    to: user.email,
    subject: "Stilora — codul tău de resetare a parolei",
    text: `Salut ${user.name}, codul tău de resetare este ${code}. E valabil 10 minute.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:28px;border-radius:16px;background:#fff;border:1px solid #E6DDFB">
      <h2 style="color:#9B7EDE;margin:0 0 12px">🎀 Stilora</h2>
      <p>Salut <strong>${esc(user.name)}</strong>,</p>
      <p>Introdu codul de mai jos în aplicație pentru a-ți seta o parolă nouă:</p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#2a201d;margin:18px 0">${code}</p>
      <p style="color:#888;font-size:13px">Codul e valabil 10 minute. Dacă nu ai cerut tu resetarea, ignoră acest email.</p></div>`,
  });
