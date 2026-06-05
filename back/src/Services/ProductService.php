<?php

require_once __DIR__ . '/../Repositories/ProductRepository.php';
require_once __DIR__ . '/../Repositories/CategoryRepository.php';
require_once __DIR__ . '/../Utils/Validator.php';

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
        $name = Validator::requiredString($data, 'name', 'Product name');
        $amount = Validator::requiredPositiveInt($data, 'amount', 'Amount');
        $price = Validator::requiredPositiveFloat($data, 'price', 'Price');
        $categoryCode = Validator::requiredPositiveInt($data, 'category_code', 'Category code', 999999);

        // Verifica se a categoria existe e está ativa
        if (!$this->categoryRepo->existsActiveByCode($categoryCode)) {
            throw new InvalidArgumentException("The specified category does not exist or is inactive.");
        }

        // Verifica se já existe um produto ativo com estoque > 0 com o mesmo nome
        if ($this->productRepo->existsActiveByName($name)) {
            throw new InvalidArgumentException("An active product with this name already exists!");
        }

        // Verifica se existe um produto ativo com estoque zerado (reabastecimento)
        $outOfStock = $this->productRepo->findActiveOutOfStockByName($name);
        if ($outOfStock) {
            // Atualiza o produto existente com novo estoque, preço e categoria
            $this->productRepo->restock((int) $outOfStock['code'], $amount, $price, $categoryCode);
            return;
        }

        // Gera códigos e insere novo produto
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
