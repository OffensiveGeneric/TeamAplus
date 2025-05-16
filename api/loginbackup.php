<?php
header("Content-Type: application/json");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Step 1: Read input
$raw = file_get_contents("php://input");
file_put_contents("login_debug.log", $raw); // For double confirmation

$input = json_decode($raw, true);

if (!$input) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($input['email'], $input['password'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

// Step 2: Connect to DB
$conn = new mysqli("localhost", 'submitter', 'V<$h(c', 'user_auth');
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed: " . $conn->connect_error]);
    exit;
}

// Step 3: Query DB
$email = $input['email'];
$password = $input['password'];

$stmt = $conn->prepare("SELECT id, username, password_hash, credits, role FROM users WHERE email = ?");
if (!$stmt) {
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("s", $email);
if (!$stmt->execute()) {
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

if (!password_verify($password, $user['password_hash'])) {
    echo json_encode(["error" => "Invalid password"]);
    exit;
}

// Success
echo json_encode([
  "user" => [
    "id" => $user['id'],
    "username" => $user['username'],
    "credits" => $user['credits']
    "role" => $user['role']
  ]
]);
?>
