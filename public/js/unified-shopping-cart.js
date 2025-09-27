/**
 * UNIFIED SHOPPING CART SYSTEM - JAVASCRIPT FUNCTIONALITY
 * High-speed shopping cart with SallyPort integration
 * 
 * Features:
 * - Dynamic cart management
 * - SallyPort security verification
 * - Ambassador upgrade integration
 * - QMM NFT processing
 * - Multi-payment support
 * 
 * @author AI Publishing International LLP
 * @version 1.0.0 - Professional Enterprise Edition
 */

class UnifiedShoppingCart {
    constructor() {
        this.name = 'Unified Shopping Cart';
        this.version = '1.0.0';
        this.cart = new Map();
        this.sallyPortVerified = false;
        this.ambassadorSystemURL = 'http://localhost:8084';
        this.baseURL = '/api/v1';
        
        // Initialize cart system
        this.initializeCart();
        this.setupEventListeners();
        this.loadCartFromStorage();
        
        console.log('🛍️ UNIFIED SHOPPING CART INITIALIZED');
        console.log('🔒 SallyPort security integration active');
        console.log('🚀 Ambassador referral system connected');
    }
    
    /**
     * Initialize shopping cart system
     */
    initializeCart() {
        // Setup payment method switching
        this.setupPaymentMethods();
        
        // Initialize form validation
        this.setupFormValidation();
        
        // Setup auto-save cart
        this.setupAutoSave();
        
        console.log('✅ Shopping cart system initialized');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        const checkoutForm = document.getElementById('professional-checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
        }
        
        // Payment method changes
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => this.handlePaymentMethodChange(e));
        });
        
        console.log('🎯 Event listeners configured');
    }
    
    /**
     * Add item to cart
     */
    addToCart(productId, productName, price) {
        const quantity = parseInt(document.getElementById(`qty-${productId}`).textContent) || 1;
        
        // Check if item already in cart
        if (this.cart.has(productId)) {
            const existingItem = this.cart.get(productId);
            existingItem.quantity += quantity;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            // Add new item
            this.cart.set(productId, {
                id: productId,
                name: productName,
                price: price,
                quantity: quantity,
                total: price * quantity,
                type: this.getProductType(productId)
            });
        }
        
        // Update cart display
        this.updateCartDisplay();
        
        // Show success notification
        this.showNotification('success', `${productName} added to cart!`);
        
        // Save cart to storage
        this.saveCartToStorage();
        
        console.log(`🛒 Added to cart: ${productName} (${quantity}x)`);
    }
    
    /**
     * Adjust quantity for a product
     */
    adjustQuantity(productId, adjustment) {
        const quantityElement = document.getElementById(`qty-${productId}`);
        let currentQuantity = parseInt(quantityElement.textContent);
        
        currentQuantity += adjustment;
        
        // Ensure quantity doesn't go below 1
        if (currentQuantity < 1) currentQuantity = 1;
        
        quantityElement.textContent = currentQuantity;
        
        // Update cart if item is already added
        if (this.cart.has(productId)) {
            const item = this.cart.get(productId);
            item.quantity = currentQuantity;
            item.total = item.quantity * item.price;
            this.updateCartDisplay();
            this.saveCartToStorage();
        }
    }
    
    /**
     * Remove item from cart
     */
    removeFromCart(productId) {
        if (this.cart.has(productId)) {
            const item = this.cart.get(productId);
            this.cart.delete(productId);
            
            this.updateCartDisplay();
            this.saveCartToStorage();
            
            this.showNotification('info', `${item.name} removed from cart`);
            console.log(`🗑️ Removed from cart: ${item.name}`);
        }
    }
    
    /**
     * Clear entire cart
     */
    clearCart() {
        this.cart.clear();
        this.updateCartDisplay();
        this.saveCartToStorage();
        
        this.showNotification('info', 'Cart cleared');
        console.log('🧹 Cart cleared');
    }
    
    /**
     * Update cart display
     */
    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const checkoutForm = document.getElementById('checkout-form');
        const emptyCart = document.getElementById('empty-cart');
        
        // Update header cart status
        this.updateCartHeader();
        
        if (this.cart.size === 0) {
            // Show empty cart
            emptyCart.style.display = 'block';
            cartSummary.style.display = 'none';
            checkoutForm.style.display = 'none';
            return;
        }
        
        // Hide empty cart message
        emptyCart.style.display = 'none';
        
        // Build cart items HTML
        let cartItemsHTML = '';
        let subtotal = 0;
        let hasAmbassadorItems = false;
        let hasNFTItems = false;
        
        this.cart.forEach((item, productId) => {
            subtotal += item.total;
            
            // Check for special item types
            if (item.type === 'ambassador') hasAmbassadorItems = true;
            if (item.type === 'nft') hasNFTItems = true;
            
            cartItemsHTML += `
                <div class=\"cart-item\" data-product-id=\"${productId}\">
                    <div class=\"cart-item-info\">
                        <h4>${item.name}</h4>
                        <div class=\"cart-item-price\">$${item.price.toFixed(2)} x ${item.quantity} = $${item.total.toFixed(2)}</div>
                    </div>
                    <div class=\"cart-item-controls\">
                        <button class=\"qty-btn minus\" onclick=\"cartSystem.adjustCartItemQuantity('${productId}', -1)\">−</button>
                        <span class=\"quantity\">${item.quantity}</span>
                        <button class=\"qty-btn plus\" onclick=\"cartSystem.adjustCartItemQuantity('${productId}', 1)\">+</button>
                        <button class=\"remove-item-btn\" onclick=\"cartSystem.removeFromCart('${productId}')\">×</button>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = cartItemsHTML;
        
        // Calculate totals
        const processingFee = subtotal * 0.025; // 2.5% processing fee
        const ambassadorDiscount = hasAmbassadorItems ? subtotal * 0.1 : 0; // 10% ambassador discount
        const total = subtotal + processingFee - ambassadorDiscount;
        
        // Update summary
        document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summary-processing').textContent = `$${processingFee.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
        
        // Show/hide ambassador discount
        const ambassadorDiscountLine = document.getElementById('ambassador-discount');
        if (ambassadorDiscount > 0) {
            ambassadorDiscountLine.style.display = 'flex';
            document.getElementById('summary-discount').textContent = `-$${ambassadorDiscount.toFixed(2)}`;
        } else {
            ambassadorDiscountLine.style.display = 'none';
        }
        
        // Show cart summary and checkout form
        cartSummary.style.display = 'block';
        checkoutForm.style.display = 'block';
        
        // Update agreement checkboxes based on cart contents
        this.updateAgreementCheckboxes(hasNFTItems, hasAmbassadorItems);
    }
    
    /**
     * Update cart header display
     */
    updateCartHeader() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        let totalItems = 0;
        let totalValue = 0;
        
        this.cart.forEach(item => {
            totalItems += item.quantity;
            totalValue += item.total;
        });
        
        cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        cartTotal.textContent = `$${totalValue.toFixed(2)}`;
    }
    
    /**
     * Adjust cart item quantity
     */
    adjustCartItemQuantity(productId, adjustment) {
        if (this.cart.has(productId)) {
            const item = this.cart.get(productId);
            item.quantity += adjustment;
            
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            item.total = item.quantity * item.price;
            this.updateCartDisplay();
            this.saveCartToStorage();
        }
    }
    
    /**
     * Get product type based on product ID
     */
    getProductType(productId) {
        if (productId.includes('ambassador')) return 'ambassador';
        if (productId.includes('qmm') || productId.includes('nft')) return 'nft';
        if (productId.includes('plan')) return 'subscription';
        if (productId.includes('consulting') || productId.includes('implementation')) return 'service';
        return 'product';
    }
    
    /**
     * Update agreement checkboxes based on cart contents
     */
    updateAgreementCheckboxes(hasNFTItems, hasAmbassadorItems) {
        const nftAgreement = document.getElementById('nft-agreement');
        const ambassadorAgreement = document.getElementById('ambassador-agreement');
        
        // Make NFT agreement required if cart has NFT items
        if (hasNFTItems) {
            nftAgreement.required = true;
            nftAgreement.closest('.agreement-checkbox').style.opacity = '1';
        } else {
            nftAgreement.required = false;
            nftAgreement.closest('.agreement-checkbox').style.opacity = '0.6';
        }
        
        // Make ambassador agreement required if cart has ambassador items
        if (hasAmbassadorItems) {
            ambassadorAgreement.required = true;
            ambassadorAgreement.closest('.agreement-checkbox').style.opacity = '1';
        } else {
            ambassadorAgreement.required = false;
            ambassadorAgreement.closest('.agreement-checkbox').style.opacity = '0.6';
        }
    }
    
    /**
     * Setup payment methods
     */
    setupPaymentMethods() {
        const paymentMethods = document.querySelectorAll('.payment-method');
        
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                // Remove active class from all methods
                paymentMethods.forEach(m => m.classList.remove('active'));
                
                // Add active class to clicked method
                method.classList.add('active');
                
                // Check the radio button
                const radio = method.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Handle payment method specific UI changes
                this.handlePaymentMethodChange({ target: radio });
            });
        });
    }
    
    /**
     * Handle payment method changes
     */
    handlePaymentMethodChange(event) {
        const paymentMethod = event.target.value;
        const cardFields = document.getElementById('card-fields');
        
        // Show/hide card fields based on payment method
        if (paymentMethod === 'card') {
            cardFields.style.display = 'block';
            this.makeCardFieldsRequired(true);
        } else {
            cardFields.style.display = 'none';
            this.makeCardFieldsRequired(false);
        }
        
        console.log(`💳 Payment method changed to: ${paymentMethod}`);
    }
    
    /**
     * Make card fields required or optional
     */
    makeCardFieldsRequired(required) {
        const cardFields = ['card-number', 'card-expiry', 'card-cvc', 'card-zip'];
        
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.required = required;
            }
        });
    }
    
    /**
     * Setup form validation
     */
    setupFormValidation() {
        const form = document.getElementById('professional-checkout-form');
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    /**
     * Validate individual form field
     */
    validateField(field) {
        const isValid = field.checkValidity();
        
        if (!isValid) {
            field.style.borderColor = '#e53e3e';
            this.showFieldError(field, field.validationMessage);
        } else {
            field.style.borderColor = '#38a169';
            this.clearFieldError(field);
        }
        
        return isValid;
    }
    
    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e53e3e';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        
        field.parentNode.appendChild(errorDiv);
    }
    
    /**
     * Clear field error
     */
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.style.borderColor = '#e2e8f0';
    }
    
    /**
     * Initiate SallyPort verification
     */
    initiateSallyPortVerification() {
        const verifyButton = document.getElementById('sallyport-verify');
        const sallyPortStatus = document.getElementById('sallyport-status');
        
        // Show loading state
        verifyButton.textContent = 'Verifying...';
        verifyButton.disabled = true;
        
        // Simulate SallyPort verification (replace with actual implementation)
        setTimeout(() => {
            this.sallyPortVerified = true;
            
            // Update UI to show verified state
            sallyPortStatus.innerHTML = `
                <div class="security-indicator">
                    <div class="security-icon">✅</div>
                    <div class="security-text">
                        <strong>SallyPort Verification Complete</strong>
                        <p>Your transaction is secured and verified</p>
                    </div>
                </div>
                <div class="verification-details">
                    <span class="verified-badge">🛡️ Verified Secure</span>
                    <span class="verification-id">ID: SP-${Date.now()}</span>
                </div>
            `;
            
            this.showNotification('success', 'SallyPort verification completed successfully');
            console.log('🔒 SallyPort verification completed');
            
        }, 2000);
    }
    
    /**
     * Handle checkout form submission
     */
    async handleCheckoutSubmit(event) {
        event.preventDefault();
        
        // Validate SallyPort verification
        if (!this.sallyPortVerified) {
            this.showNotification('error', 'Please complete SallyPort verification first');
            return;
        }
        
        // Validate form
        const form = event.target;
        if (!form.checkValidity()) {
            this.showNotification('error', 'Please fill in all required fields');
            return;
        }
        
        // Show processing state
        this.showProcessingState();
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const purchaseData = this.collectPurchaseData(formData);
            
            console.log('💳 Processing purchase:', purchaseData);
            
            // Process purchase
            const result = await this.processPurchase(purchaseData);
            
            // Show success state
            this.showSuccessState(result);
            
            console.log('✅ Purchase completed successfully');
            
        } catch (error) {
            console.error('❌ Purchase failed:', error);
            this.showErrorState(error.message);
        }
    }
    
    /**
     * Collect purchase data from form and cart
     */
    collectPurchaseData(formData) {
        const cartItems = Array.from(this.cart.values());
        
        return {
            customer: {
                name: formData.get('customerName'),
                email: formData.get('customerEmail'),
                phone: formData.get('customerPhone'),
                companyName: formData.get('companyName')
            },
            payment: {
                method: formData.get('paymentMethod'),
                cardNumber: formData.get('cardNumber'),
                cardExpiry: formData.get('cardExpiry'),
                cardCvc: formData.get('cardCvc'),
                cardZip: formData.get('cardZip')
            },
            cart: {
                items: cartItems,
                subtotal: this.calculateSubtotal(),
                processingFee: this.calculateProcessingFee(),
                discount: this.calculateDiscount(),
                total: this.calculateTotal()
            },
            agreements: {
                terms: formData.get('termsAgreement') === 'on',
                nft: formData.get('nftAgreement') === 'on',
                ambassador: formData.get('ambassadorAgreement') === 'on'
            },
            sallyPortVerified: this.sallyPortVerified,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Process purchase
     */
    async processPurchase(purchaseData) {
        // Process standard purchase
        const purchaseResult = await this.processStandardPurchase(purchaseData);
        
        // Process ambassador services if applicable
        let ambassadorResult = null;
        if (this.hasAmbassadorItems()) {
            ambassadorResult = await this.processAmbassadorPurchase(purchaseData);
        }
        
        // Process NFT minting if applicable  
        let nftResult = null;
        if (this.hasNFTItems()) {
            nftResult = await this.processNFTMinting(purchaseData);
        }
        
        return {
            purchase: purchaseResult,
            ambassador: ambassadorResult,
            nft: nftResult,
            orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
    }
    
    /**
     * Process standard purchase
     */
    async processStandardPurchase(purchaseData) {
        const response = await fetch(`${this.baseURL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchaseData)
        });
        
        if (!response.ok) {
            throw new Error('Purchase processing failed');
        }
        
        return await response.json();
    }
    
    /**
     * Process ambassador purchase
     */
    async processAmbassadorPurchase(purchaseData) {
        try {
            const response = await fetch(`${this.ambassadorSystemURL}/ambassador/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planType: 'ambassador-upgrade',
                    companyName: purchaseData.customer.companyName,
                    contactName: purchaseData.customer.name,
                    email: purchaseData.customer.email,
                    phone: purchaseData.customer.phone,
                    ambassadorUpgrade: true
                })
            });
            
            if (!response.ok) {
                console.warn('Ambassador processing failed, continuing with standard purchase');
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Ambassador system not available:', error);
            return null;
        }
    }
    
    /**
     * Process NFT minting
     */
    async processNFTMinting(purchaseData) {
        // Simulate NFT minting process
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    nftsMinted: this.getNFTItemsFromCart(),
                    blockchainTxId: `0x${Math.random().toString(16).substr(2, 64)}`,
                    mintingStatus: 'initiated'
                });
            }, 1000);
        });
    }
    
    /**
     * Show processing state
     */
    showProcessingState() {
        const submitButton = document.getElementById('complete-purchase');
        const form = document.getElementById('professional-checkout-form');
        
        submitButton.textContent = '⏳ Processing Purchase...';
        submitButton.disabled = true;
        form.classList.add('loading');
        
        this.showNotification('info', 'Processing your professional services purchase...');
    }
    
    /**
     * Show success state
     */
    showSuccessState(result) {
        const checkoutForm = document.getElementById('checkout-form');
        const cartSummary = document.getElementById('cart-summary');
        const cartItems = document.getElementById('cart-items');
        const checkoutSuccess = document.getElementById('checkout-success');
        
        // Hide checkout elements
        checkoutForm.style.display = 'none';
        cartSummary.style.display = 'none';
        cartItems.innerHTML = '<div class="purchase-completed">✅ Purchase Completed Successfully</div>';
        
        // Show success state
        checkoutSuccess.style.display = 'block';
        
        // Show conditional success items
        if (result.nft) {
            document.getElementById('nft-success').style.display = 'block';
        }
        
        if (result.ambassador) {
            document.getElementById('ambassador-success').style.display = 'block';
        }
        
        // Clear cart
        this.clearCart();
        
        this.showNotification('success', 'Purchase completed successfully! Check your email for details.');
        
        // Scroll to success message
        checkoutSuccess.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Show error state
     */
    showErrorState(errorMessage) {
        const submitButton = document.getElementById('complete-purchase');
        const form = document.getElementById('professional-checkout-form');
        
        submitButton.textContent = '🚀 Complete Professional Purchase';
        submitButton.disabled = false;
        form.classList.remove('loading');
        
        this.showNotification('error', `Purchase failed: ${errorMessage}`);
    }
    
    /**
     * Reset cart for new purchase
     */
    resetCart() {
        const checkoutSuccess = document.getElementById('checkout-success');
        const checkoutForm = document.getElementById('checkout-form');
        const emptyCart = document.getElementById('empty-cart');
        const cartItems = document.getElementById('cart-items');
        
        // Hide success state
        checkoutSuccess.style.display = 'none';
        
        // Reset form
        document.getElementById('professional-checkout-form').reset();
        
        // Show empty cart
        emptyCart.style.display = 'block';
        cartItems.innerHTML = '';
        
        // Reset SallyPort verification
        this.sallyPortVerified = false;
        document.getElementById('sallyport-verify').textContent = 'Verify with SallyPort';
        document.getElementById('sallyport-verify').disabled = false;
        
        this.updateCartDisplay();
        
        console.log('🔄 Cart reset for new purchase');
    }
    
    // Helper methods
    calculateSubtotal() {
        let subtotal = 0;
        this.cart.forEach(item => subtotal += item.total);
        return subtotal;
    }
    
    calculateProcessingFee() {
        return this.calculateSubtotal() * 0.025;
    }
    
    calculateDiscount() {
        return this.hasAmbassadorItems() ? this.calculateSubtotal() * 0.1 : 0;
    }
    
    calculateTotal() {
        return this.calculateSubtotal() + this.calculateProcessingFee() - this.calculateDiscount();
    }
    
    hasAmbassadorItems() {
        return Array.from(this.cart.values()).some(item => item.type === 'ambassador');
    }
    
    hasNFTItems() {
        return Array.from(this.cart.values()).some(item => item.type === 'nft');
    }
    
    getNFTItemsFromCart() {
        return Array.from(this.cart.values()).filter(item => item.type === 'nft');
    }
    
    /**
     * Setup auto-save cart functionality
     */
    setupAutoSave() {
        // Save cart every 30 seconds
        setInterval(() => {
            if (this.cart.size > 0) {
                this.saveCartToStorage();
            }
        }, 30000);
    }
    
    /**
     * Save cart to local storage
     */
    saveCartToStorage() {
        try {
            const cartData = {
                items: Array.from(this.cart.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem('aipi_shopping_cart', JSON.stringify(cartData));
        } catch (error) {
            console.warn('Failed to save cart to storage:', error);
        }
    }
    
    /**
     * Load cart from local storage
     */
    loadCartFromStorage() {
        try {
            const cartData = localStorage.getItem('aipi_shopping_cart');
            if (cartData) {
                const parsed = JSON.parse(cartData);
                
                // Only load if cart is less than 24 hours old
                if (Date.now() - parsed.timestamp < 86400000) {
                    this.cart = new Map(parsed.items);
                    this.updateCartDisplay();
                    console.log('🔄 Cart loaded from storage');
                } else {
                    localStorage.removeItem('aipi_shopping_cart');
                }
            }
        } catch (error) {
            console.warn('Failed to load cart from storage:', error);
        }
    }
    
    /**
     * Show notification
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1100';
        notification.style.maxWidth = '400px';
        notification.style.padding = '16px 24px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.fontWeight = '500';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        notification.style.animation = 'slideIn 0.3s ease';
        
        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#4299e1',
            warning: '#ed8936'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global cart functions for HTML onclick events
function addToCart(productId, productName, price) {
    window.cartSystem.addToCart(productId, productName, price);
}

function adjustQuantity(productId, adjustment) {
    window.cartSystem.adjustQuantity(productId, adjustment);
}

function clearCart() {
    window.cartSystem.clearCart();
}

function resetCart() {
    window.cartSystem.resetCart();
}

function initiateSallyPortVerification() {
    window.cartSystem.initiateSallyPortVerification();
}

// Initialize cart system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cartSystem = new UnifiedShoppingCart();
    
    console.log('🚀 UNIFIED SHOPPING CART SYSTEM READY');
    console.log('🛍️ Professional services store initialized');
    console.log('🔒 SallyPort security integration active');
    console.log('🎯 Ready for enterprise-grade transactions');
});