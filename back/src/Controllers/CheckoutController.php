<?php

require_once __DIR__ . '/../Services/CheckoutService.php';

class CheckoutController
{
    private CheckoutService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new CheckoutService($pdo);
    }

    // POST — Processa o checkout do carrinho
    public function processCheckout(): void
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if ($data === null) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid request body."]);
                return;
            }

            $items = $data['items'] ?? [];

            $orderCode = $this->service->process($items);

            echo json_encode(["message" => "Purchase complete!", "order_code" => $orderCode]);

        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "An internal error occurred while processing the checkout."]);
        }
    }
}
