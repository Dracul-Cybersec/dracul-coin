# Dracul Cybersec - Cloudflare Worker SMTP Mailer

Este Worker roda diretamente na **Edge da Cloudflare** de forma **100% gratuita**, capturando os envios do formulário de briefing de `draculcybersec.com`, formatando o layout Red Team com metadados (IP do remetente, data/hora e User-Agent) e disparando o e-mail via servidor SMTP autenticado para `support@draculcybersec.com`.

---

## Como Ativar no Cloudflare Dashboard (Método Visual em 2 minutos)

1. Acesse o [Painel da Cloudflare](https://dash.cloudflare.com/) e faça login.
2. No menu lateral, clique em **Compute (Workers) > Workers & Pages**.
3. Clique em **Create application** > **Create Worker**.
4. Defina o nome: `dracul-briefing-worker` e clique em **Deploy**.
5. Na página de confirmação, clique em **Edit code**.
6. Cole o conteúdo de [`src/index.js`](./src/index.js) substituindo todo o código padrão e clique em **Save and deploy**.

---

## Configurar as Variáveis / Segredos do SMTP

No painel do Worker recém-criado:
1. Vá na aba **Settings > Variables and Secrets**.
2. Adicione os seguintes segredos (Secrets):
   - `SMTP_HOST`: seu servidor SMTP (ex: `smtp.gmail.com` ou `mail.draculcybersec.com`)
   - `SMTP_PORT`: porta SMTP (recomendado: `465` para SSL direto)
   - `SMTP_USER`: seu usuário/e-mail SMTP
   - `SMTP_PASS`: sua senha SMTP ou App Password
   - `RECIPIENT_EMAIL`: `support@draculcybersec.com`

---

## Associar a Rota no Domínio `draculcybersec.com`

1. Vá na aba **Settings > Domains & Routes** no Worker.
2. Em **Routes**, clique em **Add route**:
   - **Route**: `draculcybersec.com/api/briefing*`
   - **Zone**: `draculcybersec.com`
3. Pronto! Qualquer requisição para `https://draculcybersec.com/api/briefing` será atendida automaticamente pelo Worker!
