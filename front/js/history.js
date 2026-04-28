const API_URL = 'http://localhost/history.php';
const tableBody = document.querySelector('.table-history tbody');

async function init() {
    await updateInterface();
}

async function updateInterface() {
    try {
        const response = await fetch(API_URL);
        const purchaseHistory = await response.json() || [];
        
        tableBody.innerHTML = '';

        purchaseHistory.forEach(purchase => {
            const tr = document.createElement('tr');
            const transactionCode = String(purchase.code).padStart(3, '0'); 
            
            tr.innerHTML = `
                <td>${transactionCode}</td>
                <td>$${parseFloat(purchase.tax).toFixed(2)}</td>
                <td>$${parseFloat(purchase.total).toFixed(2)}</td>
                <td>
                    <a href="purchase.html?code=${purchase.code}" style="text-decoration: none;">
                        <button class="btn-view">View</button>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        if (purchaseHistory.length === 0) {
            tableBody.innerHTML = `<tr class="filler-row"><td></td><td></td><td></td><td></td></tr>`;
        }
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar histórico.</td></tr>`;
    }
}

init();