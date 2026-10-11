/**
 * DRACUL CYBERSEC // CLOUDFLARE WORKER SMTP MAILER
 * 
 * Intercepts briefing form submissions at the Cloudflare Edge,
 * captures visitor IP & metadata, formats the Red Team layout,
 * and delivers the briefing via authenticated SMTP directly to support@draculcybersec.com.
 */

import { connect } from 'cloudflare:sockets';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // 2. Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Método não permitido.' }), {
        status: 405,
        headers: CORS_HEADERS
      });
    }

    try {
      // 3. Parse JSON Body
      const data = await request.json().catch(() => ({}));
      const name = String(data.name || data.nome || '').trim();
      const email = String(data.email || '').trim();
      const scope = String(data.scope || data.escopo || '').trim();

      if (!name || !email || !scope) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Campos obrigatórios ausentes: nome, e-mail e escopo são necessários.'
        }), {
          status: 400,
          headers: CORS_HEADERS
        });
      }

      // 4. Capture Client IP & Metadata from Cloudflare edge headers
      const clientIp = request.headers.get('cf-connecting-ip') ||
                       request.headers.get('x-real-ip') ||
                       data.ip ||
                       'Desconhecido';

      const userAgent = request.headers.get('user-agent') || data.userAgent || 'Desconhecido';
      const country = request.cf?.country || 'N/D';
      const city = request.cf?.city || 'N/D';
      const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

      // 5. Build Dracul Cybersec Red Team Briefing Layouts (Text & HTML)
      const textLayout = [
        '==================================================',
        '       DRACUL CYBERSEC // BRIEFING RECEBIDO       ',
        '==================================================',
        '',
        '▶ QUEM MANDOU:',
        `  Nome / Organização: ${name}`,
        `  E-mail de Contato:  ${email}`,
        '',
        '▶ METADADOS DE ORIGEM:',
        `  IP do Remetente:    ${clientIp}`,
        `  Localização:        ${city}, ${country} (Edge Cloudflare)`,
        `  Data e Hora:        ${timestamp} (Brasília)`,
        `  Dispositivo:        ${userAgent}`,
        '',
        '▶ ESCOPO E ALVOS DA AVALIAÇÃO:',
        '--------------------------------------------------',
        scope,
        '--------------------------------------------------',
        '',
        '// Transmitido via Dracul Cybersec Offensive Terminal (Cloudflare Worker SMTP)'
      ].join('\n');

      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeScope = escapeHtml(scope);
      const safeIp = escapeHtml(clientIp);
      const safeLoc = escapeHtml(`${city}, ${country} (Edge Cloudflare)`);
      const safeTime = escapeHtml(`${timestamp} (Brasília)`);
      const safeAgent = escapeHtml(userAgent);

      const htmlLayout = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dracul Cybersec // Briefing Recebido</title>
</head>
<body style="margin:0; padding:24px 0; background-color:#07070a; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:620px; background-color:#0f0f15; border:1px solid rgba(229, 9, 20, 0.4); border-top:4px solid #e50914; border-radius:8px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.85);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding:28px 24px 20px 24px; text-align:center; background:linear-gradient(180deg, rgba(229, 9, 20, 0.08) 0%, rgba(15, 15, 21, 0) 100%); border-bottom:1px solid rgba(255, 255, 255, 0.06);">
              <img src="https://draculcybersec.com/assets/dracul-brand-mark.png" alt="Dracul Cybersec" width="72" height="72" style="display:inline-block; border:0; outline:none; margin-bottom:12px;" />
              <div style="font-size:19px; font-weight:700; letter-spacing:2px; color:#ffffff; text-transform:uppercase;">
                DRACUL <span style="color:#e50914;">CYBERSEC</span>
              </div>
              <div style="font-size:11px; letter-spacing:1.5px; color:#a1a1aa; text-transform:uppercase; margin-top:4px;">
                Offensive Operations // Briefing Recebido
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:24px;">
              
              <!-- Section: Solicitante -->
              <div style="font-size:12px; font-weight:700; letter-spacing:1.5px; color:#e50914; text-transform:uppercase; margin-bottom:8px;">
                ▶ QUEM MANDOU
              </div>
              <table role="presentation" width="100%" style="background-color:#14141d; border:1px solid rgba(255, 255, 255, 0.05); border-radius:6px; margin-bottom:20px; font-size:14px;" cellspacing="0" cellpadding="10">
                <tr>
                  <td width="32%" style="color:#a1a1aa; border-bottom:1px solid rgba(255, 255, 255, 0.04);">Nome / Organização:</td>
                  <td style="color:#ffffff; font-weight:600; border-bottom:1px solid rgba(255, 255, 255, 0.04);">${safeName}</td>
                </tr>
                <tr>
                  <td style="color:#a1a1aa;">E-mail de Contato:</td>
                  <td><a href="mailto:${safeEmail}" style="color:#e50914; text-decoration:none; font-weight:600;">${safeEmail}</a></td>
                </tr>
              </table>

              <!-- Section: Metadados -->
              <div style="font-size:12px; font-weight:700; letter-spacing:1.5px; color:#e50914; text-transform:uppercase; margin-bottom:8px;">
                ▶ METADADOS DE ORIGEM
              </div>
              <table role="presentation" width="100%" style="background-color:#14141d; border:1px solid rgba(255, 255, 255, 0.05); border-radius:6px; margin-bottom:20px; font-size:13px;" cellspacing="0" cellpadding="8">
                <tr>
                  <td width="32%" style="color:#a1a1aa; border-bottom:1px solid rgba(255, 255, 255, 0.04);">IP do Remetente:</td>
                  <td style="border-bottom:1px solid rgba(255, 255, 255, 0.04);"><code style="background:#1c1c28; color:#4ade80; padding:2px 6px; border-radius:4px; font-family:monospace;">${safeIp}</code></td>
                </tr>
                <tr>
                  <td style="color:#a1a1aa; border-bottom:1px solid rgba(255, 255, 255, 0.04);">Data e Hora:</td>
                  <td style="color:#e4e4e7; border-bottom:1px solid rgba(255, 255, 255, 0.04);">${safeTime}</td>
                </tr>
                <tr>
                  <td style="color:#a1a1aa;">Dispositivo:</td>
                  <td style="color:#71717a; font-size:11px;">${safeAgent}</td>
                </tr>
              </table>

              <!-- Section: Escopo -->
              <div style="font-size:12px; font-weight:700; letter-spacing:1.5px; color:#e50914; text-transform:uppercase; margin-bottom:8px;">
                ▶ ESCOPO E ALVOS DA AVALIAÇÃO
              </div>
              <div style="background-color:#14141d; border:1px solid rgba(255, 255, 255, 0.05); border-left:3px solid #e50914; border-radius:6px; padding:14px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size:13px; line-height:1.5; color:#f4f4f5; white-space:pre-wrap; margin-bottom:20px;">${safeScope}</div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px; text-align:center; background-color:#0b0b10; border-top:1px solid rgba(255, 255, 255, 0.05); font-size:11px; color:#71717a;">
              Transmitido com criptografia via Dracul Cybersec Offensive Terminal<br />
              <a href="https://draculcybersec.com" style="color:#a1a1aa; text-decoration:none;">draculcybersec.com</a> · support@draculcybersec.com
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const subject = `[Briefing Red Team] ${name} (${email}) - IP: ${clientIp}`;
      const defaultRecipients = ['support@draculcybersec.com', 'fabiomonteiroutawa@gmail.com'];
      const recipients = env.RECIPIENT_EMAIL
        ? env.RECIPIENT_EMAIL.split(',').map(s => s.trim()).filter(Boolean)
        : defaultRecipients;

      // 6. Attempt Delivery via SMTP Sockets or Configured Provider
      let dispatched = false;
      let lastError = null;

      // Method A: Direct SMTP via cloudflare:sockets (e.g. Gmail, Spaceship, custom SMTP)
      const smtpHost = env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(env.SMTP_PORT || '465', 10);
      const smtpUser = env.SMTP_USER || '';
      const smtpPass = env.SMTP_PASS || '';
      const smtpFrom = env.SMTP_FROM || smtpUser || 'support@draculcybersec.com';

      if (smtpUser && smtpPass) {
        try {
          await sendSmtpSocket({
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
            to: recipients,
            replyTo: email,
            subject,
            text: textLayout,
            html: htmlLayout
          });
          dispatched = true;
        } catch (smtpErr) {
          lastError = smtpErr?.message || String(smtpErr);
          console.error('SMTP Socket Error:', smtpErr);
        }
      }

      // Method B: Resend API (if RESEND_API_KEY is configured)
      if (!dispatched && env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: env.RESEND_FROM || 'Dracul Briefing <onboarding@resend.dev>',
              to: [recipient],
              reply_to: email,
              subject,
              text: briefingLayout
            })
          });
          if (resendRes.ok) {
            dispatched = true;
          } else {
            const errBody = await resendRes.text();
            lastError = `Resend API error: ${errBody}`;
          }
        } catch (resendErr) {
          lastError = resendErr?.message || String(resendErr);
        }
      }

      // Method C: Brevo API (if BREVO_API_KEY is configured)
      if (!dispatched && env.BREVO_API_KEY) {
        try {
          const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sender: { name: 'Dracul Briefing', email: env.BREVO_FROM || 'support@draculcybersec.com' },
              to: [{ email: recipient }],
              replyTo: { email: email, name: name },
              subject,
              textContent: briefingLayout
            })
          });
          if (brevoRes.ok) {
            dispatched = true;
          } else {
            const errBody = await brevoRes.text();
            lastError = `Brevo API error: ${errBody}`;
          }
        } catch (brevoErr) {
          lastError = brevoErr?.message || String(brevoErr);
        }
      }

      if (dispatched) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Briefing transmitido com sucesso via servidor Cloudflare.'
        }), {
          status: 200,
          headers: CORS_HEADERS
        });
      }

      // If no credentials configured yet, return clear guidance
      if (!smtpUser && !env.RESEND_API_KEY && !env.BREVO_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Servidor SMTP não configurado. Defina SMTP_USER e SMTP_PASS nas variáveis do Worker.'
        }), {
          status: 503,
          headers: CORS_HEADERS
        });
      }

      return new Response(JSON.stringify({
        success: false,
        error: lastError || 'Falha na transmissão do e-mail via servidor SMTP.'
      }), {
        status: 502,
        headers: CORS_HEADERS
      });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err?.message || 'Erro interno no processamento do briefing.'
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }
};

/**
 * Direct SMTP client over Cloudflare Workers TCP sockets.
 * Connects via SSL/TLS on port 465, authenticates, and dispatches the message.
 */
async function sendSmtpSocket({ host, port, user, pass, from, to, replyTo, subject, text, html }) {
  const socket = connect(
    { hostname: host, port },
    { secureTransport: port === 465 ? 'on' : 'starttls' }
  );

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = '';
  async function readReply() {
    while (true) {
      const lines = buffer.split(/\r?\n/);
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (/^\d{3} /.test(line) || /^\d{3}$/.test(line)) {
          const reply = lines.slice(0, i + 1).join('\n').trim();
          buffer = lines.slice(i + 1).join('\n');
          return reply;
        }
      }
      const { value, done } = await reader.read();
      if (done) {
        const reply = buffer.trim();
        buffer = '';
        return reply;
      }
      buffer += decoder.decode(value, { stream: true });
    }
  }

  async function sendCommand(cmd) {
    await writer.write(encoder.encode(cmd + '\r\n'));
    return await readReply();
  }

  // 1. Receive Greeting
  let reply = await readReply();
  if (!reply.startsWith('220')) {
    throw new Error(`Saudação SMTP falhou: ${reply}`);
  }

  // 2. EHLO
  reply = await sendCommand('EHLO draculcybersec.com');
  if (!reply.startsWith('250')) {
    throw new Error(`EHLO falhou: ${reply}`);
  }

  // 3. AUTH LOGIN
  reply = await sendCommand('AUTH LOGIN');
  if (!reply.startsWith('334')) {
    throw new Error(`AUTH LOGIN falhou: ${reply}`);
  }

  // Username (Base64)
  reply = await sendCommand(btoa(user));
  if (!reply.startsWith('334')) {
    throw new Error(`Usuário SMTP recusado: ${reply}`);
  }

  // Password (Base64)
  reply = await sendCommand(btoa(pass));
  if (!reply.startsWith('235')) {
    throw new Error(`Senha/Autenticação SMTP recusada: ${reply}`);
  }

  // 4. MAIL FROM
  reply = await sendCommand(`MAIL FROM:<${from}>`);
  if (!reply.startsWith('250')) {
    throw new Error(`MAIL FROM recusado: ${reply}`);
  }

  // 5. RCPT TO
  const targetList = Array.isArray(to) ? to : String(to).split(',').map(s => s.trim()).filter(Boolean);
  for (const rcpt of targetList) {
    reply = await sendCommand(`RCPT TO:<${rcpt}>`);
    if (!reply.startsWith('250')) {
      throw new Error(`RCPT TO recusado para ${rcpt}: ${reply}`);
    }
  }

  // 6. DATA
  reply = await sendCommand('DATA');
  if (!reply.startsWith('354')) {
    throw new Error(`DATA recusado: ${reply}`);
  }

  // Helper for UTF-8 Base64 subject
  const utf8Subject = btoa(unescape(encodeURIComponent(subject)));
  const toHeader = targetList.map(r => `<${r}>`).join(', ');

  // 7. Message Content (Multipart/alternative if HTML is provided)
  let mimeMessage;
  if (html) {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    mimeMessage = [
      `From: "Dracul Cybersec Briefing" <${from}>`,
      `To: ${toHeader}`,
      `Reply-To: <${replyTo || from}>`,
      `Subject: =?UTF-8?B?${utf8Subject}?=`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      `X-Mailer: DraculCybersec-Worker/1.0`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      '',
      text,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      '',
      html,
      '',
      `--${boundary}--`,
      '.'
    ].join('\r\n');
  } else {
    mimeMessage = [
      `From: "Dracul Cybersec Briefing" <${from}>`,
      `To: ${toHeader}`,
      `Reply-To: <${replyTo || from}>`,
      `Subject: =?UTF-8?B?${utf8Subject}?=`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      `X-Mailer: DraculCybersec-Worker/1.0`,
      '',
      text,
      '.'
    ].join('\r\n');
  }

  reply = await sendCommand(mimeMessage);
  if (!reply.startsWith('250')) {
    throw new Error(`Corpo da mensagem recusado: ${reply}`);
  }

  // 8. QUIT
  await sendCommand('QUIT');
  try {
    await reader.cancel();
    await writer.close();
  } catch {}

  return true;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
