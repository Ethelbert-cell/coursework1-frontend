new Vue({
  el: "#app",
  data: {
    lessons: [], // Lessons will be fetched from the backend
    cart: [],
    showCart: false,
    sortAttribute: "subject",
    sortOrder: "asc",
    // Holds the user's search input
    searchQuery: "",
    name: "",
    phone: "",
    showCheckout: false,
    nameError: "",
    phoneError: "",
    orderConfirmed: false,
    confirmationMessage: "",
  },
  // New lifecycle hook to fetch lessons when the app is mounted
  mounted() {
    this.fetchLessons();
  },
  computed: {
    // A computed property that returns the lessons fetched from the backend.
    // The backend is responsible for all filtering and sorting.
    sortedLessons() {
      return this.lessons;
    },
  },
  watch: {
    // Explanation: This 'watch' block is the key to the "search as you type"
    // and dynamic sorting functionality. Vue.js monitors these data properties.
    // Whenever a user types in the search box or changes a sort option, the
    // corresponding property (searchQuery, sortAttribute, or sortOrder) changes.
    // The 'watch' detects this change and immediately calls the 'fetchLessons' method,
    // triggering a new API request to the backend with the updated parameters.
    // This makes the UI update in real-time based on user input.

    // Watcher for the search query
    searchQuery() {
      this.fetchLessons();
    },
    // Watcher for the sort attribute
    sortAttribute() {
      this.fetchLessons();
    },
    // Watcher for the sort order
    sortOrder() {
      this.fetchLessons();
    },
  },
  methods: {
    // Explanation: This method is responsible for all communication with the backend
    // to get the list of lessons. It's now simplified to always use the '/search'
    // endpoint. It constructs a query string with the current search term, sort
    // attribute, and sort order, and sends it to the server. Because the backend
    // can handle empty search queries, this single method works for all cases:
    // initial page load, searching, and sorting.
    async fetchLessons() {
      try {
        const params = new URLSearchParams({
          q: this.searchQuery,
          sortAttribute: this.sortAttribute,
          sortOrder: this.sortOrder,
        });

        const response = await fetch(
          `https://coursework1-backend-api.onrender.com/search?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.lessons = await response.json();
      } catch (error) {
        console.error("Error fetching lessons:", error);
        // It's better to not use alert() for errors in a real app,
        // but we'll leave it for now as the original code had it.
      }
    },
    addToCart(lessonToAdd) {
      // Check if the lesson is already in the cart
      const cartItem = this.cart.find((item) => item._id === lessonToAdd._id);
      const lessonInStore = this.lessons.find((l) => l._id === lessonToAdd._id);

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
      const index = this.cart.findIndex(
        (cartItem) => cartItem._id === item._id
      );
      if (index !== -1) {
        this.cart.splice(index, 1);
      }
      const lesson = this.lessons.find((l) => l._id === item._id);
      if (lesson) {
        lesson.spaces++;
      }
    },
    validateForm() {
      this.nameError = "";
      this.phoneError = "";
      let valid = true;
      if (!/^[a-zA-Z\s]+$/.test(this.name)) {
        this.nameError = "Name must contain only letters.";
        valid = false;
      }
      if (!/^\d+$/.test(this.phone)) {
        this.phoneError = "Phone must contain only numbers.";
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
            cart: this.cart.map((item) => ({
              _id: item._id,
              subject: item.subject,
            })), // Send minimal cart data
          };

          const response = await fetch(
            "https://coursework1-backend-api.onrender.com/orders",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }

          this.orderConfirmed = true;
          this.confirmationMessage = "Your order has been placed successfully!";
          this.cart = [];
          this.name = "";
          this.phone = "";
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
    },
    toggleCart() {
      if (this.cart.length > 0) {
        this.showCart = !this.showCart;
      }
    },
  },
});