new Vue({
    el: '#app',
    data: {
        lessons: [], 
        cart: [],
        showCart: false,
        sortAttribute: 'subject',
        sortOrder: 'asc',
        searchQuery: '',
        name: '',
        phone: '',
        showCheckout: false,
        nameError: '',
        phoneError: '',
        orderConfirmed: false,
        confirmationMessage: ''
    },
   
    mounted() {
        this.fetchLessons();
    },
    computed: {
        sortedLessons() {
            return this.lessons;
        }
    },
    watch: {
       
        searchQuery() {
            this.fetchLessons();
        },
        
        sortAttribute() {
            this.fetchLessons();
        },
       
        sortOrder() {
            this.fetchLessons();
        }
    },
    methods: {
        
        async fetchLessons() {
            try {
                const params = new URLSearchParams({
                    q: this.searchQuery,
                    sortAttribute: this.sortAttribute,
                    sortOrder: this.sortOrder
                });

                const response = await fetch(`https://coursework1-backend-api.onrender.com/search?${params.toString()}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.lessons = await response.json();
            } catch (error) {
                console.error("Error fetching lessons:", error);
                
            }
        },
        addToCart(lessonToAdd) {
           
            const cartItem = this.cart.find(item => item._id === lessonToAdd._id);
            const lessonInStore = this.lessons.find(l => l._id === lessonToAdd._id);

            if (lessonInStore && lessonInStore.spaces > 0) {
                if (cartItem) {
                    
                    this.cart.push(lessonToAdd);
                } else {
                    this.cart.push(lessonToAdd);
                }
                lessonInStore.spaces--; 
            }
        },
        removeFromCart(item) {
            const index = this.cart.findIndex(cartItem => cartItem._id === item._id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
            const lesson = this.lessons.find(l => l._id === item._id);
            if (lesson) {
                lesson.spaces++;
            }
        },
        validateForm() {
            this.nameError = '';
            this.phoneError = '';
            let valid = true;
            if (!/^[a-zA-Z\s]+$/.test(this.name)) {
                this.nameError = 'Name must contain only letters.';
                valid = false;
            }
            if (!/^\d+$/.test(this.phone)) {
                this.phoneError = 'Phone must contain only numbers.';
                valid = false;
            }
            return valid;
        },
        async submitOrder() {
            if (this.validateForm()) {
                try {
                    const orderData = {
                        name: this.name,
                        phone: this.phone,
                        cart: this.cart.map(item => ({ _id: item._id, subject: item.subject })) // Send minimal cart data
                    };

                    const response = await fetch('https://coursework1-backend-api.onrender.com/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }

                    this.orderConfirmed = true;
                    this.confirmationMessage = 'Your order has been placed successfully!';
                    this.cart = [];
                    this.name = '';
                    this.phone = '';
                    this.showCheckout = false;
                    this.showCart = false;
                    this.fetchLessons(); 
                } catch (error) {
                    console.error("Error submitting order:", error);
                    alert(`Failed to place order: ${error.message}`);
                }
            }
        },
        backToLessons() {
            this.orderConfirmed = false;
        }
    }
});