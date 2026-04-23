const ENDPOINTS = {
    products: 'http://localhost/products.php',   
    categories: 'http://localhost/categories.php' 
};

let products = [];
let categoriesList = [];

const productNameInput = document.getElementById('productName');
const amountInput = document.getElementById('amount');
const unitPriceInput = document.getElementById('unitPrice');
const categorySelect = document.getElementById('category');
const addBtn = document.querySelector('.addProduct');
const tableBody = document.querySelector('.table-products tbody');

const inputsToProtect = [
    { element: productNameInput, allowedType: 'text' },
    { element: amountInput, allowedType: 'number' },
    { element: unitPriceInput, allowedType: 'number' }
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
                console.warn(`Blocked! The type of ${target.id} has been restored.`);
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

async function fetchProducts() {
    try {
        const response = await fetch(ENDPOINTS.products);
        const data = await response.json();
        
        products = Array.isArray(data) ? data : []; 
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        products = []; 
    }
}

async function init() {
    isSystemUpdating = true; 
    
    await populateCategories();
    await fetchProducts(); 
    await updateInterface();
    
    setTimeout(() => { isSystemUpdating = false; }, 100);
}

async function populateCategories() {
    try {
        const response = await fetch(ENDPOINTS.categories);
        categoriesList = await response.json() || [];
        
        categorySelect.innerHTML = '<option value="" selected disabled>Category</option>';
        categoriesList.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code; 
            option.textContent = c.name.charAt(0).toUpperCase() + c.name.slice(1);
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error searching for categories:', error);
    }
}

addBtn.addEventListener('click', async () => {
    const name = productNameInput.value.replace(/\s+/g, ' ').trim();
    
    const amountRaw = amountInput.value.trim();
    const priceRaw = unitPriceInput.value.trim();
    const categoryCode = parseInt(categorySelect.value, 10);
    
    if (name.length === 0 || name.length > 30) {
        return alert("Product name must be between 1 and 30 characters.");
    }

    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(name)) {
        return alert("Invalid Product Name! It must contain at least one letter.");
    }

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return alert("Product already exists!");
    }
    
    if (amountRaw.length === 0 || amountRaw.length > 5) return alert("Amount is invalid or too large.");
    
    const amountRegex = /^\d+$/; 
    if (!amountRegex.test(amountRaw)) return alert("Invalid Amount! Use only integers.");
    const amount = parseInt(amountRaw, 10);
    if (isNaN(amount) || amount <= 0 || amount > 9999) return alert("Amount must be between 1 and 9999.");

    if (priceRaw.length === 0 || priceRaw.length > 10) return alert("Price is invalid or too large.");
    const normalizedPrice = priceRaw.replace(',', '.');
    
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(normalizedPrice)) return alert("Invalid Price format! Use e.g., 10 or 25.50");
    const price = parseFloat(normalizedPrice);
    if (isNaN(price) || price <= 0 || price > 99999.99) return alert("Price must be between 0.01 and 99999.99.");

    if (isNaN(categoryCode)) return alert("Please select a category.");

    addBtn.disabled = true;

    const nextCode = products.length > 0 ? Math.max(...products.map(p => parseInt(p.code, 10))) + 1 : 1;

    const newProduct = { code: nextCode, name, amount, price, category_code: categoryCode };

    try {
        const response = await fetch(ENDPOINTS.products, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            isSystemUpdating = true; 

            await fetchProducts(); 
            
            productNameInput.value = ''; 
            amountInput.value = ''; 
            unitPriceInput.value = ''; 
            categorySelect.value = '';
            
            await updateInterface();
            
            setTimeout(() => { isSystemUpdating = false; }, 100);
        } else {
            alert('Error saving product to server.');
        }
    } catch (error) {
        console.error('Error in POST request:', error);
    } finally {
        addBtn.disabled = false;
    }
});
  
window.deleteProduct = async function(code) {
    const productToDelete = products.find(p => parseInt(p.code) === parseInt(code));
    if (!productToDelete) return;   

    const cartData = localStorage.getItem('suite_cart'); 
    if (cartData) {
        const cart = JSON.parse(cartData);
        const isProductInCart = cart.some(item => parseInt(item.product.code) === parseInt(code));

        if (isProductInCart) {
            return alert(`It cannot be deleted: The "${productToDelete.name}" product is currently in the shopping cart on the Home page!`);
        }
    }

    if (confirm(`Delete the product "${productToDelete.name}"?`)) {
        try {
            const response = await fetch(`${ENDPOINTS.products}?code=${code}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Product successfully deleted!");
                
                isSystemUpdating = true; 
                await fetchProducts(); 
                await updateInterface();    
                setTimeout(() => { isSystemUpdating = false; }, 100);

            } else {
                alert(data.error || 'Error deleting product on the server.');
            }
        } catch (error) {
            console.error('Error in DELETE request:', error);
            alert("Error connecting to the server while trying to delete.");
        }
    }
};

async function updateInterface() {
    tableBody.innerHTML = '';
    
    const visibleProducts = products.filter(p => parseInt(p.amount) > 0);

    visibleProducts.forEach(p => {
        const tr = document.createElement('tr');
        
        const catObj = categoriesList.find(c => parseInt(c.code) === parseInt(p.category_code));
        const catName = catObj ? catObj.name : 'Unknown';
        const catFormat = catName.charAt(0).toUpperCase() + catName.slice(1);
        
        const displayCode = String(p.code).padStart(3, '0');
        
        tr.innerHTML = `
            <td><strong>${displayCode}</strong></td> <td>${p.name}</td>
            <td>${catFormat}</td>
            <td>$${Number(p.price).toFixed(2)}</td>
            <td>${p.amount}</td> 
            <td><button class="btn-cancel" onclick="deleteProduct(${p.code})">Delete</button></td>
        `;
        tableBody.appendChild(tr);
    });
    
    if (visibleProducts.length === 0) {
        tableBody.innerHTML = `<tr class="filler-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }
}

init();