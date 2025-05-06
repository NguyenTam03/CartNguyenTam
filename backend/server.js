const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const port = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Lấy tất cả tabs
app.get('/api/tabs', (req, res) => {
  db.query('SELECT * FROM tabs', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Thêm tab
app.post('/api/tabs', (req, res) => {
  const { name, content } = req.body;
  db.query('INSERT INTO tabs (name, content) VALUES (?, ?)', [name, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId }); // Thêm dòng này
  });
});

// Delete tab
app.delete('/api/tabs/:id', (req, res) => {
    console.log(`Xóa`);
    const { id } = req.params;
    console.log(`Yêu cầu xóa tab ID = ${id}`);
    db.query('DELETE FROM tabs WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Lỗi SQL:', err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy tab' });
      }
      console.log('Đã xóa tab id:', id);
      res.sendStatus(200);
    });
  });
  
  

// Cập nhật tab
app.put('/api/tabs/:id', (req, res) => {
    const { name, content } = req.body;
    db.query('UPDATE tabs SET name = ?, content = ? WHERE id = ?', [name, content, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true }); // Thêm dòng này
    });
  });

app.listen(port, () => console.log(`Server running on port ${port}`));
