<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'], $input['credits'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$user_id = (int)$input['user_id'];
$credits_to_add = (int)$input['credits'];

if ($credits_to_add <= 0) {
    echo json_encode(["error" => "Invalid credit amount."]);
    exit;
}

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Update user credits
$stmt = $conn->prepare("UPDATE users SET credits = credits + ? WHERE id = ?");
$stmt->bind_param("ii", $credits_to_add, $user_id);
$stmt->execute();

// Get new total
$result = $conn->query("SELECT credits FROM users WHERE id = $user_id");
$row = $result->fetch_assoc();

echo json_encode([
    "message" => "$credits_to_add credits added.",
    "new_balance" => (int)$row['credits']
]);
