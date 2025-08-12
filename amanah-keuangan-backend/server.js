// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Daftarkan semua rute di sini
app.use('/api/hutang', require('./src/routes/hutangRoutes'));
app.use('/api/piutang', require('./src/routes/piutangRoutes'));
app.use('/api/itemkeluar', require('./src/routes/itemKeluarRoutes'));
app.use('/api/kasmasuk', require('./src/routes/kasMasukRoutes'));
app.use('/api/kaskeluar', require('./src/routes/kasKeluarRoutes'));

const PORT = process.env.PORT || 5019;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});