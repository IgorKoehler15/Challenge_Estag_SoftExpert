<?php

require_once __DIR__ . '/../Repositories/OrderRepository.php';

class HistoryService
{
    private OrderRepository $orderRepo;

    public function __construct(PDO $pdo)
    {
        $this->orderRepo = new OrderRepository($pdo);
    }

    // Lista todos os pedidos (resumo)
    public function listAll(): array
    {
        return $this->orderRepo->findAll();
    }

    // Busca os detalhes de um pedido específico
    public function getByCode(int $code): array
    {
        $order = $this->orderRepo->findByCode($code);

        if (!$order) {
            throw new RuntimeException("Order not found.");
        }

        $order['items'] = $this->orderRepo->findItemsByOrderCode($code);

        return $order;
    }
}
