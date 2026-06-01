<?php

require_once __DIR__ . '/../Repositories/OrderRepository.php';
require_once __DIR__ . '/../Repositories/ProductRepository.php';
require_once __DIR__ . '/../Repositories/CategoryRepository.php';

class CheckoutService
{
    private PDO $pdo;
    private OrderRepository $orderRepo;
    private ProductRepository $productRepo;
    private CategoryRepository $categoryRepo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->orderRepo = new OrderRepository($pdo);
        $this->productRepo = new ProductRepository($pdo);
        $this->categoryRepo = new CategoryRepository($pdo);
    }

    // Processa o checkout do carrinho e retorna o código do pedido criado
    public function process(array $items): int
    {
        if (empty($items)) {
            throw new InvalidArgumentException("The cart is empty.");
        }

        $this->pdo->beginTransaction();

        try {
            // Valida estoque e resolve dados reais do banco para cada item
            $resolvedItems = $this->validateAndResolve($items);

            // Calcula totais com base nos dados do banco
            $totalTax = 0;
            $grandTotal = 0;

            foreach ($resolvedItems as $item) {
                $productTotal = $item['price'] * $item['amount'];
                $taxValue = ($productTotal * $item['tax']) / 100;

                $totalTax += $taxValue;
                $grandTotal += ($productTotal + $taxValue);
            }

            // Cria o pedido
            $nextOrderCode = $this->orderRepo->getNextOrderCode();
            $this->orderRepo->createOrder($nextOrderCode, $grandTotal, $totalTax);

            // Insere itens e atualiza estoque
            foreach ($resolvedItems as $item) {
                $nextItemCode = $this->orderRepo->getNextItemCode();

                $this->orderRepo->createOrderItem(
                    $nextItemCode,
                    $nextOrderCode,
                    $item['product_code'],
                    $item['amount'],
                    $item['price'],
                    $item['tax']
                );

                $decremented = $this->productRepo->decrementStock(
                    $item['product_code'],
                    $item['amount']
                );

                if (!$decremented) {
                    throw new InvalidArgumentException(
                        "Insufficient stock for product code {$item['product_code']}. Another purchase may have occurred simultaneously."
                    );
                }
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

    // Valida estoque e resolve preço/taxa a partir do banco (ignora valores do cliente)
    private function validateAndResolve(array $items): array
    {
        $resolved = [];

        foreach ($items as $item) {
            $productCode = (int) ($item['product']['code'] ?? 0);
            $requestedAmount = (int) ($item['amount'] ?? 0);

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

            // Busca a taxa da categoria diretamente do banco
            $tax = $this->categoryRepo->findTaxByCode((int) $product['category_code']);
            if ($tax === null) {
                throw new InvalidArgumentException("Category for product code {$productCode} not found or inactive.");
            }

            $resolved[] = [
                'product_code' => $productCode,
                'amount'       => $requestedAmount,
                'price'        => (float) $product['price'],
                'tax'          => $tax,
            ];
        }

        return $resolved;
    }
}
