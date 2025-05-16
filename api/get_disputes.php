<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$query = "SELECT d.*, u.username FROM disputes d JOIN users u ON d.user_id = u.id WHERE d.status = 'pending' ORDER BY d.created_at DESC";
$result = $conn->query($query);

$disputes = [];
while ($row = $result->fetch_assoc()) {
    $disputes[] = $row;
}

echo json_encode($disputes);
