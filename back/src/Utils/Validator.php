<?php

// Classe utilitária de validação — centraliza regras reutilizáveis entre services
class Validator
{
    // Extrai e valida um campo string obrigatório (nome)
    public static function requiredString(array $data, string $field, string $label, int $maxLength = 30): string
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
    public static function requiredPositiveInt(array $data, string $field, string $label, int $max = 9999): int
    {
        $value = isset($data[$field]) ? (int) $data[$field] : null;

        if ($value === null || $value <= 0) {
            throw new InvalidArgumentException("{$label} must be a positive integer.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }

    // Extrai e valida um campo float positivo obrigatório (preço)
    public static function requiredPositiveFloat(array $data, string $field, string $label, float $max = 99999.99): float
    {
        $value = isset($data[$field]) ? (float) $data[$field] : null;

        if ($value === null || $value <= 0) {
            throw new InvalidArgumentException("{$label} must be greater than zero.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }

    // Extrai e valida um campo float que aceita zero (taxa/imposto)
    public static function requiredNonNegativeFloat(array $data, string $field, string $label, float $max = 100): float
    {
        $value = array_key_exists($field, $data) ? (float) $data[$field] : null;

        if ($value === null || $value < 0) {
            throw new InvalidArgumentException("{$label} must be zero or a positive number.");
        }

        if ($value > $max) {
            throw new InvalidArgumentException("{$label} must be at most {$max}.");
        }

        return $value;
    }
}
