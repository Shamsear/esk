<?php
// Set the content type to JSON
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
    exit;
}

// Get the JSON data from the request body
$jsonData = file_get_contents('php://input');

// Check if data is empty
if (empty($jsonData)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

try {
    // Decode the JSON data
    $players = json_decode($jsonData, true);
    
    // Check if JSON decoding was successful
    if ($players === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON format: ' . json_last_error_msg());
    }
    
    // Validate the data (basic check)
    if (!is_array($players)) {
        throw new Exception('Invalid data format: expected an array of players');
    }
    
    // Write the JSON data to the players.json file
    $result = file_put_contents('players.json', $jsonData);
    
    if ($result === false) {
        throw new Exception('Failed to write to players.json');
    }
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Player data saved successfully',
        'count' => count($players)
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 