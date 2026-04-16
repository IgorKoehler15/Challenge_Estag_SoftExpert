const API_URL = 'http://localhost/history.php';

const summarySpans = document.querySelectorAll('.summary-item span');
const codeDisplay = summarySpans[0];
const dateDisplay = summarySpans[1];

dateDisplay.parentElement.style.display = 'none';

const tableBody = document.querySelector('.table-purchase tbody');

const totalSpans = document.querySelectorAll('.totals-section .total-row span');
const taxTotalDisplay = totalSpans[0];
const grandTotalDisplay = totalSpans[1];

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseCodeParam = urlParams.get('code');

    if (!purchaseCodeParam) {
        alert("Purchase not found!");
        window.location.href = 'history.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}?code=${purchaseCodeParam}`);
        if (!response.ok) throw new Error("Order not found");
        
        const purchase = await response.json();
        updateInterface(purchase);
    } catch (error) {
        console.error("Error when searching:", error);
        alert("Error retrieving order details.");
        window.location.href = 'history.html';
    }
}

function updateInterface(purchase) {
    const transactionCode = String(purchase.code).padStart(3, '0');
    codeDisplay.textContent = transactionCode;
    
    tableBody.innerHTML = '';

    purchase.items.forEach(item => {
        const tr = document.createElement('tr');
        
        const price = parseFloat(item.price);
        const tax = parseFloat(item.tax);
        const amount = parseInt(item.amount);

        const productBaseTotal = price * amount;
        const taxValue = (productBaseTotal * tax) / 100;
        const finalItemTotal = productBaseTotal + taxValue;

        tr.innerHTML = `
            <td>
                <strong>${item.product_name}</strong> 
                <br>
                <span style="font-size: 0.8rem; color: red;">(Tax: ${tax}%)</span>
            </td>
            <td>$${price.toFixed(2)}</td>
            <td>${amount}</td>
            <td>$${finalItemTotal.toFixed(2)}</td>
        `;
        tableBody.appendChild(tr);
    });

    if (!purchase.items || purchase.items.length === 0) {
        tableBody.innerHTML = `<tr class="filler-row"><td></td><td></td><td></td><td></td></tr>`;
    }

    taxTotalDisplay.textContent = `$${parseFloat(purchase.tax).toFixed(2)}`;
    grandTotalDisplay.textContent = `$${parseFloat(purchase.total).toFixed(2)}`;
}

init();