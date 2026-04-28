import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

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

  const rows = history.map((purchase) => {
    const transactionCode = String(purchase.code).padStart(3, '0');
    return {
      key: purchase.code,
      cells: [
        transactionCode,
        parseFloat(purchase.tax).toFixed(2),
        parseFloat(purchase.total).toFixed(2),
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
