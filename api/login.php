<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

// Enable PHP error logging for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read and decode input
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['email'], $input['password'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$email = $input['email'];
$password = $input['password'];

// Connect to MySQL
$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Query for user
$stmt = $conn->prepare("SELECT id, username, password_hash, credits, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
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

// Successful login
echo json_encode([
    "user" => [
        "id" => $user['id'],
        "username" => $user['username'],
        "credits" => $user['credits'],
        "role" => $user['role']
    ]
]);
?>
