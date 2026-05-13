/**
 * ============================================================
 * ARQUIVO: components/molecules/FormGroup.js
 * MOLÉCULA — GRUPO DE FORMULÁRIO (Label + Input)
 * ============================================================
 *
 * Este é um componente de MOLÉCULA (molecule) no Atomic Design.
 * Moléculas são combinações simples de átomos que formam uma
 * unidade funcional.
 *
 * O QUE FAZ:
 * Cria um container (div) que agrupa um campo de formulário
 * (Input ou Select) com espaçamento e estilo consistentes.
 *
 * VISUAL:
 * ┌─────────────────┐
 * │  [Input/Select] │  ← children (qualquer conteúdo)
 * └─────────────────┘
 *    ↑ .form-group (flex column, gap, margin-bottom)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: WRAPPER COMPONENTS (Componentes Invólucro)
 * ═══════════════════════════════════════════════════════════════
 *
 * FormGroup é um "wrapper" — um componente que ENVOLVE outros
 * componentes para adicionar estilo ou comportamento.
 *
 * POR QUE NÃO USAR A DIV DIRETAMENTE?
 * 1. Consistência: garante que TODOS os grupos usem a mesma classe
 * 2. Manutenção: se mudar o estilo, muda em UM lugar
 * 3. Abstração: quem usa não precisa lembrar o nome da classe
 * 4. Legibilidade: <FormGroup> é mais descritivo que <div className="form-group">
 *
 * É um componente MUITO simples, mas essa simplicidade é intencional.
 * Nem todo componente precisa ser complexo — às vezes o valor está
 * na ORGANIZAÇÃO e CONSISTÊNCIA que ele proporciona.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PROP "style" — ESTILOS INLINE DINÂMICOS
 * ═══════════════════════════════════════════════════════════════
 *
 * A prop "style" permite que o componente PAI customize o estilo
 * deste FormGroup sem criar uma nova classe CSS.
 *
 * Exemplo de uso (em CategoryForm.js):
 *   <FormGroup style={{ flex: 2 }}>  ← ocupa 2/3 da largura
 *   <FormGroup style={{ flex: 1 }}>  ← ocupa 1/3 da largura
 *
 * O atributo style do React aceita um OBJETO JavaScript:
 * - Propriedades em camelCase: font-size → fontSize
 * - Valores numéricos assumem "px": { width: 100 } → width: 100px
 * - Strings para outras unidades: { width: '50%' }
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: CategoryForm, ProductForm, HomeForm (organisms)
 * - Estilos base: components.css (.form-group)
 * - Recebe como children: Input (atom) ou Select (atom)
 */

import React from 'react';

/**
 * FormGroup — Container para campos de formulário.
 *
 * PROPS:
 * @param {ReactNode} children — Conteúdo interno (Input, Select, Label, etc.)
 *   "ReactNode" é qualquer coisa que o React pode renderizar:
 *   componentes, texto, números, arrays, fragments, null.
 *
 * @param {Object} style — Estilos inline opcionais para customização.
 *   Se não for passado, será undefined (React ignora style={undefined}).
 *
 * A classe "form-group" (de components.css) aplica:
 * - display: flex + flex-direction: column → empilha verticalmente
 * - gap: 5px → espaço entre label e input
 * - margin-bottom: 10px → espaço abaixo do grupo
 * - font-weight: bold + font-size: 0.9rem → estilo do texto
 */
export default function FormGroup({ children, style }) {
  return (
    <div className="form-group" style={style}>
      {children}
    </div>
  );
}
