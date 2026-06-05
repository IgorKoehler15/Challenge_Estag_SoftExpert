<?php

require_once __DIR__ . '/../Repositories/CategoryRepository.php';
require_once __DIR__ . '/../Utils/Validator.php';

class CategoryService
{
    private CategoryRepository $categoryRepo;

    public function __construct(PDO $pdo)
    {
        $this->categoryRepo = new CategoryRepository($pdo);
    }

    // Lista todas as categorias ativas
    public function listAll(): array
    {
        return $this->categoryRepo->findAllActive();
    }

    // Cria uma nova categoria após validar os dados
    public function create(array $data): int
    {
        $name = Validator::requiredString($data, 'name', 'Category name');
        $tax = Validator::requiredNonNegativeFloat($data, 'tax', 'Tax');

        // Verifica duplicidade de nome
        if ($this->categoryRepo->existsActiveByName($name)) {
            throw new InvalidArgumentException("A category with this name already exists and is active!");
        }

        $nextDisplay = $this->categoryRepo->getNextDisplayCode();
        $nextCode = $this->categoryRepo->getNextCode();

        $this->categoryRepo->create($nextCode, $nextDisplay, $name, $tax);

        return $nextCode;
    }

    // Exclui uma categoria (soft ou hard delete conforme dependências)
    public function delete(int $code): void
    {
        if ($code <= 0) {
            throw new InvalidArgumentException("The category code was not provided.");
        }

        // Impede exclusão se houver produtos ativos vinculados
        if ($this->categoryRepo->hasActiveProducts($code)) {
            throw new InvalidArgumentException(
                "Action denied: There are active products linked to this category! Please delete the products first."
            );
        }

        $rowsAffected = 0;

        if ($this->categoryRepo->hasOrderLinks($code) || $this->categoryRepo->hasInactiveProducts($code)) {
            $rowsAffected = $this->categoryRepo->softDelete($code);
        } else {
            $rowsAffected = $this->categoryRepo->hardDelete($code);
        }

        if ($rowsAffected === 0) {
            throw new RuntimeException("Category not found in the database.");
        }
    }
}
