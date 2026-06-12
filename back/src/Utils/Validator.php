<?php

// Classe utilitária de validação — centraliza regras reutilizáveis entre services
class Validator
{   
    // Métodos usam as constantes em vez dos valores literais
    const MAX_NAME_LENGTH = 30;
    const MAX_AMOUNT = 9999;
    const MAX_PRICE = 99999.99;
    const MAX_TAX = 100;
    const MAX_CODE = 999999;

    // Extrai e valida um campo string obrigatório (nome)
    public static function requiredString(array $data, string $field, string $label, int $maxLength = self::MAX_NAME_LENGTH): string
    {
        $value = isset($data[$field]) ? trim($data[$field]) : null;

        if ($value === null || $value === '') {
            throw new InvalidArgumentException("{$label} is required.");
        }

        if (mb_strlen($value) > $maxLength) {
            throw new InvalidArgumentException("{$label} must be at most {$maxLength} characters.");
        }

        return $value;
    }

    // Extrai e valida um campo inteiro positivo obrigatório
    public static function requiredPositiveInt(array $data, string $field, string $label, int $max = self::MAX_AMOUNT): int
    {
        if (!isset($data[$field])) {
            throw new InvalidArgumentException("{$label} is required.");
        }

        $value = (int) $data[$field];

        if ($value <= 0) {
            throw new InvalidArgumentException("{$label} must be a positive integer.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }

    // Extrai e valida um campo float positivo obrigatório (preço)
    public static function requiredPositiveFloat(array $data, string $field, string $label, float $max = self::MAX_PRICE): float
    {
        if (!isset($data[$field])) {
            throw new InvalidArgumentException("{$label} is required.");
        }

        $value = (float) $data[$field];

        if ($value <= 0) {
            throw new InvalidArgumentException("{$label} must be greater than zero.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }

    // Extrai e valida um campo float que aceita zero (taxa/imposto)
    public static function requiredNonNegativeFloat(array $data, string $field, string $label, float $max = self::MAX_TAX): float
    {
        if (!array_key_exists($field, $data)) {
            throw new InvalidArgumentException("{$label} is required.");
        }

        $value = (float) $data[$field];

        if ($value < 0) {
            throw new InvalidArgumentException("{$label} must be zero or a positive number.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }
}
