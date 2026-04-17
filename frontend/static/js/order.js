document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('orders-list');
    const ordersTitle = document.getElementById('orders-title');
    let currentUser = null;

    // 1. Check if user is logged in
    const userData = sessionStorage.getItem('groceryUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        ordersTitle.textContent = `Hello, ${currentUser.name}! Here are your orders.`;
        fetchOrders(currentUser.username);
    } else {
        // Not logged in, redirect to login page
        ordersTitle.textContent = 'You are not logged in. Redirecting...';
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    }

    // 2. Fetch orders for this customer
    async function fetchOrders(username) {
        try {
            const response = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            
            const result = await response.json();

            if (result.success) {
                renderOrders(result.orders);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<tr><td colspan="4">Error loading orders.</td></tr>';
        }
    }

    // 3. Display the orders in the table
    function renderOrders(orders) {
        ordersList.innerHTML = ''; // Clear list
        if (orders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="4">You have not placed any orders yet.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Create a simple list of items
            const itemsSummary = order.items
                .map(item => `${item.name} (x${item.quantity})`)
                .join('<br>'); // New line for each item
            
            const orderDate = new Date(order.date).toLocaleString();

            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${orderDate}</td>
                <td>₹${order.totalAmount.toFixed(2)}</td>
                <td>${itemsSummary}</td>
            `;
            ordersList.appendChild(row);
        });
    }
});