import json
import boto3
import os
import datetime

# Configuration
AWS_REGION = os.environ.get("SES_REGION", os.environ.get("AWS_REGION", "sa-east-1"))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "support@draculcybersec.com")
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", "support@draculcybersec.com")

ses_client = boto3.client("ses", region_name=AWS_REGION)

def lambda_handler(event, context):
    """
    AWS Lambda handler for Dracul Cybersec Offensive Briefing dispatch.
    Receives visitor briefing payload and transmits via AWS SES.
    """
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json"
    }

    # Handle CORS Preflight
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "")
    if http_method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"status": "ok"})
        }

    # Parse body
    raw_body = event.get("body", "{}")
    if event.get("isBase64Encoded", False):
        import base64
        try:
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        except Exception:
            pass

    try:
        data = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"success": False, "error": f"JSON inválido: {str(e)}"})
        }

    name = str(data.get("name") or data.get("nome") or "").strip()
    email = str(data.get("email") or "").strip()
    scope = str(data.get("scope") or data.get("escopo") or "").strip()

    if not name or not email or not scope:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"success": False, "error": "Campos obrigatórios ausentes (nome, email ou escopo)."})
        }

    # Capture metadata
    source_ip = (
        data.get("ip") or
        event.get("requestContext", {}).get("http", {}).get("sourceIp") or
        event.get("requestContext", {}).get("identity", {}).get("sourceIp") or
        event.get("headers", {}).get("x-forwarded-for", "N/D").split(",")[0].strip()
    )
    user_agent = data.get("userAgent") or event.get("headers", {}).get("user-agent", "N/D")
    timestamp = data.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).strftime("%d/%m/%Y %H:%M:%S UTC")

    # Build Red Team Briefing Layout
    email_subject = f"[Briefing Red Team] {name} ({email}) - IP: {source_ip}"
    email_body = f"""==================================================
       DRACUL CYBERSEC // BRIEFING RECEBIDO       
==================================================

▶ QUEM MANDOU:
  Nome / Organização: {name}
  E-mail de Contato:  {email}

▶ METADADOS DE ORIGEM:
  IP do Remetente:    {source_ip}
  Data e Hora:        {timestamp}
  Dispositivo:        {user_agent}

▶ ESCOPO E ALVOS DA AVALIAÇÃO:
--------------------------------------------------
{scope}
--------------------------------------------------

// Transmitido via Dracul Cybersec Offensive Terminal (AWS Cloud SES)
"""

    try:
        ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={"ToAddresses": [RECIPIENT_EMAIL]},
            Message={
                "Subject": {"Data": email_subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": email_body, "Charset": "UTF-8"}
                }
            },
            ReplyToAddresses=[email]
        )

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "success": True,
                "message": "Briefing transmitido com sucesso via AWS Cloud."
            })
        }
    except Exception as exc:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({
                "success": False,
                "error": f"Erro no serviço AWS SES: {str(exc)}"
            })
        }
