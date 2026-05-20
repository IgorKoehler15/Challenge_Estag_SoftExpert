<?php

require_once __DIR__ . '/../Repositories/OrderRepository.php';
require_once __DIR__ . '/../Repositories/ProductRepository.php';

class CheckoutService
{
    private PDO $pdo;
    private OrderRepository $orderRepo;
    private ProductRepository $productRepo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->orderRepo = new OrderRepository($pdo);
        $this->productRepo = new ProductRepository($pdo);
    }

    // Processa o checkout do carrinho e retorna o código do pedido criado
    public function process(array $items): int
    {
        if (empty($items)) {
            throw new InvalidArgumentException("The cart is empty.");
        }

        $this->pdo->beginTransaction();

        try {
            // Valida estoque de todos os itens antes de prosseguir
            $this->validateStock($items);

            // Calcula totais
            $totalTax = 0;
            $grandTotal = 0;

            foreach ($items as $item) {
                $price = (float) $item['product']['price'];
                $tax = (float) $item['category']['tax'];
                $amount = (int) $item['amount'];

                $productTotal = $price * $amount;
                $taxValue = ($productTotal * $tax) / 100;

                $totalTax += $taxValue;
                $grandTotal += ($productTotal + $taxValue);
            }

            // Cria o pedido
            $nextOrderCode = $this->orderRepo->getNextOrderCode();
            $this->orderRepo->createOrder($nextOrderCode, $grandTotal, $totalTax);

            // Insere itens e atualiza estoque
            foreach ($items as $item) {
                $nextItemCode = $this->orderRepo->getNextItemCode();

                $this->orderRepo->createOrderItem(
                    $nextItemCode,
                    $nextOrderCode,
                    (int) $item['product']['code'],
                    (int) $item['amount'],
                    (float) $item['product']['price'],
                    (float) $item['category']['tax']
                );

                $this->productRepo->decrementStock(
                    (int) $item['product']['code'],
                    (int) $item['amount']
                );
            }

            $this->pdo->commit();
            return $nextOrderCode;

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    // Valida se o estoque é suficiente para todos os itens
    private function validateStock(array $items): void
    {
        foreach ($items as $item) {
            $productCode = (int) $item['product']['code'];
            $requestedAmount = (int) $item['amount'];

            if ($requestedAmount <= 0) {
                throw new InvalidArgumentException("Invalid quantity for product code {$productCode}.");
            }

            $product = $this->productRepo->findActiveByCode($productCode);

            if (!$product) {
                throw new InvalidArgumentException("Product code {$productCode} not found or inactive.");
            }

            if ((int) $product['amount'] < $requestedAmount) {
                throw new InvalidArgumentException(
                    "Insufficient stock for product code {$productCode}. Available: {$product['amount']}, requested: {$requestedAmount}."
                );
            }
        }
    }
}
