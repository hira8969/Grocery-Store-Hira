document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const logoutBtn = document.getElementById('logout-btn');

    const itemForm = document.getElementById('item-form');
    const formMessage = document.getElementById('form-message');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formCancelBtn = document.getElementById('form-cancel-btn');
    const inventoryList = document.getElementById('inventory-list');
    
    // --- NEW: Order List Element ---
    const ordersList = document.getElementById('orders-list');

    // --- State ---
    let editingItemId = null; 

    // --- Utility Functions ---
    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.className = isError ? 'message error' : 'message success';
        element.style.display = 'block';
        setTimeout(() => { element.style.display = 'none'; }, 3000);
    }

    function resetForm() {
        itemForm.reset();
        editingItemId = null;
        formSubmitBtn.textContent = 'Add Item';
        formCancelBtn.style.display = 'none';
    }

    // --- Authentication ---
    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // NOTE: This now calls '/api/login' (the admin login)
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('isAdmin', 'true');
                showAdminContent(true);
            } else {
                showMessage(loginMessage, result.message, true);
            }
        } catch (error) {
            showMessage(loginMessage, 'Login request failed.', true);
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('isAdmin');
        showAdminContent(false);
    }

    function showAdminContent(isLoggedIn) {
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            adminContent.style.display = 'block';
            loadInventory(); 
            loadOrders(); // <-- NEW: Load orders on login
        } else {
            loginSection.style.display = 'block';
            adminContent.style.display = 'none';
        }
    }

    function checkLoginState() {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            showAdminContent(true);
        } else {
            showAdminContent(false);
        }
    }

    // ---
    // NEW: Load Orders Function
    // ---
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();
            
            ordersList.innerHTML = ''; // Clear list
            if (orders.length === 0) {
                ordersList.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                
                // Create a simple list of items
                const itemsSummary = order.items
                    .map(item => `${item.name} (x${item.quantity})`)
                    .join('<br>');
                
                const orderDate = new Date(order.date).toLocaleString();

                row.innerHTML = `
                    <td>${order.orderId}</td>
                    <td><strong>${order.username}</strong></td>
                    <td>₹${order.totalAmount.toFixed(2)}</td>
                    <td>${orderDate}</td>
                    <td>${itemsSummary}</td>
                `;
                ordersList.appendChild(row);
            });

        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<tr><td colspan="5">Error loading orders.</td></tr>';
        }
    }


    // --- Inventory Management ---
    // (All inventory functions are unchanged)
    
    async function loadInventory() {
        try {
            const response = await fetch('/api/inventory');
            const inventory = await response.json();
            renderInventoryTable(inventory);
        } catch (error) {
            showMessage(formMessage, 'Failed to load inventory.', true);
        }
    }

    function renderInventoryTable(inventory) {
        inventoryList.innerHTML = '';
        inventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>${item.category}</td>
                <td>
                    <button class="btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn-delete" data-id="${item.id}">Delete</button>
                </td>
            `;
            row.querySelector('.btn-edit').addEventListener('click', () => {
                populateFormForEdit(item);
            });
            row.querySelector('.btn-delete').addEventListener('click', () => {
                deleteItem(item.id, item.name);
            });
            inventoryList.appendChild(row);
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const itemData = {
            name: document.getElementById('item-name').value,
            price: document.getElementById('item-price').value,
            quantity: document.getElementById('item-quantity').value,
            category: document.getElementById('item-category').value,
        };
        let url = '/api/inventory/add';
        let successMessage = 'Item added successfully.';
        if (editingItemId) {
            url = '/api/inventory/update';
            itemData.id = editingItemId;
            successMessage = 'Item updated successfully.';
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            const result = await response.json();
            if (result.success) {
                showMessage(formMessage, successMessage);
                resetForm();
                loadInventory(); 
            } else {
                showMessage(formMessage, `Error: ${result.message}`, true);
            }
        } catch (error) {
            showMessage(formMessage, 'Request failed.', true);
        }
    }

    function populateFormForEdit(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-category').value = item.category;
        editingItemId = item.id;
        formSubmitBtn.textContent = 'Update Item';
        formCancelBtn.style.display = 'inline-block';
        window.scrollTo(0, 0); 
    }

    async function deleteItem(id, name) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }
        try {
            const response = await fetch('/api/inventory/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await response.json();
            if (result.success) {
                showMessage(formMessage, 'Item deleted.');
                loadInventory(); 
            } else {
                showMessage(formMessage, `Error: ${result.message}`, true);
            }
        } catch (error) {
            showMessage(formMessage, 'Request failed.', true);
        }
    }

    // --- Initial Load & Event Listeners ---
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    itemForm.addEventListener('submit', handleFormSubmit);
    formCancelBtn.addEventListener('click', resetForm);

    checkLoginState(); 
});