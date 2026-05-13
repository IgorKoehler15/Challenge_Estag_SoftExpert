/**
 * ============================================================
 * ARQUIVO: components/atoms/Input.js
 * ÁTOMO — CAMPO DE ENTRADA DE DADOS
 * ============================================================
 *
 * Este é o átomo mais MINIMALISTA do projeto — apenas uma linha
 * de JSX! Mas sua existência tem propósitos importantes.
 *
 * O QUE FAZ:
 * Encapsula o elemento HTML nativo <input> em um componente React.
 * Repassa TODAS as props recebidas diretamente para o <input>.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: POR QUE ENCAPSULAR UM ELEMENTO NATIVO?
 * ═══════════════════════════════════════════════════════════════
 *
 * "Se é só um <input>, por que criar um componente?"
 * Ótima pergunta! Existem várias razões:
 *
 * 1. PONTO ÚNICO DE MODIFICAÇÃO:
 *    Se no futuro quiser adicionar algo a TODOS os inputs
 *    (ex: uma classe padrão, um aria-label, um wrapper div),
 *    basta alterar ESTE arquivo. Sem o componente, teria que
 *    alterar dezenas de <input> espalhados pelo projeto.
 *
 * 2. CONSISTÊNCIA ARQUITETURAL:
 *    No Atomic Design, TODOS os elementos básicos são átomos.
 *    Se Button e Select são componentes, Input também deve ser.
 *    Isso mantém o padrão consistente e previsível.
 *
 * 3. FACILIDADE DE EXTENSÃO:
 *    Amanhã pode precisar adicionar:
 *    - Máscara de formatação (ex: CPF, telefone)
 *    - Ícone dentro do input
 *    - Mensagem de erro abaixo
 *    - Animação de foco
 *    Com o componente já existindo, é só adicionar aqui.
 *
 * 4. TESTABILIDADE:
 *    Mais fácil mockar/testar um componente do que um elemento nativo.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTE "TRANSPARENTE" (Pass-Through)
 * ═══════════════════════════════════════════════════════════════
 *
 * Este componente é "transparente" — não adiciona nem remove nada.
 * Todas as props passam direto para o elemento nativo.
 *
 * Quem usa <Input type="text" placeholder="Nome" value={x} onChange={fn} />
 * é como se estivesse usando <input type="text" placeholder="Nome" ... />
 *
 * O {...props} garante essa transparência total.
 *
 * PROPS COMUNS USADAS NESTE PROJETO:
 * - type: "text", "number" (tipo do campo)
 * - id: identificador único (para labels e testes)
 * - name: nome do campo (para formulários)
 * - placeholder: texto de dica quando vazio
 * - value: valor atual (controlled input)
 * - onChange: função chamada ao digitar
 * - readOnly: impede edição (campos informativos)
 * - style: estilos inline (ex: backgroundColor para readOnly)
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: FormGroup (molecule) → dentro de CategoryForm,
 *   ProductForm, HomeForm (organisms)
 * - Estilos: components.css (.aside-1 input → padding, border, etc.)
 */

import React from 'react';

/**
 * Input — Componente de campo de entrada.
 *
 * @param {...any} props — TODAS as props são repassadas ao <input>.
 *
 * A desestruturação { ...props } no parâmetro captura TUDO
 * em um único objeto, que é então espalhado no elemento.
 *
 * É equivalente a:
 *   function Input(props) {
 *     return <input {...props} />;
 *   }
 *
 * Ambas as formas funcionam. A versão com desestruturação
 * ({ ...props }) é apenas uma preferência de estilo.
 *
 * NOTA: <input /> é um elemento "self-closing" (auto-fechante).
 * Não tem conteúdo interno (children), diferente de <button>texto</button>.
 * Em JSX, TODOS os elementos sem filhos devem usar /> no final.
 */
export default function Input({ ...props }) {
  return <input {...props} />;
}
