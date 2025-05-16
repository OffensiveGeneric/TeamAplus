<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require __DIR__ . '/vendor/autoload.php';

use OpenAI\Client;

$client = OpenAI::client('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');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'], $input['text'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$user_id = $input['user_id'];
$text = trim($input['text']);
$word_count = str_word_count($text);

// Connect to DB
$conn = new mysqli("localhost", "submitter", 'V<$h(c', "user_auth");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// Fetch user info
$stmt = $conn->prepare("SELECT credits FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

$current_credits = (int)$user['credits'];

// Not enough credits → reject and fine half
if ($current_credits < $word_count) {
    $fine = floor($current_credits / 2);
    $new_credits = $current_credits - $fine;

    $update = $conn->prepare("UPDATE users SET credits = ? WHERE id = ?");
    $update->bind_param("ii", $new_credits, $user_id);
    $update->execute();

    echo json_encode(["error" => "Not enough credits. You have been fined $fine credits."]);
    exit;
}

// Fake correction logic for now
$response = $client->chat()->create([
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        ['role' => 'system', 'content' => 'You are a helpful grammar and spelling corrector.'],
        ['role' => 'user', 'content' => "Correct the following text:\n\n$text"],
    ],
]);

$corrected_text = $response->choices[0]->message->content ?? $text;

$errors_found = $corrected_text !== $text;
$bonus = (!$errors_found && $word_count > 10) ? 3 : 0;

$credits_used = $word_count;
$new_total = $current_credits - $credits_used + $bonus;

function generate_corrections($original, $corrected) {
    $original_words = preg_split('/\s+/', trim($original));
    $corrected_words = preg_split('/\s+/', trim($corrected));

    $corrections = [];

    $count = min(count($original_words), count($corrected_words));

    for ($i = 0; $i < $count; $i++) {
        if ($original_words[$i] !== $corrected_words[$i]) {
            $corrections[] = [
                'index' => $i,
                'original' => $original_words[$i],
                'corrected' => $corrected_words[$i]
            ];
        }
    }

    return $corrections;
}

$corrections = generate_corrections($text, $corrected_text);
// Insert submission record
$stmt = $conn->prepare("
    INSERT INTO submissions (user_id, original_text, corrected_text, word_count, credits_used, bonus_credits_awarded, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
");
$stmt->bind_param("issiii", $user_id, $text, $corrected_text, $word_count, $credits_used, $bonus);
$stmt->execute();

// Update user credits
$update = $conn->prepare("UPDATE users SET credits = ? WHERE id = ?");
$update->bind_param("ii", $new_total, $user_id);
$update->execute();

// Return result
echo json_encode([
    "original_text" => $text,
    "corrected_text" => $corrected_text,
    "corrections" => $corrections,
    "credits_used" => $credits_used,
    "bonus_credits_awarded" => $bonus,
    "new_credit_balance" => $new_total
]);
