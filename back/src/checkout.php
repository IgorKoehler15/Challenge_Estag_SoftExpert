<?php
$allowedMethods = "POST, OPTIONS";
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/Controllers/CheckoutController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller = new CheckoutController($pdo);
    $controller->processCheckout();
}
