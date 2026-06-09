require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'techstore-reports',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`TechStore Reports Service rodando na porta ${PORT}`);
});
