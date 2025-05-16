<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "submitter", "yourpassword", "user_auth");
$result = $conn->query("SELECT word FROM banned_words ORDER BY word ASC");
$words = [];
while ($row = $result->fetch_assoc()) {
  $words[] = $row['word'];
}
echo json_encode($words);
