const API_URL = 'http://localhost/categories.php'; 

let categories = [];

const categoryInput = document.getElementById('category');
const taxInput = document.getElementById('taxCategory');
const addBtn = document.querySelector('.addCategory');
const tableBody = document.querySelector('.table-categories tbody');

const inputsToProtect = [
    { element: categoryInput, allowedType: 'text' },
    { element: taxInput, allowedType: 'number' }
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

async function loadCategories() {
    isSystemUpdating = true; 
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Server response error");
        
        categories = await response.json(); 
        updateInterface();
    } catch (error) {
        console.error("Error searching for categories:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error loading categories from server.</td></tr>`;
    } finally {
        setTimeout(() => { isSystemUpdating = false; }, 100);
    }
}

addBtn.addEventListener('click', async () => {
    const nameRaw = categoryInput.value.replace(/\s+/g, ' ').trim();
    const taxRaw = taxInput.value.trim();

    if (nameRaw.length === 0 || nameRaw.length > 30) return alert("Category name must be between 1 and 30 characters.");
    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(nameRaw)) return alert("Invalid Category Name! It cannot contain only numbers or special characters!");
    if (categories.some(c => c.name.replace(/\s+/g, ' ').toLowerCase() === nameRaw.toLowerCase())) return alert("This category already exists!");
    if (taxRaw.length === 0 || taxRaw.length > 5) return alert("Tax must have between 1 and 5 characters (e.g., 10 or 25.50).");
    const taxRegex = /^\d+(\.\d{1,2})?$/; 
    if (!taxRegex.test(taxRaw)) return alert("Invalid Tax format! Use numbers separated by a dot (e.g., 10 or 25.50).");
    
    const taxValue = parseFloat(taxRaw);
    if (isNaN(taxValue) || taxValue < 0 || taxValue > 100) return alert("Tax must be a valid number between 0 and 100.");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nameRaw, tax: taxValue })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return alert(errorData.error || "Error saving category to database.");
        }

        isSystemUpdating = true; 

        categoryInput.value = '';
        taxInput.value = '';
        
        await loadCategories();

    } catch (error) {
        console.error("Error saving:", error);
        alert("Error connecting to the server while trying to save.");
    }
});

window.deleteCategory = async function(code, name) {
    if (confirm(`Delete the category "${name}"?`)) {
        try {
            const response = await fetch(`${API_URL}?code=${code}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                return alert(data.error || `The category could not be deleted: "${name}".`);
            }

            alert(data.message || "Category successfully deleted!");
            
            await loadCategories();
            
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error connecting to the server while trying to delete.");
        }
    }
};

function updateInterface() {
    tableBody.innerHTML = '';
    categories.forEach(c => {
        const tr = document.createElement('tr');
        const categoryNameFormat = c.name.charAt(0).toUpperCase() + c.name.slice(1);
        const taxFormatted = parseFloat(c.tax).toFixed(2); 
        tr.innerHTML = `
            <td>${c.code}</td> <td>${categoryNameFormat}</td>
            <td>${taxFormatted}%</td>
            <td><button class="btn-cancel" onclick="deleteCategory(${c.code}, '${c.name}')">Delete</button></td>
        `;
        tableBody.appendChild(tr);
    });
    
    if (categories.length === 0) {
        tableBody.innerHTML = `<tr class="filler-row"><td></td><td></td><td></td><td></td></tr>`;
    }
}

loadCategories();