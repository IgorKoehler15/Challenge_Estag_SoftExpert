<?php
$allowedMethods = "GET, OPTIONS";
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/Controllers/HistoryController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller = new HistoryController($pdo);
    $controller->listOrders();
}
