new Vue({
    el: '#app',
    data: {
        lessons: [], // Lessons will be fetched from the backend
        cart: [],
        showCart: false,
        sortAttribute: 'subject',
        sortOrder: 'asc',
        // Holds the user's search input
        searchQuery: '',
        name: '',
        phone: '',
        showCheckout: false,
        nameError: '',
        phoneError: '',
        orderConfirmed: false,
        confirmationMessage: ''
    },
    // New lifecycle hook to fetch lessons when the app is mounted
    mounted() {
        this.fetchLessons();
    },
    computed: {
         // A computed property that filters and sorts the lessons
        sortedLessons() {
            // The lessons array is already filtered and sorted by the backend
            return this.lessons;
        }
    },
    methods: {
        // Fetch lessons from the backend, with optional search and sort parameters
        async fetchLessons() {
            try {
                let url = 'http://localhost:3000/lessons'; // Base URL for your Express app
                const params = new URLSearchParams();

                if (this.searchQuery) {
                    url = 'http://localhost:3000/search';
                    params.append('q', this.searchQuery);
                }
                
                params.append('sortAttribute', this.sortAttribute);
                params.append('sortOrder', this.sortOrder);

                const response = await fetch(`${url}?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.lessons = await response.json();
            } catch (error) {
                console.error("Error fetching lessons:", error);
                alert("Failed to load lessons. Please try again later.");
            }
        },
        // Method to handle sorting changes and re-fetch lessons
        sortLessons() {
            this.fetchLessons();
        },
        // Method to handle search input changes and re-fetch lessons
        searchLessons() {
            this.fetchLessons();
        },
        addToCart(lessonToAdd) {
            // Check if the lesson is already in the cart
            const cartItem = this.cart.find(item => item._id === lessonToAdd._id);
            const lessonInStore = this.lessons.find(l => l._id === lessonToAdd._id);

            if (lessonInStore && lessonInStore.spaces > 0) {
                if (cartItem) {
                    // If already in cart, increment quantity (if you track quantity)
                    // For now, assuming one item per cart entry, so we just add another entry
                    this.cart.push(lessonToAdd);
                } else {
                    this.cart.push(lessonToAdd);
                }
                lessonInStore.spaces--; // Optimistically update UI
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

                    const response = await fetch('http://localhost:3000/orders', {
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
                    this.fetchLessons(); // Re-fetch lessons to update available spaces in UI
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