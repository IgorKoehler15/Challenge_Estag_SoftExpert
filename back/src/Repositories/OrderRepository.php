<?php

class OrderRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Retorna o próximo código de pedido disponível
    public function getNextOrderCode(): int
    {
        $stmt = $this->pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_code FROM orders");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['next_code'];
    }

    // Insere um novo pedido
    public function createOrder(int $code, float $total, float $tax): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO orders (code, total, tax) VALUES (:code, :total, :tax)");
        $stmt->execute([
            ':code'  => $code,
            ':total' => $total,
            ':tax'   => $tax
        ]);
    }

    // Retorna o próximo código de item de pedido disponível
    public function getNextItemCode(): int
    {
        $stmt = $this->pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_item_code FROM order_item");
        return (int) $stmt->fetch(PDO::FETCH_ASSOC)['next_item_code'];
    }

    // Insere um item de pedido
    public function createOrderItem(int $code, int $orderCode, int $productCode, int $amount, float $price, float $tax): void
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO order_item (code, order_code, product_code, amount, price, tax) 
             VALUES (:code, :order_code, :product_code, :amount, :price, :tax)"
        );
        $stmt->execute([
            ':code'         => $code,
            ':order_code'   => $orderCode,
            ':product_code' => $productCode,
            ':amount'       => $amount,
            ':price'        => $price,
            ':tax'          => $tax
        ]);
    }

    // Busca todos os pedidos (resumo)
    public function findAll(): array
    {
        $stmt = $this->pdo->query("SELECT code, tax, total FROM orders ORDER BY code DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Busca um pedido pelo código
    public function findByCode(int $code): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE code = :code");
        $stmt->execute([':code' => $code]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    // Busca os itens de um pedido com nome do produto
    public function findItemsByOrderCode(int $code): array
    {
        $stmt = $this->pdo->prepare("
            SELECT oi.amount, oi.price, oi.tax, p.name as product_name 
            FROM order_item oi 
            JOIN products p ON oi.product_code = p.code 
            WHERE oi.order_code = :code
        ");
        $stmt->execute([':code' => $code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
