// Módulo utilitário de validação — centraliza regras reutilizáveis entre páginas

// Regex para nomes: deve conter ao menos uma letra, aceita letras (com acentos), números e espaços
const NAME_REGEX = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;

// Regex para valores inteiros positivos
const INTEGER_REGEX = /^\d+$/;

// Regex para valores decimais com até 2 casas (ex: 10, 25.50)
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

// Valida um nome (produto ou categoria)
// Retorna null se válido, ou uma string de erro se inválido
export function validateName(name, entityLabel = 'Name') {
  if (name.length === 0 || name.length > 30) {
    return `${entityLabel} must be between 1 and 30 characters.`;
  }
  if (!NAME_REGEX.test(name)) {
    return `Invalid ${entityLabel}! It must contain at least one letter and no special characters.`;
  }
  return null;
}

// Valida uma quantidade (inteiro positivo)
// Retorna null se válido, ou uma string de erro se inválido
export function validateAmount(rawValue, min = 1, max = 9999) {
  if (rawValue.length === 0 || rawValue.length > 5) {
    return 'Amount is invalid or too large.';
  }
  if (!INTEGER_REGEX.test(rawValue)) {
    return 'Invalid Amount! Use only integers.';
  }
  const qty = parseInt(rawValue, 10);
  if (isNaN(qty) || qty < min || qty > max) {
    return `Amount must be between ${min} and ${max}.`;
  }
  return null;
}

// Valida um preço (decimal positivo com até 2 casas)
// Retorna null se válido, ou uma string de erro se inválido
export function validatePrice(rawValue, min = 0.01, max = 99999.99) {
  if (rawValue.length === 0 || rawValue.length > 10) {
    return 'Price is invalid or too large.';
  }
  const normalized = rawValue.replace(',', '.');
  if (!DECIMAL_REGEX.test(normalized)) {
    return 'Invalid Price format! Use e.g., 10 or 25.50';
  }
  const val = parseFloat(normalized);
  if (isNaN(val) || val < min || val > max) {
    return `Price must be between ${min} and ${max}.`;
  }
  return null;
}

// Valida uma taxa (decimal entre 0 e 100)
// Retorna null se válido, ou uma string de erro se inválido
export function validateTax(rawValue) {
  if (rawValue.length === 0 || rawValue.length > 5) {
    return 'Tax must have between 1 and 5 characters (e.g., 10 or 25.50).';
  }
  if (!DECIMAL_REGEX.test(rawValue)) {
    return 'Invalid Tax format! Use numbers separated by a dot (e.g., 10 or 25.50).';
  }
  const val = parseFloat(rawValue);
  if (isNaN(val) || val < 0 || val > 100) {
    return 'Tax must be a valid number between 0 and 100.';
  }
  return null;
}

// Normaliza um preço (substitui vírgula por ponto) e retorna o valor float
export function parsePrice(rawValue) {
  return parseFloat(rawValue.replace(',', '.'));
}
