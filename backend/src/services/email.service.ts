import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? 'LootRadar <onboarding@resend.dev>';
const siteUrl = process.env.SITE_URL ?? 'http://localhost:5173';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isEmailConfigured(): boolean {
  return !!resendApiKey;
}

export async function sendVerificationEmail(
  to: string,
  username: string,
  token: string
): Promise<{ ok: boolean; verificationLink?: string; error?: string }> {
  const verificationLink = `${siteUrl.replace(/\/$/, '')}/confirmar-email?token=${encodeURIComponent(token)}`;

  if (!resend) {
    return { ok: false, verificationLink, error: 'Email não configurado (RESEND_API_KEY)' };
  }

  try {
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: 'Confirma o teu email - LootRadar',
      html: `
        <p>Olá <strong>${escapeHtml(username)}</strong>,</p>
        <p>Obrigado por te registares no LootRadar. Clica no link abaixo para confirmares o teu email e ativares a conta:</p>
        <p><a href="${escapeHtml(verificationLink)}" style="color: #3b82f6;">Confirmar email</a></p>
        <p>Ou copia e cola no browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${escapeHtml(verificationLink)}</p>
        <p>Este link expira em 24 horas. Se não criaste esta conta, podes ignorar este email.</p>
        <p>— LootRadar</p>
      `,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar email';
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
