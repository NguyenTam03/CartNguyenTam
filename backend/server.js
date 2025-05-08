const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const { Console } = require('console');

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Cấu hình CORS đúng (chắc chắn rằng nó luôn hoạt động)
const corsOptions = {
  origin: 'https://cartnguyentam.onrender.com', // URL của frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Chắc chắn rằng bạn cho phép gửi cookies (nếu cần)
  allowedHeaders: ['Content-Type', 'Authorization'] // Thêm headers cần thiết nếu có
};

app.use(cors(corsOptions));

app.use(express.json());

// Phục vụ static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route để mở index.html khi truy cập /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Thiết lập kết nối PostgreSQL (Neon)
const pool = new Pool({
  host: process.env.DB_HOST,         // ví dụ: 'ep-happy-1234.ap-southeast-1.aws.neon.tech'
  user: process.env.DB_USER,         // tên người dùng Neon
  password: process.env.DB_PASSWORD, // mật khẩu Neon
  database: process.env.DB_NAME,     // ví dụ: 'neondb'
  port: 5432,
  ssl: true                          // Bắt buộc phải có với Neon
});

// Lấy tất cả tabs
app.get('/api/tabs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tabs ORDER BY id');
    res.json(result.rows);
        Console.log(result)
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Thêm tab
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

// Xóa tab
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

// Cập nhật tab
app.put('/api/tabs/:id', async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;
  try {
    await pool.query(
      'UPDATE public.tabs SET name = $1, content = $2, updateAt = now() WHERE id = $3',
      [name, content, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bắt đầu server
