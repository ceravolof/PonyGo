class DBMock {
    constructor() {
        // In-memory "database"
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        this.users = [
            { id: 1, email: 'admin@example.com', username: 'admin1', password: '123456', type: 'admin' },
            { id: 2, email: 'user@example.com', username: 'user1', password: 'abcdef', type: 'user' },
            { id: 3, email: 'pizzaiolo@example.com', username: 'pizzaiolo1', password: 'pizzapass', type: 'pizzaiolo' },
        ];
        this.nextId = this.users.length ? this.users[this.users.length - 1].id + 1 : 1; // ID generator
        this.orders = [
            {id: 1, customer: "Luca Rossi",pizza: "Margherita", quantity: 2,notes: "Senza basilico",address: "Via Roma 10, Bergamo",createdAt: formatDate(new Date()),status: 'in preparazione'},
            {id: 2, customer: "Giulia Bianchi",pizza: "Diavola", quantity: 1, notes: "Extra piccante",address: "Corso Italia 22, Seriate",createdAt: formatDate(new Date()),status: 'in preparazione'},
            {id: 3, customer: "Marco Verdi",pizza: "Quattro Stagioni", quantity: 3, notes: "Una senza funghi",address: "Via Garibaldi 5, Seriate",createdAt: formatDate(new Date()),status: 'pronto'},

        ];
        this.nextOrderId = 1;
    }
//---------------------------inizio ordini---------------------------------
    getAllOrders() {
        return this.orders;
    }

    getOrderById(id) {
        return this.orders.find(order => order.id === id);
    }

 //funzione per formattare la data
 


    createOrder({ customer, pizza, quantity, notes, address }) {
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
        

        const newOrder = {
            id: this.nextOrderId++,
            customer,
            pizza,
            quantity,
            notes,
            address,
            createdAt: formatDate(new Date()),
            status: 'in preparazione'
        };
        this.orders.push(newOrder);
        return newOrder;
    }

    updateOrder(id, updates) {
        const order = this.orders.find(order => order.id === id);
        if (!order) return null;
        Object.assign(order, updates);
        return order;
    }

    deleteOrder(id) {
        const idx = this.orders.findIndex(order => order.id === id);
        if (idx === -1) return false;
        this.orders.splice(idx, 1);
        return true;
    }

    //---------------------------fine ordini---------------------------------

    // Get all users (excluding passwords)
    getAllUsers() {
        return this.users.map(({ password, ...user }) => user);
    }

    // Get a user by ID
    getUserById(id) {
        const user = this.users.find(user => user.id === id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    // Get a user by email
    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    // Create a new user
    createUser({ email, username, password, type }) {
        if (!email || !username || !password || !type) {
            throw new Error('All fields are required: email, username, password, type');
        }
        if (this.users.find(user => user.email === email)) {
            throw new Error('Email already exists');
        }
        const newUser = {
            id: this.nextId++,
            email,
            username,
            password,
            type,
        };
        this.users.push(newUser);
        return newUser;
    }

    // Update an existing user
    updateUser(id, updates) {
        const user = this.users.find(user => user.id === id);
        if (!user) {
            return null;
        }
        if (updates.email) {
            if (this.users.find(u => u.email === updates.email && u.id !== id)) {
                throw new Error('Email already exists');
            }
            user.email = updates.email;
        }
        if (updates.username) user.username = updates.username;
        if (updates.password) user.password = updates.password;
        if (updates.type) user.type = updates.type;
        return user;
    }

    // Delete a user
    deleteUser(id) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return false;
        }
        this.users.splice(userIndex, 1);
        return true;
    }
}
module.exports = DBMock;