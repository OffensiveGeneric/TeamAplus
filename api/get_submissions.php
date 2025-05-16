<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'])) {
    echo json_encode(["error" => "Missing user_id"]);
    exit;
}

$user_id = $input['user_id'];

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Look up the user's role
$stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

$role = $user['role'];

// Admins see all submissions; others see only their own
if ($role === 'admin') {
    $query = "SELECT * FROM submissions ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
} else {
    $query = "SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

$submissions = [];
while ($row = $result->fetch_assoc()) {
    $submissions[] = $row;
}

echo json_encode($submissions);
