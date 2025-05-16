<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "submitter", "yourpassword", "user_auth");
$result = $conn->query("SELECT id, username, email, role FROM users ORDER BY id ASC");
$users = [];
while ($row = $result->fetch_assoc()) {
  $users[] = $row;
}
echo json_encode($users);
