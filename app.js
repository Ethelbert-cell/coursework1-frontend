new Vue({
    el: '#app',
    data: {
        lessons: [
            { id: 1, subject: 'Mathematics', location: 'London', price: 100, spaces: 5, image: 'images/math.jpg' },
            { id: 2, subject: 'English', location: 'London', price: 90, spaces: 5, image: 'images/english.jpg' },
            { id: 3, subject: 'Science', location: 'Manchester', price: 110, spaces: 5, image: 'images/science.jpg' },
            { id: 4, subject: 'History', location: 'Bristol', price: 80, spaces: 5, image: 'images/history.jpg' },
            { id: 5, subject: 'Art', location: 'London', price: 120, spaces: 5, image: 'images/art.jpg' },
            { id: 6, subject: 'Music', location: 'Manchester', price: 95, spaces: 5, image: 'images/music.jpg' },
            { id: 7, subject: 'Geography', location: 'Bristol', price: 85, spaces: 5, image: 'images/geography.jpg' },
            { id: 8, subject: 'Physical Education', location: 'London', price: 75, spaces: 5, image: 'images/pe.jpg' },
            { id: 9, subject: 'Computer Science', location: 'Manchester', price: 130, spaces: 5, image: 'images/cs.jpg' },
            { id: 10, subject: 'Drama', location: 'Bristol', price: 105, spaces: 5, image: 'images/drama.jpg' }
        ],
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
    computed: {
         // A computed property that filters and sorts the lessons
        sortedLessons() {
            // Start with the full list of lessons
            let filtered = this.lessons;

            // If there's a search query, filter the lessons
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = this.lessons.filter(lesson => {
                    // Check if the query matches any of the lesson's attributes
                    return (
                        lesson.subject.toLowerCase().includes(query) ||
                        lesson.location.toLowerCase().includes(query) ||
                        lesson.price.toString().includes(query) ||
                        lesson.spaces.toString().includes(query)
                    );
                });
            }
             // Sort the filtered lessons
            return filtered.sort((a, b) => {
                let comparison = 0;
                if (a[this.sortAttribute] > b[this.sortAttribute]) {
                    comparison = 1;
                } else if (a[this.sortAttribute] < b[this.sortAttribute]) {
                    comparison = -1;
                }
                return this.sortOrder === 'asc' ? comparison : -comparison;
            });
        }
    },
    methods: {
        addToCart(lesson) {
            if (lesson.spaces > 0) {
                lesson.spaces--;
                this.cart.push(lesson);
            }
        },
        removeFromCart(item) {
            const index = this.cart.indexOf(item);
            this.cart.splice(index, 1);
            const lesson = this.lessons.find(l => l.id === item.id);
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
        submitOrder() {
            if (this.validateForm()) {
                this.orderConfirmed = true;
                this.confirmationMessage = 'Your order has been placed successfully!';
                this.cart = [];
                this.name = '';
                this.phone = '';
                this.showCheckout = false;
                this.showCart = false;
            }
        },
        backToLessons() {
            this.orderConfirmed = false;
        }
    }
});