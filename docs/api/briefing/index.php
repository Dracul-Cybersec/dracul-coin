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

if (empty($name) || empty($email) || empty($scope)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Campos obrigatórios ausentes']);
    exit;
}

// Log briefing to local file
$logEntry = sprintf(
    "[%s] IP: %s | Nome: %s | Email: %s | Escopo: %s\n",
    date('Y-m-d H:i:s'),
    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    $name,
    $email,
    str_replace(["\r", "\n"], ' ', $scope)
);
@file_put_contents('/var/www/html/briefings.log', $logEntry, FILE_APPEND | LOCK_EX);

// Attempt mail transmission
$to = 'support@draculcybersec.com';
$subject = "=?UTF-8?B?" . base64_encode("[Briefing Dracul Cybersec] $name ($email)") . "?=";
$message = "Novo briefing recebido via portal Dracul Cybersec:\n\n"
         . "Nome/Organização: " . $name . "\n"
         . "E-mail: " . $email . "\n"
         . "Data/Hora: " . date('Y-m-d H:i:s') . "\n"
         . "IP de Origem: " . ($_SERVER['REMOTE_ADDR'] ?? 'desconhecido') . "\n\n"
         . "Escopo e Alvo:\n"
         . "--------------------------------------------------\n"
         . $scope . "\n"
         . "--------------------------------------------------\n";

$headers = "From: briefing@draculcybersec.com\r\n"
         . "Reply-To: $email\r\n"
         . "X-Mailer: PHP/" . phpversion() . "\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($to, $subject, $message, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Briefing recebido e registrado com sucesso.'
]);
