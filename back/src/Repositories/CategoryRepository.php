<?php

class CategoryRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Busca todas as categorias ativas
    public function findAllActive(): array
    {
        $stmt = $this->pdo->query(
            "SELECT code, display_code, name, tax FROM categories WHERE is_active = true ORDER BY display_code ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Verifica se uma categoria ativa existe pelo código
    public function existsActiveByCode(int $code): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT code FROM categories WHERE code = :code AND is_active = true LIMIT 1"
        );
        $stmt->execute([':code' => $code]);
        return (bool) $stmt->fetch();
    }

    // Busca a taxa de uma categoria ativa pelo código
    public function findTaxByCode(int $code): ?float
    {
        $stmt = $this->pdo->prepare(
            "SELECT tax FROM categories WHERE code = :code AND is_active = true"
        );
        $stmt->execute([':code' => $code]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (float) $result['tax'] : null;
    }

    // Verifica se já existe uma categoria ativa com o mesmo nome
    public function existsActiveByName(string $name): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT code FROM categories WHERE LOWER(name) = LOWER(:name) AND is_active = true LIMIT 1"
        );
        $stmt->execute([':name' => $name]);
        return (bool) $stmt->fetch();
    }

    // Retorna o próximo display_code disponível
    public function getNextDisplayCode(): int
    {
        $stmt = $this->pdo->query(
            "SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM categories WHERE is_active = true"
        );
        return (int) $stmt->fetch()['next_display'];
    }

    // Retorna o próximo code (ID) disponível
    public function getNextCode(): int
    {
        $stmt = $this->pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM categories");
        return (int) $stmt->fetch()['next_code'];
    }

    // Insere uma nova categoria no banco
    public function create(int $code, int $displayCode, string $name, float $tax): void
    {
        $sql = "INSERT INTO categories (code, display_code, name, tax) VALUES (:code, :display_code, :name, :tax)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':code'         => $code,
            ':display_code' => $displayCode,
            ':name'         => $name,
            ':tax'          => $tax
        ]);
    }

    // Verifica se existem produtos ativos com estoque vinculados à categoria
    public function hasActiveProducts(int $code): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = true AND amount > 0"
        );
        $stmt->execute([':code' => $code]);
        return $stmt->fetchColumn() > 0;
    }

    // Verifica se há pedidos vinculados a produtos desta categoria
    public function hasOrderLinks(int $code): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM order_item oi
            INNER JOIN products p ON p.code = oi.product_code
            WHERE p.category_code = :code
        ");
        $stmt->execute([':code' => $code]);
        return $stmt->fetchColumn() > 0;
    }

    // Verifica se há produtos inativos vinculados à categoria
    public function hasInactiveProducts(int $code): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = false"
        );
        $stmt->execute([':code' => $code]);
        return $stmt->fetchColumn() > 0;
    }

    // Soft delete — desativa a categoria
    public function softDelete(int $code): int
    {
        $stmt = $this->pdo->prepare(
            "UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true"
        );
        $stmt->execute([':code' => $code]);
        return $stmt->rowCount();
    }

    // Hard delete — remove definitivamente
    public function hardDelete(int $code): int
    {
        $stmt = $this->pdo->prepare("DELETE FROM categories WHERE code = :code AND is_active = true");
        $stmt->execute([':code' => $code]);
        return $stmt->rowCount();
    }
}
