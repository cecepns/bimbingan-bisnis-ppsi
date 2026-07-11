require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads-lms-bisnis-ppsi')));

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// ============================================
// FILE UPLOAD SYSTEM
// ============================================
const uploadDir = path.join(__dirname, 'uploads-lms-bisnis-ppsi');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const thumbnailDir = path.join(uploadDir, 'thumbnails');
const fileDir = path.join(uploadDir, 'files');
const avatarDir = path.join(uploadDir, 'avatars');
const editorDir = path.join(uploadDir, 'editor');

[thumbnailDir, fileDir, avatarDir, editorDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, subDir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only JPG, PNG, WEBP images are allowed'));
};

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|docx|xlsx|pptx|doc|xls|ppt/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error('Only PDF, DOCX, XLSX, PPTX files are allowed'));
};

const uploadThumbnail = multer({ storage: storage('thumbnails'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadFile = multer({ storage: storage('files'), fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: storage('avatars'), fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadEditorImage = multer({ storage: storage('editor'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });


// ============================================
// ROUTES: AUTHENTICATION (/api/auth)
// ============================================
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, whatsapp, password, confirmPassword } = req.body;

  if (!name || !email || !whatsapp || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, whatsapp, password) VALUES (?, ?, ?, ?)',
      [name, email, whatsapp, hashedPassword]
    );

    // Initialize progress for all published materials
    const [materials] = await db.query('SELECT id, order_index FROM materials WHERE status = "publish" ORDER BY order_index ASC');
    if (materials.length > 0) {
      for (let i = 0; i < materials.length; i++) {
        const status = i === 0 ? 'available' : 'locked';
        await db.query(
          'INSERT INTO user_progress (user_id, material_id, status) VALUES (?, ?, ?)',
          [result.insertId, materials[i].id, status]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, whatsapp: user.whatsapp }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRouter.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, whatsapp, role, created_at, last_login FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Email not found' });

    const salt = await bcrypt.genSalt(10);
    const rawToken = Math.random().toString() + Date.now().toString();
    const token = (await bcrypt.hash(rawToken, salt)).replace(/[^a-zA-Z0-9]/g, '');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?',
      [email, token, expires, token, expires]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log(`[DEVELOPMENT] Reset password link for ${email}: ${resetLink}`);

    /* Hide nodemailer for now
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Password - LMS Bisnis',
      html: `<p>Klik link berikut untuk reset password Anda:</p><a href="${resetLink}">${resetLink}</a><p>Link berlaku 1 jam.</p>`,
    });
    */

    res.json({ success: true, message: 'Reset password link has been generated (check server logs in development)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const [resets] = await db.query('SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()', [token]);
    if (resets.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resets[0].email]);
    await db.query('DELETE FROM password_resets WHERE token = ?', [token]);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============================================
// ROUTES: MATERIALS (/api/materials)
// ============================================
const materialsRouter = express.Router();

materialsRouter.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = '';
    const params = [];

    if (req.user.role === 'member') {
      whereClause = 'WHERE m.status = "publish"';
    } else {
      whereClause = 'WHERE 1=1';
      if (status) { whereClause += ' AND m.status = ?'; params.push(status); }
    }

    if (search) {
      whereClause += ` AND (m.title LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM materials m ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    let dataQuery = `SELECT m.* FROM materials m ${whereClause} ORDER BY m.order_index ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const [materials] = await db.query(dataQuery, params);

    // If member, attach user_progress status
    if (req.user.role === 'member') {
      const materialIds = materials.map(m => m.id);
      if (materialIds.length > 0) {
        const [progress] = await db.query(
          `SELECT material_id, status FROM user_progress WHERE user_id = ? AND material_id IN (?)`,
          [req.user.id, materialIds]
        );
        const progressMap = {};
        progress.forEach(p => { progressMap[p.material_id] = p.status; });
        materials.forEach(m => { m.progress_status = progressMap[m.id] || 'locked'; });
      }
    }

    res.json({
      success: true,
      data: materials,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    const material = rows[0];

    if (req.user.role === 'member') {
      if (material.status !== 'publish') return res.status(404).json({ success: false, message: 'Material not found' });

      const [prog] = await db.query(
        'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?',
        [req.user.id, material.id]
      );
      material.progress = prog[0] || null;

      if (prog.length > 0 && prog[0].status === 'available') {
        await db.query(
          'UPDATE user_progress SET status = "in_progress", start_time = NOW() WHERE user_id = ? AND material_id = ?',
          [req.user.id, material.id]
        );
        material.progress.status = 'in_progress';
      }

      await db.query('UPDATE materials SET view_count = view_count + 1 WHERE id = ?', [material.id]);
    }

    res.json({ success: true, data: material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.post('/', authMiddleware, adminMiddleware, uploadThumbnail.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 }
]), async (req, res) => {
  const { title, description, content, youtube_url, duration_minutes, order_index, status } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const duration = Number(duration_minutes);
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({ success: false, message: 'Duration must be a positive integer' });
  }
  const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
  const cover_image = req.files?.cover_image?.[0]?.filename || null;

  try {
    let orderIdx = order_index;
    if (!orderIdx) {
      const [maxOrder] = await db.query('SELECT MAX(order_index) as max FROM materials');
      orderIdx = (maxOrder[0].max || 0) + 1;
    }

    const [result] = await db.query(
      'INSERT INTO materials (title, description, content, thumbnail, cover_image, youtube_url, duration_minutes, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, content, thumbnail, cover_image, youtube_url, duration_minutes, orderIdx, status || 'draft']
    );

    if (status === 'publish') {
      const [members] = await db.query('SELECT id FROM users WHERE role = "member"');
      for (const member of members) {
        const [existingTotal] = await db.query(
          'SELECT COUNT(*) as cnt FROM user_progress WHERE user_id = ?',
          [member.id]
        );
        const newStatus = existingTotal[0].cnt === 0 ? 'available' : 'locked';
        await db.query(
          'INSERT INTO user_progress (user_id, material_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = status',
          [member.id, result.insertId, newStatus]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Material created', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.put('/:id', authMiddleware, adminMiddleware, uploadThumbnail.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 },
  { name: 'file_attachment', maxCount: 1 },
]), async (req, res) => {
  const { title, description, content, youtube_url, duration_minutes, order_index, status } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    const mat = existing[0];
    const thumbnail = req.files?.thumbnail?.[0]?.filename || mat.thumbnail;
    const cover_image = req.files?.cover_image?.[0]?.filename || mat.cover_image;
    const file_attachment = req.files?.file_attachment?.[0]?.filename || mat.file_attachment;

    await db.query(
      'UPDATE materials SET title = ?, description = ?, content = ?, thumbnail = ?, cover_image = ?, youtube_url = ?, file_attachment = ?, duration_minutes = ?, order_index = ?, status = ? WHERE id = ?',
      [title || mat.title, description || mat.description, content || mat.content, thumbnail, cover_image, youtube_url || mat.youtube_url, file_attachment, duration_minutes || mat.duration_minutes, order_index || mat.order_index, status || mat.status, req.params.id]
    );

    res.json({ success: true, message: 'Material updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    await db.query('DELETE FROM materials WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.put('/action/reorder', authMiddleware, adminMiddleware, async (req, res) => {
  const { orders } = req.body;
  try {
    for (const item of orders) {
      await db.query('UPDATE materials SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
    }
    res.json({ success: true, message: 'Materials reordered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

materialsRouter.post('/upload-image', authMiddleware, adminMiddleware, uploadEditorImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
  const url = `${process.env.BACKEND_URL}/uploads/editor/${req.file.filename}`;
  res.json({ success: true, url });
});

materialsRouter.post('/:id/duplicate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    const mat = rows[0];
    const [maxOrder] = await db.query('SELECT MAX(order_index) as max FROM materials');
    const orderIdx = (maxOrder[0].max || 0) + 1;

    const [result] = await db.query(
      'INSERT INTO materials (title, description, content, thumbnail, cover_image, youtube_url, duration_minutes, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`${mat.title} (Copy)`, mat.description, mat.content, mat.thumbnail, mat.cover_image, mat.youtube_url, mat.duration_minutes, orderIdx, 'draft']
    );

    res.status(201).json({ success: true, message: 'Material duplicated', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============================================
// ROUTES: PROGRESS (/api/progress)
// ============================================
const progressRouter = express.Router();

progressRouter.post('/complete/:materialId', authMiddleware, async (req, res) => {
  const { materialId } = req.params;
  const { time_spent, device, browser, ip_address } = req.body;

  try {
    const [material] = await db.query('SELECT * FROM materials WHERE id = ? AND status = "publish"', [materialId]);
    if (material.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    const minSeconds = material[0].duration_minutes * 60;
    if (time_spent < minSeconds) {
      return res.status(400).json({ success: false, message: `Minimum study time is ${material[0].duration_minutes} minutes` });
    }

    const [prog] = await db.query(
      'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?',
      [req.user.id, materialId]
    );

    if (prog.length === 0) return res.status(404).json({ success: false, message: 'Progress not found' });
    if (prog[0].status === 'locked') return res.status(403).json({ success: false, message: 'Material is still locked' });
    if (prog[0].status === 'completed') return res.json({ success: true, message: 'Material already completed' });

    await db.query(
      'UPDATE user_progress SET status = "completed", end_time = NOW(), time_spent = ?, device = ?, browser = ?, ip_address = ? WHERE user_id = ? AND material_id = ?',
      [time_spent, device, browser, ip_address, req.user.id, materialId]
    );

    const [nextMaterial] = await db.query(
      'SELECT * FROM materials WHERE order_index > ? AND status = "publish" ORDER BY order_index ASC LIMIT 1',
      [material[0].order_index]
    );

    let nextUnlocked = null;
    if (nextMaterial.length > 0) {
      await db.query(
        'UPDATE user_progress SET status = "available" WHERE user_id = ? AND material_id = ? AND status = "locked"',
        [req.user.id, nextMaterial[0].id]
      );
      nextUnlocked = { id: nextMaterial[0].id, title: nextMaterial[0].title };
    }

    res.json({
      success: true,
      message: 'Material marked as completed',
      data: { nextUnlocked }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

progressRouter.get('/my', authMiddleware, async (req, res) => {
  try {
    const [summary] = await db.query(`
      SELECT
        COUNT(m.id) as total_materials,
        SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN up.status = 'locked' THEN 1 ELSE 0 END) as locked,
        SUM(CASE WHEN up.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN up.status = 'available' THEN 1 ELSE 0 END) as available
      FROM materials m
      LEFT JOIN user_progress up ON up.material_id = m.id AND up.user_id = ?
      WHERE m.status = "publish"
    `, [req.user.id]);

    const [progress] = await db.query(`
      SELECT m.id, m.title, m.thumbnail, m.duration_minutes, m.order_index,
             up.status, up.time_spent, up.start_time, up.end_time
      FROM materials m
      LEFT JOIN user_progress up ON up.material_id = m.id AND up.user_id = ?
      WHERE m.status = "publish"
      ORDER BY m.order_index ASC
    `, [req.user.id]);

    const continueMaterial = progress.find(p => p.status === 'in_progress') ||
      progress.find(p => p.status === 'available');

    res.json({
      success: true,
      data: {
        summary: summary[0],
        progress,
        continueMaterial,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

progressRouter.post('/start/:materialId', authMiddleware, async (req, res) => {
  const { materialId } = req.params;
  try {
    const [prog] = await db.query(
      'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?',
      [req.user.id, materialId]
    );

    if (prog.length === 0) return res.status(404).json({ success: false, message: 'Progress not found' });
    if (prog[0].status === 'locked') return res.status(403).json({ success: false, message: 'Material is still locked' });

    if (prog[0].status === 'available') {
      await db.query(
        'UPDATE user_progress SET status = "in_progress", start_time = NOW() WHERE user_id = ? AND material_id = ?',
        [req.user.id, materialId]
      );
    }

    res.json({ success: true, message: 'Study session started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============================================
// ROUTES: MEMBERS/USERS (/api/users)
// ============================================
const usersRouter = express.Router();

usersRouter.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { page = 1, limit = 10, search = '', is_active } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE role = "member"';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ? OR whatsapp LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      where += ' AND is_active = ?';
      params.push(is_active);
    }

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = countResult[0].total;

    const [users] = await db.query(
      `SELECT id, name, email, whatsapp, is_active, created_at, last_login FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    for (const user of users) {
      const [progress] = await db.query(`
        SELECT
          COUNT(m.id) as total,
          SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM materials m
        LEFT JOIN user_progress up ON up.material_id = m.id AND up.user_id = ?
        WHERE m.status = "publish"
      `, [user.id]);
      user.progress = progress[0];
    }

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, whatsapp, is_active, created_at, last_login FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = users[0];

    const [progress] = await db.query(`
      SELECT m.id, m.title, m.order_index, m.duration_minutes, up.status, up.time_spent, up.start_time, up.end_time
      FROM materials m
      LEFT JOIN user_progress up ON up.material_id = m.id AND up.user_id = ?
      WHERE m.status = "publish"
      ORDER BY m.order_index ASC
    `, [user.id]);

    user.progress = progress;
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.put('/:id/toggle-active', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ? AND role = "member"', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.put('/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }
  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, whatsapp, password } = req.body;
  if (!name || !email || !whatsapp || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, whatsapp, password, role, is_active) VALUES (?, ?, ?, ?, "member", 1)',
      [name, email, whatsapp, hashedPassword]
    );

    // Initialize progress for all published materials
    const [materials] = await db.query('SELECT id, order_index FROM materials WHERE status = "publish" ORDER BY order_index ASC');
    if (materials.length > 0) {
      for (let i = 0; i < materials.length; i++) {
        const status = i === 0 ? 'available' : 'locked';
        await db.query(
          'INSERT INTO user_progress (user_id, material_id, status) VALUES (?, ?, ?)',
          [result.insertId, materials[i].id, status]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Member berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, whatsapp } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    // Check email uniqueness if changed
    if (email !== existing[0].email) {
      const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
      if (emailCheck.length > 0) return res.status(409).json({ success: false, message: 'Email sudah digunakan pengguna lain' });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ?, whatsapp = ? WHERE id = ?',
      [name || existing[0].name, email || existing[0].email, whatsapp || existing[0].whatsapp, req.params.id]
    );

    res.json({ success: true, message: 'Member berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Member berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.put('/profile/update', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  const { name, whatsapp } = req.body;
  try {
    const avatar = req.file?.filename;
    let queryStr = 'UPDATE users SET name = ?, whatsapp = ?';
    const params = [name, whatsapp];
    if (avatar) { queryStr += ', avatar = ?'; params.push(avatar); }
    queryStr += ' WHERE id = ?';
    params.push(req.user.id);
    await db.query(queryStr, params);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.put('/profile/change-password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, users[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============================================
// ROUTES: STATISTICS (/api/stats)
// ============================================
const statsRouter = express.Router();

statsRouter.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [[totalMembers]] = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "member"');
    const [[activeMembers]] = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "member" AND is_active = 1');
    const [[totalMaterials]] = await db.query('SELECT COUNT(*) as total FROM materials');
    const [[publishedMaterials]] = await db.query('SELECT COUNT(*) as total FROM materials WHERE status = "publish"');
    const [[draftMaterials]] = await db.query('SELECT COUNT(*) as total FROM materials WHERE status = "draft"');
    const [[totalCompleted]] = await db.query('SELECT COUNT(*) as total FROM user_progress WHERE status = "completed"');
    const [[totalInProgress]] = await db.query('SELECT COUNT(*) as total FROM user_progress WHERE status = "in_progress"');

    const [topMaterials] = await db.query(`
      SELECT m.id, m.title, m.order_index,
        COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completions,
        COUNT(CASE WHEN up.status != 'locked' THEN 1 END) as starts,
        m.view_count
      FROM materials m
      LEFT JOIN user_progress up ON up.material_id = m.id
      WHERE m.status = "publish"
      GROUP BY m.id
      ORDER BY completions DESC
      LIMIT 5
    `);

    const [memberProgress] = await db.query(`
      SELECT u.id, u.name, u.email,
        COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed,
        COUNT(m.id) as total
      FROM users u
      LEFT JOIN user_progress up ON up.user_id = u.id
      LEFT JOIN materials m ON m.id = up.material_id AND m.status = "publish"
      WHERE u.role = "member"
      GROUP BY u.id
      ORDER BY completed DESC
      LIMIT 10
    `);

    const [monthlyRegs] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM users WHERE role = "member"
      AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: {
        totalMembers: totalMembers.total,
        activeMembers: activeMembers.total,
        totalMaterials: totalMaterials.total,
        publishedMaterials: publishedMaterials.total,
        draftMaterials: draftMaterials.total,
        totalCompleted: totalCompleted.total,
        totalInProgress: totalInProgress.total,
        topMaterials,
        memberProgress,
        monthlyRegs,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============================================
// ROUTE MOUNTING & ERROR HANDLERS
// ============================================
app.use('/api/auth', authRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'LMS Bisnis API is running', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
