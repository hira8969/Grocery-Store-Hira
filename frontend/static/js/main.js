document.addEventListener('DOMContentLoaded', () => {
    const itemList = document.getElementById('item-list');
    const categoryChipsContainer = document.getElementById('category-chips');
    const categoryOverview = document.getElementById('category-overview');
    const searchBar = document.getElementById('search-bar');
    const searchSuggestions = document.getElementById('search-suggestions');
    const sortSelect = document.getElementById('sort-select');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartItemCountEl = document.getElementById('cart-item-count');
    const cartCountBadge = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartLauncher = document.getElementById('cart-launcher');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const storeOverlay = document.getElementById('store-overlay');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutLink = document.getElementById('logout-link');
    const accountLink = document.getElementById('account-link');
    const heroProductCount = document.getElementById('hero-product-count');
    const heroCategoryCount = document.getElementById('hero-category-count');

    const productModal = document.getElementById('product-modal');
    const productModalClose = document.getElementById('product-modal-close');
    const productModalCategory = document.getElementById('product-modal-category');
    const productModalName = document.getElementById('product-modal-name');
    const productModalDescription = document.getElementById('product-modal-description');
    const productModalPrice = document.getElementById('product-modal-price');
    const productModalStock = document.getElementById('product-modal-stock');
    const productModalRating = document.getElementById('product-modal-rating');
    const productModalAddBtn = document.getElementById('product-modal-add-btn');

    let inventory = [];
    let cart = [];
    let currentUser = null;
    let selectedProductId = null;

    const categoryIcons = {
        All: 'fa-solid fa-store',
        Bakery: 'fa-solid fa-bread-slice',
        Dairy: 'fa-solid fa-cheese',
        Frozen: 'fa-solid fa-snowflake',
        Fruits: 'fa-solid fa-apple-whole',
        Household: 'fa-solid fa-house',
        Meat: 'fa-solid fa-drumstick-bite',
        Pantry: 'fa-solid fa-jar'
    };

    function checkLoginState() {
        const userData = sessionStorage.getItem('groceryUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            welcomeMessage.textContent = `Welcome back, ${currentUser.name}`;
            accountLink.innerHTML = '<i class="fa-solid fa-user-check"></i><span>Signed in</span>';
            accountLink.setAttribute('href', '/my-orders');
            logoutLink.hidden = false;
        } else {
            welcomeMessage.innerHTML = 'Guest mode: <a href="/login">log in to track orders</a>';
            accountLink.innerHTML = '<i class="fa-solid fa-user"></i><span>Login</span>';
            accountLink.setAttribute('href', '/login');
            logoutLink.hidden = true;
        }
    }

    function getRating(item) {
        const seed = (item.id * 7) % 6;
        return (4.2 + seed * 0.1).toFixed(1);
    }

    function getProductDescription(item) {
        return `${item.name} from our ${item.category.toLowerCase()} aisle. Freshly listed with visible stock and a quick add-to-cart flow.`;
    }

    function renderLoadingState() {
        itemList.innerHTML = '';
        categoryOverview.innerHTML = '';

        for (let i = 0; i < 8; i += 1) {
            const card = document.createElement('div');
            card.className = 'product-skeleton';
            card.innerHTML = `
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-line short"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line wide"></div>
            `;
            itemList.appendChild(card);
        }

        for (let i = 0; i < 6; i += 1) {
            const chip = document.createElement('div');
            chip.className = 'category-overview-skeleton skeleton';
            categoryOverview.appendChild(chip);
        }
    }

    async function fetchInventory() {
        renderLoadingState();
        try {
            const response = await fetch('/api/inventory');
            inventory = await response.json();
            heroProductCount.textContent = `${inventory.length}+`;
            heroCategoryCount.textContent = `${new Set(inventory.map(item => item.category)).size}`;
            populateCategories(inventory);
            renderCategoryOverview(inventory);
            renderItems(getFilteredAndSortedItems());
        } catch (error) {
            console.error('Error fetching inventory:', error);
            itemList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Unable to load products</h3><p>Please refresh and try again.</p></div>';
        }
    }

    function getFilteredAndSortedItems() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        const activeChip = document.querySelector('.category-chip.active');
        const category = activeChip ? activeChip.dataset.category : '';
        const sortValue = sortSelect.value;

        const filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = category ? item.category === category : true;
            return matchesSearch && matchesCategory;
        });

        return filtered.sort((a, b) => {
            if (sortValue === 'price-low') return a.price - b.price;
            if (sortValue === 'price-high') return b.price - a.price;
            if (sortValue === 'name') return a.name.localeCompare(b.name);
            return a.id - b.id;
        });
    }

    function renderItems(items) {
        itemList.innerHTML = '';

        if (items.length === 0) {
            itemList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>No products found</h3>
                    <p>Try another search term or switch to a different category.</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('article');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <button type="button" class="item-card-media" data-view-id="${item.id}">
                    <img src="${item.image_url || '/static/images/apple.png'}" alt="${item.name}">
                </button>
                <div class="item-card-meta">
                    <span class="product-pill">${item.category}</span>
                    <span class="product-rating"><i class="fa-solid fa-star"></i> ${getRating(item)}</span>
                </div>
                <h3>${item.name}</h3>
                <p class="category">Fresh pick from the ${item.category.toLowerCase()} aisle</p>
                <p class="stock">${item.quantity > 0 ? `${item.quantity} units in stock` : 'Currently unavailable'}</p>
                <div class="card-footer">
                    <span class="price">Rs. ${item.price.toFixed(2)}</span>
                    <div class="card-actions">
                        <button type="button" class="ghost-btn compact-btn" data-view-id="${item.id}">View</button>
                        <button type="button" class="add-to-cart-btn" data-id="${item.id}" ${item.quantity === 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;

            itemCard.querySelectorAll('[data-view-id]').forEach(button => {
                button.addEventListener('click', () => openProductModal(item.id));
            });

            itemCard.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(item.id));
            itemList.appendChild(itemCard);
        });
    }

    function renderCategoryOverview(items) {
        const counts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        categoryOverview.innerHTML = '';

        Object.keys(counts).sort().forEach(category => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'category-overview-card';
            card.innerHTML = `
                <span class="category-overview-icon"><i class="${categoryIcons[category] || 'fa-solid fa-basket-shopping'}"></i></span>
                <strong>${category}</strong>
                <span>${counts[category]} items</span>
            `;
            card.addEventListener('click', () => activateCategory(category));
            categoryOverview.appendChild(card);
        });
    }

    function populateCategories(items) {
        const categories = [...new Set(items.map(item => item.category))].sort();
        categoryChipsContainer.innerHTML = '';

        const allChip = document.createElement('button');
        allChip.type = 'button';
        allChip.className = 'category-chip active';
        allChip.innerHTML = '<i class="fa-solid fa-store"></i><span>All</span>';
        allChip.dataset.category = '';
        allChip.addEventListener('click', () => handleCategoryClick(allChip));
        categoryChipsContainer.appendChild(allChip);

        categories.forEach(category => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'category-chip';
            chip.innerHTML = `<i class="${categoryIcons[category] || 'fa-solid fa-basket-shopping'}"></i><span>${category}</span>`;
            chip.dataset.category = category;
            chip.addEventListener('click', () => handleCategoryClick(chip));
            categoryChipsContainer.appendChild(chip);
        });
    }

    function activateCategory(category) {
        const target = [...document.querySelectorAll('.category-chip')].find(chip => chip.dataset.category === category);
        if (target) {
            handleCategoryClick(target);
            document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function handleCategoryClick(clickedChip) {
        document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
        clickedChip.classList.add('active');
        renderItems(getFilteredAndSortedItems());
    }

    function renderSearchSuggestions() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        if (!searchTerm) {
            searchSuggestions.hidden = true;
            searchSuggestions.innerHTML = '';
            return;
        }

        const matches = inventory
            .filter(item => item.name.toLowerCase().includes(searchTerm))
            .slice(0, 5);

        if (matches.length === 0) {
            searchSuggestions.hidden = false;
            searchSuggestions.innerHTML = '<div class="suggestion-empty">No matching products</div>';
            return;
        }

        searchSuggestions.hidden = false;
        searchSuggestions.innerHTML = '';

        matches.forEach(item => {
            const suggestion = document.createElement('button');
            suggestion.type = 'button';
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `
                <img src="${item.image_url || '/static/images/apple.png'}" alt="${item.name}">
                <div>
                    <strong>${item.name}</strong>
                    <span>${item.category} · Rs. ${item.price.toFixed(2)}</span>
                </div>
            `;
            suggestion.addEventListener('click', () => {
                searchBar.value = item.name;
                searchSuggestions.hidden = true;
                renderItems(getFilteredAndSortedItems());
                openProductModal(item.id);
            });
            searchSuggestions.appendChild(suggestion);
        });
    }

    function addToCart(itemId) {
        const itemInStock = inventory.find(item => item.id === itemId);
        if (!itemInStock || itemInStock.quantity === 0) {
            return;
        }

        const itemInCart = cart.find(item => item.id === itemId);
        if (itemInCart) {
            if (itemInCart.quantity >= itemInStock.quantity) return;
            itemInCart.quantity += 1;
        } else {
            cart.push({
                id: itemInStock.id,
                name: itemInStock.name,
                price: itemInStock.price,
                quantity: 1,
                image_url: itemInStock.image_url || '/static/images/apple.png'
            });
        }

        updateCartUI();
        openCart();
    }

    function updateCartUI() {
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-state compact-empty-state">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add products to see a clean order summary here.</p>
                </div>
            `;
            cartTotalEl.innerHTML = 'Total: <span>Rs. 0.00</span>';
            cartItemCountEl.textContent = '0';
            cartCountBadge.textContent = '0';
            return;
        }

        cartItemsList.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            itemCount += item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img class="cart-item-image" src="${item.image_url}" alt="${item.name}">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>Rs. ${item.price.toFixed(2)} each</span>
                    <div class="cart-item-controls">
                        <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button type="button" class="remove-from-cart-btn" data-id="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            cartItem.querySelector('.remove-from-cart-btn').addEventListener('click', () => removeFromCart(item.id, true));
            cartItem.querySelectorAll('.cart-qty-btn').forEach(button => {
                button.addEventListener('click', () => {
                    if (button.dataset.action === 'increase') {
                        addToCart(item.id);
                    } else {
                        removeFromCart(item.id, false);
                    }
                });
            });

            cartItemsList.appendChild(cartItem);
        });

        cartTotalEl.innerHTML = `Total: <span>Rs. ${total.toFixed(2)}</span>`;
        cartItemCountEl.textContent = `${itemCount}`;
        cartCountBadge.textContent = `${itemCount}`;
    }

    function removeFromCart(itemId, removeAll) {
        const itemInCart = cart.find(item => item.id === itemId);
        if (!itemInCart) return;

        if (removeAll || itemInCart.quantity === 1) {
            cart = cart.filter(item => item.id !== itemId);
        } else {
            itemInCart.quantity -= 1;
        }

        updateCartUI();
    }

    function openCart() {
        cartSidebar.classList.add('is-open');
        storeOverlay.hidden = false;
    }

    function closeCart() {
        cartSidebar.classList.remove('is-open');
        storeOverlay.hidden = true;
    }

    function openProductModal(productId) {
        const product = inventory.find(item => item.id === productId);
        if (!product) return;

        selectedProductId = productId;
        productModalCategory.textContent = product.category;
        productModalName.textContent = product.name;
        productModalDescription.textContent = getProductDescription(product);
        productModalPrice.textContent = `Rs. ${product.price.toFixed(2)}`;
        productModalStock.textContent = `${product.quantity} units`;
        productModalRating.textContent = `${getRating(product)} / 5`;
        productModal.hidden = false;
        storeOverlay.hidden = false;
    }

    function closeProductModal() {
        productModal.hidden = true;
        if (!cartSidebar.classList.contains('is-open')) {
            storeOverlay.hidden = true;
        }
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            openCart();
            return;
        }

        const username = currentUser ? currentUser.username : 'Guest';

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, username })
            });

            const result = await response.json();
            if (result.success) {
                localStorage.setItem('lastOrder', JSON.stringify(result.order));
                cart = [];
                updateCartUI();
                closeCart();
                fetchInventory();
                window.open('/invoice', '_blank');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', e => {
            e.preventDefault();
            sessionStorage.removeItem('groceryUser');
            currentUser = null;
            checkLoginState();
        });
    }

    if (searchBar) {
        searchBar.addEventListener('input', () => {
            renderItems(getFilteredAndSortedItems());
            renderSearchSuggestions();
        });

        searchBar.addEventListener('focus', renderSearchSuggestions);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => renderItems(getFilteredAndSortedItems()));
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    if (cartLauncher) {
        cartLauncher.addEventListener('click', openCart);
    }

    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }

    if (storeOverlay) {
        storeOverlay.addEventListener('click', () => {
            closeCart();
            closeProductModal();
        });
    }

    if (productModalClose) {
        productModalClose.addEventListener('click', closeProductModal);
    }

    if (productModalAddBtn) {
        productModalAddBtn.addEventListener('click', () => {
            if (selectedProductId !== null) addToCart(selectedProductId);
        });
    }

    document.addEventListener('click', event => {
        if (!event.target.closest('.search-stack')) {
            searchSuggestions.hidden = true;
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === '/') {
            event.preventDefault();
            if (searchBar) {
                searchBar.focus();
            }
        }
        if (event.key === 'Escape') {
            closeProductModal();
            closeCart();
        }
    });

    checkLoginState();
    updateCartUI();
    fetchInventory();
});
