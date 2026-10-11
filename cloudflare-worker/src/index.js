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

      // 5. Build Dracul Cybersec Red Team Briefing Layout
      const briefingLayout = [
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

      const subject = `[Briefing Red Team] ${name} (${email}) - IP: ${clientIp}`;
      const recipient = env.RECIPIENT_EMAIL || 'support@draculcybersec.com';

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
            to: recipient,
            replyTo: email,
            subject,
            text: briefingLayout
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
async function sendSmtpSocket({ host, port, user, pass, from, to, replyTo, subject, text }) {
  const socket = connect(
    { hostname: host, port },
    { secureTransport: port === 465 ? 'on' : 'starttls' }
  );

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function readReply() {
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      if (result.includes('\r\n') || result.includes('\n')) break;
    }
    return result.trim();
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
  reply = await sendCommand(`RCPT TO:<${to}>`);
  if (!reply.startsWith('250')) {
    throw new Error(`RCPT TO recusado: ${reply}`);
  }

  // 6. DATA
  reply = await sendCommand('DATA');
  if (!reply.startsWith('354')) {
    throw new Error(`DATA recusado: ${reply}`);
  }

  // Helper for UTF-8 Base64 subject
  const utf8Subject = btoa(unescape(encodeURIComponent(subject)));

  // 7. Message Content
  const mimeMessage = [
    `From: "Dracul Cybersec Briefing" <${from}>`,
    `To: <${to}>`,
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
