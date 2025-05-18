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
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 6543,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
const pool = new Pool({
  connectionString: 'postgresql://postgres.ostonpgrsedztehrumun:123456789Tam.@aws-0-us-east-2.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});


// Lấy tất cả tabs
app.get('/api/tabs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tabs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Thêm tab
app.post('/api/tabs', async (req, res) => {
  const { name, content, catid } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.tabs (name, content, catid) VALUES ($1, $2, $3) RETURNING id',
[name, content, catid]
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
  const { name, content, catid } = req.body;


  console.log('PUT /api/tabs/:id', { id, name, content }); // ➤ Log để debug

  try {
    await pool.query(
      'UPDATE public.tabs SET name = $1, content = $2, catid = $3, "updateat" = now() WHERE id = $4',
[name, content, catid, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PUT error:', err); // ➤ Log lỗi chi tiết ra console
    res.status(500).json({ error: err.message });
  }
});


// Bắt đầu server
