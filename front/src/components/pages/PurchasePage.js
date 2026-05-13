import { useState, useEffect } from 'react';

import { useSearchParams, Link } from 'react-router-dom';
import FullWidthLayout from '../templates/FullWidthLayout';
import SummaryCard from '../organisms/SummaryCard';
import DataTable from '../organisms/DataTable';
import TotalsSection from '../organisms/TotalsSection';
import Button from '../atoms/Button';
import * as api from '../../services/api';

// Página de detalhes de uma compra específica (acessada via histórico)
export default function PurchasePage() {

  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState(null);

  // Obtém o código do pedido pela URL e carrega os detalhes da API
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      alert('Purchase not found!');
      window.location.href = '/history';
      return; 
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

  // Não renderiza nada enquanto os dados não carregarem
  if (!purchase) return null;

  // Monta os itens do card de resumo (código, data, status)
  const transactionCode = String(purchase.code).padStart(3, '0');
  const summaryItems = [
    { label: 'Code:', value: transactionCode },
    { label: 'Date:', value: '', hidden: true },
    { label: 'Status:', value: 'Finished', valueClassName: 'status-finished' },
  ];

  // Monta as linhas da tabela com cálculo de imposto e total por item
  const rows = (purchase.items || []).map((item, i) => {
    const itemPrice = parseFloat(item.price);
    const itemTax = parseFloat(item.tax);
    const itemAmount = parseInt(item.amount);
    const productBaseTotal = itemPrice * itemAmount;
    const taxValue = (productBaseTotal * itemTax) / 100;
    const finalItemTotal = productBaseTotal + taxValue;

    return {
      key: i, 
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

  return (
    <FullWidthLayout>
      {/* Card de resumo com código e status do pedido */}
      <SummaryCard items={summaryItems} />

      {/* Tabela com os itens do pedido */}
      <DataTable
        className="table-purchase"
        columns={['Product', 'Unit price', 'Amount', 'Total']}
        rows={rows}
        fillerCols={4}
      />

      {/* Rodapé com botão de voltar e seção de totais */}
      <div className="details-footer">
        <Link to="/history">
          <Button variant="btn-cancel">Back to History</Button>
        </Link>

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
