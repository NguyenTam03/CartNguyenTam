const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://cartnguyentam.onrender.com', 'http://localhost:3000']
}));
app.use(express.json());

// PostgreSQL / Neon connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: true
});

// Get all tabs
app.get('/api/tabs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tabs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add tab
app.post('/api/tabs', async (req, res) => {
  const { name, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.tabs (name, content) VALUES ($1, $2) RETURNING id',
      [name, content]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete tab
app.delete('/api/tabs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.tabs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tab' });
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update tab
app.put('/api/tabs/:id', async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;
  try {
    await pool.query(
      'UPDATE public.tabs SET name = $1, content = $2 WHERE id = $3',
      [name, content, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
