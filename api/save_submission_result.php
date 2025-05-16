<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'], $input['action'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$user_id = (int)$input['user_id'];
$action = $input['action'];

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// Fetch user
$stmt = $conn->prepare("SELECT credits FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

$current_credits = (int)$user['credits'];
$cost = 0;

// Action handling
switch ($action) {
    case 'accept':
    case 'reject':
        $cost = 1;
        break;

    case 'download':
        $cost = 5;
        break;

    case 'dispute':
        if (!isset($input['reason'], $input['index'])) {
            echo json_encode(["error" => "Missing dispute data"]);
            exit;
        }

        $index = (int)$input['index'];
        $reason = $conn->real_escape_string($input['reason']);

        // Insert dispute record
        $stmt = $conn->prepare("INSERT INTO disputes (user_id, correction_index, reason) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $user_id, $index, $reason);
        $stmt->execute();

        echo json_encode(["message" => "Dispute logged. Awaiting admin review."]);
        exit;

    default:
        echo json_encode(["error" => "Invalid action"]);
        exit;
}

if ($current_credits < $cost) {
    echo json_encode(["error" => "Not enough credits"]);
    exit;
}

$new_credits = $current_credits - $cost;

$update = $conn->prepare("UPDATE users SET credits = ? WHERE id = ?");
$update->bind_param("ii", $new_credits, $user_id);
$update->execute();

echo json_encode([
    "message" => "Action '$action' processed.",
    "credits_deducted" => $cost,
    "new_balance" => $new_credits
]);
