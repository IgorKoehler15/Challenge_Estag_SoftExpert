import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

// Página de histórico de compras — exibe todos os pedidos finalizados
export default function HistoryPage() {

  const [history, setHistory] = useState([]);

  // Carrega o histórico de pedidos da API ao montar o componente
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
      <DataTable
        className="table-history"
        columns={['Code', 'Tax', 'Total', 'Actions']}
        rows={rows}
        fillerCols={4}
      />
    </FullWidthLayout>
  );
}
