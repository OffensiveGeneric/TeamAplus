<?php
header("Content-Type: application/json");
$input = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli("localhost", "submitter", "yourpassword", "user_auth");
$stmt = $conn->prepare("INSERT IGNORE INTO banned_words (word) VALUES (?)");
$stmt->bind_param("s", $input['word']);
$stmt->execute();
echo json_encode(["message" => "Banned word added"]);
