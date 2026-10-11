<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$name = trim($input['name'] ?? $input['nome'] ?? '');
$email = trim($input['email'] ?? '');
$scope = trim($input['scope'] ?? $input['escopo'] ?? '');
$ip = trim($input['ip'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Desconhecido');
$userAgent = trim($input['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Desconhecido');
$date = date('d/m/Y H:i:s');

if (empty($name) || empty($email) || empty($scope)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Campos obrigatórios ausentes']);
    exit;
}

// Log briefing to local file
$logEntry = sprintf(
    "[%s] IP: %s | Nome: %s | Email: %s | Escopo: %s\n",
    date('Y-m-d H:i:s'),
    $ip,
    $name,
    $email,
    str_replace(["\r", "\n"], ' ', $scope)
);
@file_put_contents('/var/www/html/briefings.log', $logEntry, FILE_APPEND | LOCK_EX);

// Build structured layout email
$to = 'support@draculcybersec.com';
$subject = "=?UTF-8?B?" . base64_encode("[Briefing Red Team] $name ($email) - IP: $ip") . "?=";

$message = "==================================================\n"
         . "       DRACUL CYBERSEC // BRIEFING RECEBIDO       \n"
         . "==================================================\n\n"
         . "▶ QUEM MANDOU:\n"
         . "  Nome / Organização: " . $name . "\n"
         . "  E-mail de Contato:  " . $email . "\n\n"
         . "▶ METADADOS DE ORIGEM:\n"
         . "  IP do Remetente:    " . $ip . "\n"
         . "  Data e Hora:        " . $date . "\n"
         . "  Dispositivo:        " . $userAgent . "\n\n"
         . "▶ ESCOPO E ALVOS DA AVALIAÇÃO:\n"
         . "--------------------------------------------------\n"
         . $scope . "\n"
         . "--------------------------------------------------\n\n"
         . "// Transmitido via Dracul Cybersec Offensive Terminal\n";

$headers = "From: briefing@draculcybersec.com\r\n"
         . "Reply-To: $email\r\n"
         . "X-Mailer: DraculCybersec-Mailer/1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($to, $subject, $message, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Briefing recebido e registrado com sucesso.'
]);
