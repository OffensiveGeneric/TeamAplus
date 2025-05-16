<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['dispute_id'], $input['decision'])) {
    echo json_encode(["error" => "Missing data"]);
    exit;
}

$dispute_id = (int)$input['dispute_id'];
$decision = $input['decision'];

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// Get dispute info
$lookup = $conn->prepare("SELECT user_id FROM disputes WHERE id = ?");
$lookup->bind_param("i", $dispute_id);
$lookup->execute();
$result = $lookup->get_result();
$dispute = $result->fetch_assoc();

if (!$dispute) {
    echo json_encode(["error" => "Dispute not found"]);
    exit;
}

$user_id = $dispute['user_id'];
$cost = ($decision === 'accepted') ? 1 : 5;

// Deduct credits
$deduct = $conn->prepare("UPDATE users SET credits = credits - ? WHERE id = ?");
$deduct->bind_param("ii", $cost, $user_id);
$deduct->execute();

// Update dispute
$update = $conn->prepare("UPDATE disputes SET status = ? WHERE id = ?");
$update->bind_param("si", $decision, $dispute_id);
$update->execute();

echo json_encode(["message" => "Dispute $decision, $cost credits deducted."]);
