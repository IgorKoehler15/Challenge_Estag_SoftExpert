<?php

class ProductRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Busca todos os produtos ativos com estoque disponível
    public function findAllActive(): array
    {
        $stmt = $this->pdo->query(
            "SELECT code, display_code, name, amount, price, category_code 
             FROM products 
             WHERE is_active = true AND amount > 0 
             ORDER BY display_code ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Busca um produto ativo pelo código
    public function findActiveByCode(int $code): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT code, amount FROM products WHERE code = :code AND is_active = true"
        );
        $stmt->execute([':code' => $code]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    // Verifica se já existe um produto ativo com o mesmo nome (com estoque)
    public function existsActiveByName(string $name): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT code FROM products WHERE LOWER(name) = LOWER(:name) AND is_active = true AND amount > 0 LIMIT 1"
        );
        $stmt->execute([':name' => $name]);
        return (bool) $stmt->fetch();
    }

    // Busca um produto ativo com estoque zerado pelo nome (para reabastecimento)
    public function findActiveOutOfStockByName(string $name): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT code, display_code FROM products WHERE LOWER(name) = LOWER(:name) AND is_active = true AND amount = 0 LIMIT 1"
        );
        $stmt->execute([':name' => $name]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    // Atualiza estoque, preço e categoria de um produto existente (reabastecimento)
    public function restock(int $code, int $amount, float $price, int $categoryCode): void
    {
        $stmt = $this->pdo->prepare(
            "UPDATE products SET amount = :amount, price = :price, category_code = :category_code, updated_at = CURRENT_TIMESTAMP WHERE code = :code"
        );
        $stmt->execute([
            ':amount'        => $amount,
            ':price'         => $price,
            ':category_code' => $categoryCode,
            ':code'          => $code
        ]);
    }

    // Retorna o próximo display_code disponível
    public function getNextDisplayCode(): int
    {
        $stmt = $this->pdo->query(
            "SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM products WHERE is_active = true AND amount > 0"
        );
        return (int) $stmt->fetch()['next_display'];
    }

    // Retorna o próximo code (ID) disponível
    public function getNextCode(): int
    {
        $stmt = $this->pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM products");
        return (int) $stmt->fetch()['next_code'];
    }

    // Insere um novo produto no banco
    public function create(int $code, int $displayCode, string $name, int $amount, float $price, int $categoryCode): void
    {
        $sql = "INSERT INTO products (code, display_code, name, amount, price, category_code) 
                VALUES (:code, :display_code, :name, :amount, :price, :category_code)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':code'          => $code,
            ':display_code'  => $displayCode,
            ':name'          => $name,
            ':amount'        => $amount,
            ':price'         => $price,
            ':category_code' => $categoryCode
        ]);
    }

    // Verifica se o produto já foi usado em algum pedido
    public function hasOrderLinks(int $code): bool
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM order_item WHERE product_code = :code");
        $stmt->execute([':code' => $code]);
        return $stmt->fetchColumn() > 0;
    }

    // Soft delete — desativa o produto
    public function softDelete(int $code): int
    {
        $stmt = $this->pdo->prepare(
            "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true"
        );
        $stmt->execute([':code' => $code]);
        return $stmt->rowCount();
    }

    // Hard delete — remove definitivamente
    public function hardDelete(int $code): int
    {
        $stmt = $this->pdo->prepare("DELETE FROM products WHERE code = :code AND is_active = true");
        $stmt->execute([':code' => $code]);
        return $stmt->rowCount();
    }

    // Decrementa o estoque de um produto
    public function decrementStock(int $code, int $quantity): void
    {
        $stmt = $this->pdo->prepare("UPDATE products SET amount = amount - :qty WHERE code = :code");
        $stmt->execute([':qty' => $quantity, ':code' => $code]);
    }
}
