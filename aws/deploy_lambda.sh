#!/usr/bin/env bash
set -euo pipefail

# Dracul Cybersec - AWS Lambda Function URL Deployer
# Automatically packages and creates/updates the Lambda function for briefing dispatch.

REGION="${AWS_REGION:-sa-east-1}"
FUNCTION_NAME="dracul-briefing-mailer"
ROLE_NAME="dracul-briefing-lambda-role"

echo "[+] Verificando AWS CLI..."
if ! command -v aws &>/dev/null; then
  echo "[-] AWS CLI não instalado." >&2
  exit 1
fi

echo "[+] Empacotando função Lambda..."
TMP_DIR=$(mktemp -d)
cp "$(dirname "$0")/lambda_function.py" "$TMP_DIR/lambda_function.py"
(cd "$TMP_DIR" && zip -q -9 lambda.zip lambda_function.py)

echo "[+] Verificando se a função existe no AWS Lambda ($REGION)..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
  echo "[+] Atualizando código da função existente..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$TMP_DIR/lambda.zip" \
    --region "$REGION" >/dev/null
else
  echo "[+] Criando Role IAM se necessário..."
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || true)
  if [[ -z "$ROLE_ARN" || "$ROLE_ARN" == "None" ]]; then
    ASSUME_ROLE_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
    ROLE_ARN=$(aws iam create-role \
      --role-name "$ROLE_NAME" \
      --assume-role-policy-document "$ASSUME_ROLE_POLICY" \
      --query 'Role.Arn' --output text)
    aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
    echo "[+] Aguardando propagação da role (10s)..."
    sleep 10
  fi

  echo "[+] Criando função Lambda $FUNCTION_NAME..."
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime python3.11 \
    --role "$ROLE_ARN" \
    --handler lambda_function.lambda_handler \
    --zip-file "fileb://$TMP_DIR/lambda.zip" \
    --region "$REGION" >/dev/null
fi

echo "[+] Configurando Function URL pública com CORS..."
URL_CONFIG=$(aws lambda create-function-url-config \
  --function-name "$FUNCTION_NAME" \
  --auth-type NONE \
  --cors '{"AllowOrigins":["*"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["Content-Type","Authorization"]}' \
  --region "$REGION" 2>/dev/null || \
  aws lambda get-function-url-config --function-name "$FUNCTION_NAME" --region "$REGION")

FUNCTION_URL=$(echo "$URL_CONFIG" | jq -r '.FunctionUrl')

echo "[+] Concedendo permissão de invocação pública para a URL..."
aws lambda add-permission \
  --function-name "$FUNCTION_NAME" \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --region "$REGION" 2>/dev/null || true

rm -rf "$TMP_DIR"

echo "================================================================="
echo "[✓] DEPLOY CONCLUÍDO COM SUCESSO!"
echo "URL do Endpoint AWS Lambda: $FUNCTION_URL"
echo "Para ativar no frontend, adicione no HTML ou script.js:"
echo "window.DRACUL_AWS_ENDPOINT = '$FUNCTION_URL';"
echo "================================================================="
