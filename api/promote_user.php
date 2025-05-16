<?php
header("Content-Type: application/json");
$input = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli("localhost", "submitter", "yourpassword", "user_auth");
$stmt = $conn->prepare("UPDATE users SET role = 'admin' WHERE id = ?");
$stmt->bind_param("i", $input['user_id']);
$stmt->execute();
echo json_encode(["message" => "User promoted"]);
