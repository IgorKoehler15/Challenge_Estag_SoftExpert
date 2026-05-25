<?php
$allowedMethods = "GET, POST, DELETE, OPTIONS";
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/Controllers/CategoryController.php';

$controller = new CategoryController($pdo);
$controller->handleRequest($_SERVER['REQUEST_METHOD']);
