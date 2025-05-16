<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$result = $conn->query("SELECT id, username, email, credits FROM users ORDER BY id ASC");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
?>
