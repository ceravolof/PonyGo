const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs');
const mock = require('./DBMock.js'); // Mock database
const db = new mock(); // Replace with real DB logic in production
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

require('dotenv').config();

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Secure: true in production with HTTPS
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'frontend')));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the application',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
    ],
  },
  apis: [__filename], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swag', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
  if (req.session.loggedin) {
    return res.redirect('/home');
  }
  console.log(req.session.loggedin);
  res.sendFile(path.join(__dirname, '/frontend/login.html'));
});

//-----------------------------------------Login google-----------------------------------------
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("265932334016-5nnr1ncuhnq3phjjv1aposf975vnsf5t.apps.googleusercontent.com");

// Endpoint per ottenere il Client ID (usato dal frontend)
app.get('/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

app.post('/verifica-token', async (req, res) => {
  console.log("Ricevuta richiesta di verifica token");
  const { token } = req.body;
  console.log("Token ricevuto:", token ? "Presente" : "Assente");
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "265932334016-5nnr1ncuhnq3phjjv1aposf975vnsf5t.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    console.log("Utente autenticato:", payload);

    let user = db.getUserByEmail(payload.email);

    if (!user) {
      user = db.createUser({
        email: payload.email,
        username: payload.name || payload.email.split('@')[0],
        password: 'google-auth-' + Math.random().toString(36).substring(2),
        type: 'user' // Imposta un ruolo predefinito
      });
    }

    req.session.loggedin = true;
    req.session.name = user.username;
    req.session.role = user.type;

    res.json({ success: true, user: payload });
  } catch (error) {
    console.error("Errore verifica token:", error);
    res.status(401).json({ success: false, message: "Token non valido" });
  }
});

//-------------------------------------------------------------------------------------------------------------------------------

// Login page
app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    return res.redirect('/home');
  }
  console.log(req.session.loggedin);
  res.sendFile(path.join(__dirname, '/frontend/login.html'));
});


app.post('/register', (req, res) => {
  //if (!req.session.loggedin || req.session.role !== 'admin') {
  //  return res.status(403).send('Access denied');
  //}

  const { email, username, password, type } = req.body;
  if (!email || !username || !password || !type) {
    return res.render('error', { message: 'Tutti i campi sono obbligatori!' });
  }

  try {
    // Crea un nuovo utente con dbMock
    const user = db.createUser({ email, username, password, type });

    req.session.loggedin = true;
    req.session.name = user.username;   // o qualunque campo tu voglia utilizzare
    req.session.role = user.type;

    // Imposta il messaggio di successo nella sessione
    req.session.message = `Utente (ID: ${user.id}) creato con successo.`;

    // Reindirizza alla home
    res.redirect('/home');
  } catch (err) {
    // Gestisci l'errore (se l'utente non può essere creato)
    console.error(err);
    res.render('error', { message: err.message });
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('error', { message: 'Email and password are required!' });
  }

  const user = db.getUserByEmail(email);
  if (user && user.password === password) {
    req.session.loggedin = true;
    req.session.name = user.username;
    req.session.role = user.type;
    res.redirect('/home');
  } else {
    res.render('error', { message: 'Incorrect email or password!' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to logout.');
    }
    res.redirect('/');
  });
});

// Home page
app.get('/home', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/frontend/login.html');
  }
  if (req.session.role === 'admin') {
    res.render('admin/homea', {
      name: req.session.name,
      role: req.session.role,
      message: req.session.message || ''
    });
  } else if (req.session.role === 'pizzaiolo') {
    res.render('pizzaiolo/homep', {
      name: req.session.name,
      role: req.session.role,
      message: `Bentornato, ${req.session.name}!`
    });
  } else {
    res.render('home', {
      name: req.session.name,
      role: req.session.role,
      message: `Welcome back, ${req.session.name}!`
    });
  }
});

// API endpoint to get all users 
// Vista HBS per mostrare utenti
/*
app.get('/admin/users/view', (req, res) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    return res.redirect('/');
  }

  // Ottieni la lista degli utenti dal database
  const users = db.getAllUsers();

  // Renderizza la pagina users.hbs e passa i dati degli utenti
  res.render('admin/users', { users });
});
*/

// Endpoint  per admin/users(admin only)
app.get('/admin/users', (req, res) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    return res.redirect('/');
  }

  // Ottieni la lista degli utenti dal database
  const users = db.getAllUsers();
  console.log(users);

  // Controlla l'header Accept per determinare cosa vuole il client
  const acceptHeader = req.headers.accept || '';

  if (acceptHeader.includes('application/json')) {
    // Se richiede JSON, restituisci JSON
    return res.json(users);
  } else {
    // Altrimenti serve la pagina HTML
    return res.render('admin/users', { users });
  }
});

//---------------------------------- MIDDLEWARE PER CONTROLLARE I RUOLI ----------------------------------
function requirePizzaiolo(req, res, next) {
  if (!req.session.loggedin || req.session.role !== 'pizzaiolo') {
    return res.status(403).render('error', { message: 'Accesso riservato ai pizzaioli.' });
  }
  next();
}
function requireUser(req, res, next) {
  if (req.session && req.session.role === 'user') {
    return next();
  } else {
    return res.redirect('/login'); // o res.status(403).send('Forbidden');
  }
}

//--------------------------------------------------------------ENDPOINT GESTIONE ORDINI--------------------------------------------------------------
// 1. Aggiungi un ordine
app.post('/pizzaiolo/orders', requirePizzaiolo, (req, res) => {
  const { customer, pizza, quantity, notes, address } = req.body;
  if (!customer || !pizza || !quantity || !address) {
    return res.status(400).json({ message: 'Dati ordine mancanti' });
  }
  const order = db.createOrder({ customer, pizza, quantity, notes, address });
  res.status(201).json(order);
});

// 2. Visualizza tutti gli ordini
app.get('/pizzaiolo/orders', requirePizzaiolo, (req, res) => {
  const orders = db.getAllOrders();
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('application/json')) {
    return res.json(orders);
  }
  // Renderizza la pagina con gli ordini
  res.render('pizzaiolo/orders', { name: req.session.name, orders });
});

// 3. Cancella un ordine
app.delete('/pizzaiolo/orders/:id', requirePizzaiolo, (req, res) => {
  const { id } = req.params;
  const success = db.deleteOrder(parseInt(id));
  if (success) {
    res.json({ message: 'Ordine cancellato' });
  } else {
    res.status(404).json({ message: 'Ordine non trovato' });
  }
});

// 4. Modifica un ordine
app.put('/pizzaiolo/orders/:id', requirePizzaiolo, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const order = db.updateOrder(parseInt(id), updates);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Ordine non trovato' });
  }
});

// Pronto
app.get('/pizzaiolo/orders/pronto', requirePizzaiolo, (req, res) => {
  const orders = db.getAllOrders().filter(order => order.status === 'pronto');
  res.render('pizzaiolo/orders_pronto', { name: req.session.name, orders });
});

// In preparazione
app.get('/pizzaiolo/orders/inpreparazione', requirePizzaiolo, (req, res) => {
  const orders = db.getAllOrders().filter(order => order.status === 'in preparazione');
  res.render('pizzaiolo/orders_inpreparazione', { name: req.session.name, orders });
});

// Consegnato
app.get('/pizzaiolo/orders/consegnato', requirePizzaiolo, (req, res) => {
  const orders = db.getAllOrders().filter(order => order.status === 'consegnato');
  res.render('pizzaiolo/orders_consegnato', { name: req.session.name, orders });
});

app.get('/user/orders', requireUser, (req, res) => {
  // Se vuoi filtrare per utente:
  // const orders = db.getAllOrders().filter(order => order.userId === req.session.userId);
  // Se vuoi mostrare tutti:
  const orders = db.getAllOrders();
  res.render('ordersu', { name: req.session.name, orders });
});

hbs.registerHelper('eq', function (a, b) {
  return a == b;
});

app.patch('/user/orders/:id/consegnato', requireUser, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.getOrderById(id);
  if (!order) return res.status(404).json({ message: 'Ordine non trovato' });
  if (order.status !== 'pronto') return res.status(400).json({ message: 'Ordine non pronto' });
  // Se vuoi, controlla che sia assegnato a questo utente!
  order.status = 'consegnato';
  res.json({ message: 'Ordine marcato come consegnato' });
});

//--------------------------------------------------------------FINE ENDPOINT GESTIONE ORDINI--------------------------------------------------------------


// Start server
const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Incorrect email or password
 */