const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs');
const mock = require('./DBMock.js'); // Mock database
const db = new mock(); // Replace with real DB logic in production
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const http = require('http'); // Aggiungi questa riga

const app = express();
const server = http.createServer(app); // Crea un server HTTP
const io = require('socket.io')(server); // Inizializza Socket.IO

require('dotenv').config();

// Variabili globali per tracciare connessioni attive
const activeConnections = new Map(); // Map di socket ID => info utente

// Session setup
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

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
// Aggiungi questa route specifica per la directory img
app.use('/img', express.static(path.join(__dirname, 'img')));

// Socket.IO connection handler
io.on('connection', (socket) => {
  const session = socket.request.session;
  console.log('Nuova connessione WebSocket:', socket.id);

  // Verifica se l'utente è loggato
  if (session && session.loggedin) {
    // Aggiungi l'utente alla mappa di connessioni attive
    activeConnections.set(socket.id, {
      id: session.userId,
      username: session.name, 
      role: session.role,
      connectedAt: new Date(),
      socketId: socket.id
    });

    // Invia aggiornamento agli admin
    updateAdminsWithActiveUsers();
  }

  // Gestisci disconnessione
  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
    // Rimuovi dalla mappa
    activeConnections.delete(socket.id);
    // Invia aggiornamento agli admin
    updateAdminsWithActiveUsers();
  });

  // L'admin richiede esplicitamente la lista utenti
  socket.on('requestActiveUsers', () => {
    const session = socket.request.session;
    if (session && session.role === 'admin') {
      socket.emit('activeUsers', Array.from(activeConnections.values()));
    }
  });
});

// Funzione per inviare aggiornamenti a tutti gli admin
function updateAdminsWithActiveUsers() {
  const activeUsers = Array.from(activeConnections.values());
  
  // Invia l'aggiornamento a tutti gli admin connessi
  for (const [socketId, userInfo] of activeConnections.entries()) {
    if (userInfo.role === 'admin') {
      io.to(socketId).emit('activeUsers', activeUsers);
    }
  }
}

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
    req.session.userId = user.id; // Aggiungi questa linea
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
      message: req.session.message || '',
      socketEnabled: true // Flag per abilitare WebSocket nella vista
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

// Crea un nuovo utente
app.post('/admin/users', (req, res) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  
  const { email, username, password, type } = req.body;
  if (!email || !username || !password || !type) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }
  
  try {
    const user = db.createUser({ email, username, password, type });
    res.status(201).json(user);
  } catch (err) {
    console.error('Errore creazione utente:', err);
    res.status(400).json({ message: err.message });
  }
});

// Aggiorna un utente esistente
app.put('/admin/users/:id', (req, res) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  
  const id = parseInt(req.params.id);
  const { username, email, password, type } = req.body;
  
  try {
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (type) updates.type = type;
    
    const updatedUser = db.updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Rimuovi password dalla risposta per sicurezza
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Errore aggiornamento utente:', err);
    res.status(400).json({ message: err.message });
  }
});

// Elimina un utente
app.delete('/admin/users/:id', (req, res) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  
  const id = parseInt(req.params.id);
  
  // Impedisci all'utente di eliminare se stesso
  if (id === req.session.userId) {
    return res.status(400).json({ message: 'Non puoi eliminare il tuo account' });
  }
  
  const success = db.deleteUser(id);
  if (!success) {
    return res.status(404).json({ message: 'Utente non trovato' });
  }
  
  res.json({ message: 'Utente eliminato con successo' });
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

// Consegnato - Formatta gli ordini per mostrare il fattorino
app.get('/pizzaiolo/orders/consegnato', requirePizzaiolo, (req, res) => {
  const ordersRaw = db.getAllOrders().filter(order => order.status === 'consegnato');
  
  // Formatta gli ordini per aggiungere informazioni sul fattorino
  const orders = ordersRaw.map(order => {
    const formatted = {...order};
    
    // Aggiungi informazione su chi ha consegnato (se disponibile)
    if (order.deliveredBy) {
      formatted.deliveredByName = order.deliveredBy.name;
      formatted.deliveredById = order.deliveredBy.id;
      formatted.deliveredAtFormatted = order.deliveredAt ? 
        new Date(order.deliveredAt).toLocaleString('it-IT') : 'Data non disponibile';
    } else {
      formatted.deliveredByName = 'Non specificato';
      formatted.deliveredAtFormatted = 'Data non disponibile';
    }
    
    return formatted;
  });
  
  res.render('pizzaiolo/orders_consegnato', { name: req.session.name, orders });
});

app.get('/user/orders', requireUser, (req, res) => {
  // Se vuoi filtrare per utente:
  // const orders = db.getAllOrders().filter(order => order.userId === req.session.userId);
  // Se vuoi mostrare tutti:
  const allOrders = db.getAllOrders();
  // Filtra solo gli ordini NON consegnati (che hanno stato diverso da "consegnato")
  const orders = allOrders.filter(order => order.status !== "consegnato");
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
  
  // Salva chi ha consegnato l'ordine
  order.status = 'consegnato';
  order.deliveredBy = {
    id: req.session.userId,
    name: req.session.name
  };
  order.deliveredAt = new Date().toISOString();
  
  res.json({ message: 'Ordine marcato come consegnato' });
});

app.get('/user/delivered-orders', requireUser, (req, res) => {
  const allOrders = db.getAllOrders();
  
  // Filtra solo gli ordini consegnati da questo utente
  const deliveredOrders = allOrders.filter(order => 
    order.status === "consegnato" && 
    order.deliveredBy && 
    order.deliveredBy.id === req.session.userId
  );
  
  res.render('delivered', { 
    name: req.session.name, 
    orders: deliveredOrders,
    formattedOrders: deliveredOrders.map(order => ({
      ...order,
      deliveredDate: new Date(order.deliveredAt).toLocaleString('it-IT')
    }))
  });
});
//--------------------------------------------------------------FINE ENDPOINT GESTIONE ORDINI--------------------------------------------------------------


// Start server
const port = 3000;
//app
server.listen(port, () => console.log(`Server started on port ${port}`));


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