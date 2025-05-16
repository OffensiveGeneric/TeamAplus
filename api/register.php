<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['username'], $input['email'], $input['password'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$conn = new mysqli("localhost", 'submitter', 'V<$h(c', 'user_auth');
if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$username = $input['username'];
$email = $input['email'];
$password = password_hash($input['password'], PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $password);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["message" => "User registered"]);
} else {
    echo json_encode(["error" => "Registration failed"]);
}
?>
