import { useState, useEffect, useCallback } from 'react';

import { Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import ErrorMessage from '../atoms/ErrorMessage';
import * as api from '../../services/api';
import logger from '../../utils/logger';

// Página de histórico de compras — exibe todos os pedidos finalizados
export default function HistoryPage() {

  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Carrega o histórico de pedidos da API ao montar o componente
  const loadHistory = useCallback(async () => {
    setError(null);
    try {
      const data = await api.fetchHistory();
      setHistory(data);
    } catch (err) {
      logger.error('Error fetching history:', err);
      setError('Failed to load purchase history. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Monta as linhas da tabela com código, imposto, total e botão de visualização
  const rows = history.map((purchase) => {
    const transactionCode = String(purchase.code).padStart(3, '0');
    return {
      key: purchase.code,
      cells: [
        transactionCode,
        parseFloat(purchase.tax).toFixed(2),
        parseFloat(purchase.total).toFixed(2),
        // Link para a página de detalhes do pedido
        <Link to={`/purchase?code=${purchase.code}`} style={{ textDecoration: 'none' }}>
          <Button variant="btn-view">View</Button>
        </Link>,
      ],
    };
  });

  return (
    <FullWidthLayout>
      {error ? (
        <ErrorMessage message={error} onRetry={loadHistory} />
      ) : (
        <DataTable
          className="table-history"
          columns={['Code', 'Tax', 'Total', 'Actions']}
          rows={rows}
          fillerCols={4}
        />
      )}
    </FullWidthLayout>
  );
}
