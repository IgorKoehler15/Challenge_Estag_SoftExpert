<?php
$allowedMethods = "GET, POST, DELETE, OPTIONS";
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/Controllers/ProductController.php';

$controller = new ProductController($pdo);
$controller->handleRequest($_SERVER['REQUEST_METHOD']);
