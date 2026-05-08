const ENDPOINTS = {
    products: 'http://localhost/products.php',
    categories: 'http://localhost/categories.php',
    checkout: 'http://localhost/checkout.php' 
};

let productsDb = [];
let categoriesDb = [];
let cart = JSON.parse(localStorage.getItem('suite_cart')) || [];

const prodSelect = document.getElementById('prod'); 
const amountInput = document.getElementById('amount');
const taxInput = document.getElementById('tax');
const priceInput = document.getElementById('price');
const addBtn = document.querySelector('.addProduct');
const tableBody = document.querySelector('.tabelaProdutos tbody');
const cancelBtn = document.querySelector('.btn-cancel');
const finishBtn = document.querySelector('.btn-finish');

const totalSpans = document.querySelectorAll('.totals-section .total-row span');
const taxTotalDisplay = totalSpans[0];   
const grandTotalDisplay = totalSpans[1]; 

const inputsToProtect = [
    { element: amountInput, allowedType: 'number' },
    { element: taxInput, allowedType: 'number' },
    { element: priceInput, allowedType: 'number' }
];

let isSystemUpdating = false;

const observer = new MutationObserver((mutations) => {
    if (isSystemUpdating) return; 

    let unauthorizedTampering = false;

    mutations.forEach((mutation) => {
        const target = mutation.target;

        if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
            const originalConfig = inputsToProtect.find(item => item.element === target);
            if (originalConfig && target.getAttribute('type') !== originalConfig.allowedType) {
                target.setAttribute('type', originalConfig.allowedType);
                console.warn(`Fraud attempt blocked! The field type for ${target.id} has been restored.`);
            }
            return; 
        }

        unauthorizedTampering = true;
    });

    if (unauthorizedTampering) {
        console.warn("Unauthorized HTML manipulation detected! Reloading the page...");
        observer.disconnect(); 
        window.location.reload(); 
    }
});

inputsToProtect.forEach(item => {
    if (item.element) {
        item.element.setAttribute('type', item.allowedType);
    }
});

observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    characterData: true, 
    attributes: true 
});

async function init() {
    isSystemUpdating = true; 

    taxInput.readOnly = true; priceInput.readOnly = true;
    taxInput.style.backgroundColor = '#f0f0f0'; priceInput.style.backgroundColor = '#f0f0f0';
    
    await loadData(); 

    const validCartItems = cart.filter(cartItem => {
        return productsDb.some(dbProd => parseInt(dbProd.code) === parseInt(cartItem.product.code));
    });

    if (validCartItems.length !== cart.length) {
        cart = validCartItems; 
        localStorage.setItem('suite_cart', JSON.stringify(cart)); 
        console.warn("Itens obsoletos foram removidos do carrinho.");
    }

    updateInterface(); 

    setTimeout(() => { isSystemUpdating = false; }, 100);
}

async function loadData() {
    try {
        const responseProd = await fetch(ENDPOINTS.products);
        const dataProd = await responseProd.json();
        productsDb = Array.isArray(dataProd) ? dataProd : []; 
        
        const responseCat = await fetch(ENDPOINTS.categories);
        const dataCat = await responseCat.json();
        categoriesDb = Array.isArray(dataCat) ? dataCat : []; 
        
    } catch (error) {
        console.error('Erro ao buscar dados do banco:', error);
        productsDb = []; 
        categoriesDb = [];
    }
}

function populateProducts() {
    prodSelect.innerHTML = '<option value="" selected disabled>Select a Product</option>';
    
    productsDb.forEach(p => {
        const itemInCart = cart.find(item => parseInt(item.product.code) === parseInt(p.code));
        const amountInCart = itemInCart ? itemInCart.amount : 0;
        
        const availableStock = parseInt(p.amount) - amountInCart;

        if (availableStock > 0) {
            const option = document.createElement('option');
            option.value = p.code; 
            option.textContent = p.name.charAt(0).toUpperCase() + p.name.slice(1);
            prodSelect.appendChild(option);
        }
    });
}

prodSelect.addEventListener('change', (e) => {
    isSystemUpdating = true;

    const selectedCode = parseInt(e.target.value);
    
    const product = productsDb.find(p => parseInt(p.code) === selectedCode);
    if (product) {
        const category = categoriesDb.find(c => parseInt(c.code) === parseInt(product.category_code));
        taxInput.value = category ? parseFloat(category.tax).toFixed(2) : 0;
        priceInput.value = parseFloat(product.price).toFixed(2);
    } else {
        taxInput.value = ''; priceInput.value = '';
    }

    setTimeout(() => { isSystemUpdating = false; }, 50);
});

addBtn.addEventListener('click', () => {
    const selectedCode = parseInt(prodSelect.value);
    const rawAmount = amountInput.value.trim();
    
    // Mantendo TODOS os alertas originais
    if (isNaN(selectedCode)) return alert("Please select a valid product.");
    
    const product = productsDb.find(p => parseInt(p.code) === selectedCode);
    if (!product) return alert("Product not found in database.");

    if (!/^\d+$/.test(rawAmount) || parseInt(rawAmount) <= 0) return alert("Invalid amount.");

    const amount = parseInt(rawAmount);
    const existingCartItem = cart.find(item => parseInt(item.product.code) === parseInt(product.code));
    const totalDesiredAmount = existingCartItem ? existingCartItem.amount + amount : amount;

    if (totalDesiredAmount > parseInt(product.amount)) {
        return alert(`Stock limit reached! Available: ${product.amount - (existingCartItem ? existingCartItem.amount : 0)} more.`);
    }

    const category = categoriesDb.find(c => parseInt(c.code) === parseInt(product.category_code));

    if (existingCartItem) { 
        existingCartItem.amount = totalDesiredAmount; 
    } else {
        cart.push({ product, category, amount });
    }

    isSystemUpdating = true; 

    prodSelect.value = ''; amountInput.value = ''; taxInput.value = ''; priceInput.value = '';
    updateInterface();

    setTimeout(() => { isSystemUpdating = false; }, 100);
}); 

cancelBtn.addEventListener('click', () => {
    if (cart.length > 0 && confirm("Cancel this purchase?")) {
        isSystemUpdating = true;
        cart = []; 
        updateInterface();
        setTimeout(() => { isSystemUpdating = false; }, 100);
    }
});

finishBtn.addEventListener('click', async () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    
    if (confirm("Finalize this purchase?")) {
        try {
            const response = await fetch(ENDPOINTS.checkout, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });

            if (response.ok) {
                isSystemUpdating = true; 
                cart = [];
                localStorage.removeItem('suite_cart');
                window.location.href = 'history.html'; 
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Error processing purchase on the server.");
            }
        } catch(error) {
            console.error("Error in checkout request:", error);
            alert("Connection error while trying to complete the purchase.");
        }
    }
});

window.deleteItem = function(productCode) {
    if (confirm("Do you really want to remove this product from the cart?")) {
        isSystemUpdating = true;
        cart = cart.filter(item => parseInt(item.product.code) !== parseInt(productCode));
        updateInterface();
        setTimeout(() => { isSystemUpdating = false; }, 100);
    }
};

function updateInterface() {
    localStorage.setItem('suite_cart', JSON.stringify(cart)); 
    populateProducts(); 

    tableBody.innerHTML = ''; let totalTax = 0; let grandTotal = 0;

    cart.forEach(item => {
        const price = parseFloat(item.product.price) || 0;
        
        const categoryObj = categoriesDb.find(c => parseInt(c.code) === parseInt(item.product.category_code)) || item.category;
        const tax = categoryObj && !isNaN(parseFloat(categoryObj.tax)) ? parseFloat(categoryObj.tax) : 0;
        
        const productTotal = price * item.amount;
        const taxValue = (productTotal * tax) / 100;
        const finalRowTotal = productTotal + taxValue;
        
        totalTax += taxValue; grandTotal += finalRowTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.product.name}</td>
            <td>$${price.toFixed(2)}</td>
            <td>${item.amount}</td>
            <td>$${taxValue.toFixed(2)}</td>
            <td>$${finalRowTotal.toFixed(2)}</td>
            <td>
                <button onclick="deleteItem(${item.product.code})" class="btn-cancel" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if(cart.length === 0) {
        tableBody.innerHTML = `<tr class="filler-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
        taxTotalDisplay.textContent = `$0.00`; grandTotalDisplay.textContent = `$0.00`;
    } else {
        taxTotalDisplay.textContent = `$${totalTax.toFixed(2)}`; grandTotalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    }
}

init();