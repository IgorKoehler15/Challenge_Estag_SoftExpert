/**
 * ============================================================
 * ARQUIVO: components/pages/PurchasePage.js
 * PÁGINA DE DETALHES DE UMA COMPRA ESPECÍFICA
 * ============================================================
 *
 * Esta página exibe os DETALHES COMPLETOS de uma compra que já
 * foi finalizada. O usuário chega aqui clicando "View" na
 * página de histórico (HistoryPage).
 *
 * O QUE EXIBE:
 * 1. Card de resumo (código, status)
 * 2. Tabela com todos os itens comprados (produto, preço, qtd, total)
 * 3. Totais (taxa total e valor total da compra)
 * 4. Botão para voltar ao histórico
 *
 * LAYOUT: FullWidthLayout (coluna única, sem sidebar)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: QUERY PARAMETERS (Parâmetros de URL)
 * ═══════════════════════════════════════════════════════════════
 *
 * A URL desta página é: /purchase?code=5
 *
 * O "?code=5" é um QUERY PARAMETER. É a forma de passar dados
 * entre páginas via URL. Funciona assim:
 *
 * 1. HistoryPage cria um link: /purchase?code=5
 * 2. PurchasePage lê o parâmetro "code" da URL
 * 3. Usa esse código para buscar os detalhes da compra na API
 *
 * VANTAGENS de usar query params:
 * - O usuário pode compartilhar o link (ex: enviar por email)
 * - O botão "Voltar" do navegador funciona corretamente
 * - Pode ser salvo nos favoritos
 *
 * HOOK USADO: useSearchParams() do react-router-dom
 * - searchParams.get('code') → retorna o valor do parâmetro "code"
 * - Se a URL for /purchase?code=5, retorna "5"
 * - Se não existir, retorna null
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RENDERIZAÇÃO CONDICIONAL
 * ═══════════════════════════════════════════════════════════════
 *
 * Enquanto os dados estão sendo carregados, "purchase" é null.
 * Não podemos renderizar a página sem dados, então retornamos
 * null (não renderiza nada) até os dados chegarem.
 *
 * Padrão comum:
 *   if (!dados) return null;          // ou return <Loading />
 *   // ... renderização normal ...
 *
 * Isso evita erros como "Cannot read property 'code' of null".
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - FullWidthLayout.js → template de coluna única
 * - SummaryCard.js → card com informações resumidas (organism)
 * - DataTable.js → tabela de itens da compra (organism)
 * - TotalsSection.js → seção de totais (organism)
 * - Button.js → botão "Voltar" (atom)
 * - api.js → função fetchPurchase (busca detalhes)
 * - HistoryPage.js → página de origem (link com query param)
 */

import React, { useState, useEffect } from 'react';

/**
 * useSearchParams: hook para ler/manipular query parameters da URL.
 * Retorna um array [searchParams, setSearchParams]:
 * - searchParams: objeto URLSearchParams com os parâmetros atuais
 * - setSearchParams: função para alterar os parâmetros (não usamos aqui)
 *
 * Link: componente para navegação SPA (sem recarregar a página).
 */
import { useSearchParams, Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import SummaryCard from '../organisms/SummaryCard';
import DataTable from '../organisms/DataTable';
import TotalsSection from '../organisms/TotalsSection';
import Button from '../atoms/Button';
import * as api from '../../services/api';

export default function PurchasePage() {

  // ─── LEITURA DO QUERY PARAMETER ─────────────────────────────
  /**
   * Desestruturação com [searchParams]:
   * useSearchParams() retorna [params, setParams], mas só precisamos
   * do primeiro (leitura). Ignoramos o segundo.
   *
   * Equivalente a:
   *   const resultado = useSearchParams();
   *   const searchParams = resultado[0];
   */
  const [searchParams] = useSearchParams();

  /**
   * purchase: dados completos da compra (vindo da API).
   * Começa como null (ainda não carregou).
   *
   * Estrutura esperada quando carregado:
   * {
   *   code: 5,
   *   tax: "12.50",
   *   total: "125.00",
   *   items: [
   *     { product_name: "Arroz", price: "5.99", tax: "10", amount: "3" },
   *     ...
   *   ]
   * }
   */
  const [purchase, setPurchase] = useState(null);

  // ─── EFEITO: BUSCAR DETALHES DA COMPRA ─────────────────────
  /**
   * Executa quando searchParams muda (na prática, ao montar a página).
   *
   * FLUXO:
   * 1. Lê o parâmetro "code" da URL
   * 2. Se não existir → alerta e redireciona para /history
   * 3. Se existir → busca os detalhes via API
   * 4. Se a API falhar → alerta e redireciona
   * 5. Se der certo → salva os dados no estado "purchase"
   *
   * NOTA: Usamos window.location.href ao invés de navigate() aqui.
   * Isso causa um reload completo da página, o que é intencional
   * em caso de erro (garante um estado limpo).
   */
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      alert('Purchase not found!');
      window.location.href = '/history';
      return; // Sai do efeito (não executa o load)
    }

    const load = async () => {
      try {
        const data = await api.fetchPurchase(code);
        setPurchase(data);
      } catch (error) {
        console.error('Error when searching:', error);
        alert('Error retrieving order details.');
        window.location.href = '/history';
      }
    };
    load();
  }, [searchParams]);

  // ─── RENDERIZAÇÃO CONDICIONAL ───────────────────────────────
  /**
   * Se "purchase" ainda é null (dados não chegaram), não renderiza nada.
   * O componente retorna null = React não coloca nada no DOM.
   *
   * Alternativas comuns:
   * - return <p>Carregando...</p>     → texto de loading
   * - return <Spinner />              → componente de loading animado
   * - return <SkeletonScreen />       → "esqueleto" da página
   *
   * Aqui usamos null por simplicidade.
   */
  if (!purchase) return null;

  // ─── PREPARAÇÃO DOS DADOS DE EXIBIÇÃO ──────────────────────

  /** Código formatado com zeros à esquerda: 5 → "005" */
  const transactionCode = String(purchase.code).padStart(3, '0');

  /**
   * summaryItems: dados para o card de resumo (SummaryCard).
   * Cada item tem:
   * - label: rótulo (ex: "Code:")
   * - value: valor a exibir (ex: "005")
   * - valueClassName: classe CSS opcional para estilizar o valor
   * - hidden: se true, o item não é exibido (usado para "Date"
   *   que pode não estar disponível)
   */
  const summaryItems = [
    { label: 'Code:', value: transactionCode },
    { label: 'Date:', value: '', hidden: true },
    { label: 'Status:', value: 'Finished', valueClassName: 'status-finished' },
  ];

  // ─── PREPARAÇÃO DA TABELA DE ITENS ─────────────────────────
  /**
   * Transforma os itens da compra em linhas para o DataTable.
   *
   * CÁLCULO POR ITEM:
   * 1. preço × quantidade = subtotal base
   * 2. subtotal × (taxa / 100) = valor da taxa
   * 3. subtotal + taxa = total final do item
   *
   * (purchase.items || []):
   * O operador || [] é um "fallback" — se purchase.items for
   * undefined ou null, usa um array vazio. Isso evita erro ao
   * chamar .map() em undefined.
   *
   * A primeira célula usa JSX complexo:
   * - <strong> para o nome do produto em negrito
   * - <br /> para quebra de linha
   * - <span> para a taxa em vermelho e fonte menor
   *
   * Isso demonstra que células da tabela podem conter JSX
   * arbitrariamente complexo, não apenas texto simples.
   */
  const rows = (purchase.items || []).map((item, i) => {
    const itemPrice = parseFloat(item.price);
    const itemTax = parseFloat(item.tax);
    const itemAmount = parseInt(item.amount);
    const productBaseTotal = itemPrice * itemAmount;
    const taxValue = (productBaseTotal * itemTax) / 100;
    const finalItemTotal = productBaseTotal + taxValue;

    return {
      key: i, // Usa índice como key (itens não mudam nesta página)
      cells: [
        <>
          <strong>{item.product_name}</strong>
          <br />
          <span style={{ fontSize: '0.8rem', color: 'red' }}>(Tax: {itemTax}%)</span>
        </>,
        itemPrice.toFixed(2),
        itemAmount,
        finalItemTotal.toFixed(2),
      ],
    };
  });

  // ─── RENDERIZAÇÃO DA PÁGINA ─────────────────────────────────
  /**
   * Estrutura da página:
   *
   * ┌─────────────────────────────────────────┐
   * │ FullWidthLayout (Header + container)    │
   * │                                         │
   * │  ┌─────────────────────────────────┐    │
   * │  │ SummaryCard (código, status)    │    │
   * │  └─────────────────────────────────┘    │
   * │                                         │
   * │  ┌─────────────────────────────────┐    │
   * │  │ DataTable (itens da compra)     │    │
   * │  └─────────────────────────────────┘    │
   * │                                         │
   * │  ┌─────────────────────────────────┐    │
   * │  │ details-footer                  │    │
   * │  │  [Voltar]        Totais →       │    │
   * │  └─────────────────────────────────┘    │
   * └─────────────────────────────────────────┘
   *
   * O "details-footer" usa flexbox com justify-content: space-between
   * para colocar o botão à esquerda e os totais à direita.
   */
  return (
    <FullWidthLayout>
      {/* Card de resumo com informações gerais da compra */}
      <SummaryCard items={summaryItems} />

      {/* Tabela com os itens comprados */}
      <DataTable
        className="table-purchase"
        columns={['Product', 'Unit price', 'Amount', 'Total']}
        rows={rows}
        fillerCols={4}
      />

      {/* Rodapé: botão voltar + totais */}
      <div className="details-footer">
        {/*
          Link para voltar ao histórico.
          Usa <Link> (SPA) ao invés de <a> (reload completo).
          O Button dentro é apenas visual (aparência de botão).
        */}
        <Link to="/history">
          <Button variant="btn-cancel">Back to History</Button>
        </Link>

        {/*
          TotalsSection exibe taxa total e valor total da compra.
          parseFloat().toFixed(2) garante formatação com 2 decimais.
        */}
        <TotalsSection
          rows={[
            { label: 'Total Tax:', value: parseFloat(purchase.tax).toFixed(2) },
            { label: 'Grand Total:', value: parseFloat(purchase.total).toFixed(2) },
          ]}
        />
      </div>
    </FullWidthLayout>
  );
}
