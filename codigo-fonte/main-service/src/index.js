require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'techstore-main',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`TechStore Main Service rodando na porta ${PORT}`);
});
