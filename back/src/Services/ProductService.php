<?php

require_once __DIR__ . '/../Repositories/ProductRepository.php';
require_once __DIR__ . '/../Repositories/CategoryRepository.php';

class ProductService
{
    private ProductRepository $productRepo;
    private CategoryRepository $categoryRepo;

    public function __construct(PDO $pdo)
    {
        $this->productRepo = new ProductRepository($pdo);
        $this->categoryRepo = new CategoryRepository($pdo);
    }

    // Lista todos os produtos ativos com estoque
    public function listAll(): array
    {
        return $this->productRepo->findAllActive();
    }

    // Cria um novo produto após validar todos os campos
    public function create(array $data): void
    {
        $name = isset($data['name']) ? trim($data['name']) : '';
        $amount = isset($data['amount']) ? (int) $data['amount'] : -1;
        $price = isset($data['price']) ? (float) $data['price'] : -1;
        $categoryCode = isset($data['category_code']) ? (int) $data['category_code'] : 0;

        // Validação do nome
        if (empty($name)) {
            throw new InvalidArgumentException("Incomplete data.");
        }

        // Validação da quantidade
        if ($amount <= 0) {
            throw new InvalidArgumentException("The amount must be a positive integer.");
        }

        // Validação do preço
        if ($price <= 0) {
            throw new InvalidArgumentException("The price must be greater than zero.");
        }

        // Validação do código da categoria
        if ($categoryCode <= 0) {
            throw new InvalidArgumentException("A valid category code is required.");
        }

        // Verifica se a categoria existe e está ativa
        if (!$this->categoryRepo->existsActiveByCode($categoryCode)) {
            throw new InvalidArgumentException("The specified category does not exist or is inactive.");
        }

        // Verifica duplicidade de nome
        if ($this->productRepo->existsActiveByName($name)) {
            throw new InvalidArgumentException("An active product with this name already exists!");
        }

        // Gera códigos e insere
        $nextDisplay = $this->productRepo->getNextDisplayCode();
        $nextCode = $this->productRepo->getNextCode();

        $this->productRepo->create($nextCode, $nextDisplay, $name, $amount, $price, $categoryCode);
    }

    // Exclui um produto (soft ou hard delete conforme dependências)
    public function delete(int $code): void
    {
        if ($code <= 0) {
            throw new InvalidArgumentException("The product code was not provided.");
        }

        $rowsAffected = 0;

        if ($this->productRepo->hasOrderLinks($code)) {
            $rowsAffected = $this->productRepo->softDelete($code);
        } else {
            $rowsAffected = $this->productRepo->hardDelete($code);
        }

        if ($rowsAffected === 0) {
            throw new RuntimeException("Product not found in the database.");
        }
    }
}
