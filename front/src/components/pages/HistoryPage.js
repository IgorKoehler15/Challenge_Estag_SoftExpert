/**
 * ============================================================
 * ARQUIVO: components/pages/HistoryPage.js
 * PÁGINA DE HISTÓRICO DE COMPRAS
 * ============================================================
 *
 * Esta página exibe uma TABELA com todas as compras já realizadas.
 * Cada linha mostra: código da compra, taxa, total e um botão
 * para ver os detalhes daquela compra.
 *
 * LAYOUT: Usa FullWidthLayout (coluna única, sem sidebar)
 * - Não tem formulário, apenas a tabela de histórico
 *
 * É a página mais SIMPLES do projeto — ótima para entender o
 * padrão básico de uma página React que busca e exibe dados.
 *
 * ═══════════════════════════════════════════════════════════════
 * PADRÃO: BUSCAR DADOS AO MONTAR O COMPONENTE
 * ═══════════════════════════════════════════════════════════════
 *
 * Quase toda página que exibe dados do servidor segue este padrão:
 *
 * 1. Criar estado vazio: const [dados, setDados] = useState([])
 * 2. Buscar dados no useEffect (executa ao montar)
 * 3. Atualizar o estado com os dados recebidos
 * 4. Renderizar os dados na interface
 *
 * Este padrão é tão comum que existem bibliotecas como React Query
 * e SWR que o automatizam. Mas entender o básico é fundamental!
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: NAVEGAÇÃO COM PARÂMETROS (Query Params)
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando o usuário clica em "View", navegamos para:
 *   /purchase?code=5
 *
 * O "?code=5" é um QUERY PARAMETER (parâmetro de consulta).
 * A PurchasePage lê esse parâmetro para saber qual compra exibir.
 *
 * É como passar uma "mensagem" de uma página para outra via URL.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - FullWidthLayout.js → estrutura da página (template)
 * - DataTable.js → tabela de dados (organism)
 * - Button.js → botão "View" (atom)
 * - api.js → função fetchHistory (busca histórico)
 * - PurchasePage.js → página de destino ao clicar "View"
 */

import React, { useState, useEffect } from 'react';

/**
 * Link: componente do react-router-dom para navegação SPA.
 *
 * DIFERENÇA ENTRE <Link> E <a>:
 * - <a href="/page"> → recarrega a página inteira (navegação tradicional)
 * - <Link to="/page"> → troca o componente SEM recarregar (SPA)
 *
 * Sempre use <Link> para navegação INTERNA da aplicação.
 * Use <a> apenas para links EXTERNOS (outros sites).
 */
import { Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

export default function HistoryPage() {

  // Estado que armazena a lista de compras do histórico
  const [history, setHistory] = useState([]);

  /**
   * useEffect para buscar o histórico quando a página carrega.
   *
   * PADRÃO: Função async DENTRO do useEffect
   * O useEffect em si NÃO pode ser async (limitação do React).
   * Então criamos uma função async DENTRO dele e a chamamos.
   *
   * Por que? O useEffect pode retornar uma função de cleanup,
   * mas funções async retornam uma Promise. Se o useEffect fosse
   * async, o React receberia uma Promise ao invés de uma função
   * de cleanup, causando comportamento inesperado.
   *
   * [] (array vazio) = executa apenas UMA vez, ao montar.
   */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.fetchHistory();
        setHistory(data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };
    load();
  }, []);

  // ─── PREPARAÇÃO DOS DADOS PARA A TABELA ────────────────────
  /**
   * Transforma cada compra do histórico em uma linha da tabela.
   *
   * Para cada compra (purchase), criamos um objeto com:
   * - key: identificador único para o React (otimização de renderização)
   * - cells: conteúdo de cada célula
   *
   * A última célula contém um <Link> com <Button> dentro:
   * - Link navega para /purchase?code=X (detalhes da compra)
   * - Button é apenas visual (aparência de botão)
   *
   * parseFloat().toFixed(2): converte para número e formata com 2 decimais.
   * Exemplo: "5.5" → 5.50, "10" → 10.00
   */
  const rows = history.map((purchase) => {
    const transactionCode = String(purchase.code).padStart(3, '0');
    return {
      key: purchase.code,
      cells: [
        transactionCode,
        parseFloat(purchase.tax).toFixed(2),
        parseFloat(purchase.total).toFixed(2),
        /**
         * <Link to={`/purchase?code=${purchase.code}`}>
         *
         * Cria um link para a página de detalhes da compra.
         * O query parameter "code" é lido pela PurchasePage
         * usando o hook useSearchParams().
         *
         * style={{ textDecoration: 'none' }} remove o sublinhado
         * do link para que apenas o botão seja visível.
         */
        <Link to={`/purchase?code=${purchase.code}`} style={{ textDecoration: 'none' }}>
          <Button variant="btn-view">View</Button>
        </Link>,
      ],
    };
  });

  /**
   * Renderiza o FullWidthLayout com a tabela dentro.
   * Tudo entre <FullWidthLayout> e </FullWidthLayout> é o "children"
   * que o template renderiza dentro de .content-full.
   */
  return (
    <FullWidthLayout>
      <DataTable
        className="table-history"
        columns={['Code', 'Tax', 'Total', 'Actions']}
        rows={rows}
        fillerCols={4}
      />
    </FullWidthLayout>
  );
}
