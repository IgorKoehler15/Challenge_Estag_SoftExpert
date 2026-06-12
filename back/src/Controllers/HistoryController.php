<?php

require_once __DIR__ . '/../Services/HistoryService.php';

class HistoryController
{
    private HistoryService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new HistoryService($pdo);
    }

    // GET — Lista pedidos ou retorna detalhes de um pedido específico
    public function listOrders(): void
    {
        $code = isset($_GET['code']) ? (int) $_GET['code'] : null;

        try {
            if ($code) {
                $order = $this->service->getByCode($code);
                echo json_encode($order);
            } else {
                $orders = $this->service->listAll();
                echo json_encode($orders);
            }
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An internal database error occurred."]);
        }
    }
}
