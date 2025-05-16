<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'])) {
    echo json_encode(["error" => "Missing user_id"]);
    exit;
}

$user_id = (int)$input['user_id'];

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, credits, role FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

echo json_encode(["user" => $user]);
