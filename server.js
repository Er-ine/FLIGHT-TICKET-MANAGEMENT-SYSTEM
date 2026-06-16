const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Import routes
const flightRoutes = require('./routes/flights');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const liveFlightRoutes = require('./routes/liveflights');
// Use routes
app.use('/api', flightRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);
app.use('/api', liveFlightRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});