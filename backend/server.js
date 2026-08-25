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
const crypto = require('crypto');

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

// Auto-initialize tables if not exists
const initDatabase = async () => {
  try {
    // Ensure email_settings table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
        smtp_port INT DEFAULT 465,
        smtp_secure BOOLEAN DEFAULT TRUE,
        smtp_user VARCHAR(255) DEFAULT '',
        app_password VARCHAR(255) DEFAULT '',
        sender_name VARCHAR(255) DEFAULT 'LMS Bisnis',
        sender_email VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure at least 1 default row exists
    const [rows] = await db.query('SELECT id FROM email_settings WHERE id = 1');
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_secure, smtp_user, app_password, sender_name, sender_email)
        VALUES (1, 'smtp.gmail.com', 465, TRUE, 'sampurdi@gmail.com', 'igfm raoe ovlj qsjm', 'LMS Bisnis', 'sampurdi@gmail.com')
      `);
    } else {
      // Ensure existing row has configured credentials if it was empty
      await db.query(`
        UPDATE email_settings 
        SET smtp_user = IF(smtp_user = '' OR smtp_user IS NULL, 'sampurdi@gmail.com', smtp_user),
            app_password = IF(app_password = '' OR app_password IS NULL, 'igfm raoe ovlj qsjm', app_password),
            sender_email = IF(sender_email = '' OR sender_email IS NULL, 'sampurdi@gmail.com', sender_email)
        WHERE id = 1
      `);
    }

    // Ensure password_resets table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('Database auto-init notice:', err.message);
  }
};
initDatabase();

// Email Helper Functions (Hardcoded Default + DB / ENV Support)
const DEFAULT_EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: 'sampurdi@gmail.com',
  pass: 'igfm raoe ovlj qsjm',
  senderName: 'LMS Bisnis',
  senderEmail: 'sampurdi@gmail.com',
};

const getEmailConfig = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM email_settings WHERE id = 1');
    const dbConfig = rows[0] || {};

    const host = dbConfig.smtp_host || process.env.SMTP_HOST || DEFAULT_EMAIL_CONFIG.host;
    const port = Number(dbConfig.smtp_port) || Number(process.env.SMTP_PORT) || DEFAULT_EMAIL_CONFIG.port;
    const secure = dbConfig.smtp_secure !== undefined ? Boolean(dbConfig.smtp_secure) : DEFAULT_EMAIL_CONFIG.secure;
    const user = dbConfig.smtp_user || process.env.SMTP_USER || DEFAULT_EMAIL_CONFIG.user;
    const pass = dbConfig.app_password || process.env.SMTP_PASS || DEFAULT_EMAIL_CONFIG.pass;
    const senderName = dbConfig.sender_name || DEFAULT_EMAIL_CONFIG.senderName;
    const senderEmail = dbConfig.sender_email || user || DEFAULT_EMAIL_CONFIG.senderEmail;

    return {
      host,
      port,
      secure,
      auth: { user, pass },
      from: `"${senderName}" <${senderEmail}>`,
      isConfigured: Boolean(user && pass),
    };
  } catch (err) {
    return {
      host: DEFAULT_EMAIL_CONFIG.host,
      port: DEFAULT_EMAIL_CONFIG.port,
      secure: DEFAULT_EMAIL_CONFIG.secure,
      auth: { user: DEFAULT_EMAIL_CONFIG.user, pass: DEFAULT_EMAIL_CONFIG.pass },
      from: `"${DEFAULT_EMAIL_CONFIG.senderName}" <${DEFAULT_EMAIL_CONFIG.senderEmail}>`,
      isConfigured: true,
    };
  }
};


const sendResetPasswordEmail = async (toEmail, resetLink) => {
  const config = await getEmailConfig();

  if (!config.isConfigured) {
    console.log('\n======================================================');
    console.log('[DEVELOPMENT / SMTP NOT CONFIGURED]');
    console.log(`To: ${toEmail}`);
    console.log(`Reset Password Link: ${resetLink}`);
    console.log('Untuk mengirim email nyata, atur SMTP & App Password di Admin Settings atau file .env');
    console.log('======================================================\n');
    return { sent: false, devMode: true };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  const mailOptions = {
    from: config.from,
    to: toEmail,
    subject: 'Reset Kata Sandi - LMS Bisnis',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f1f5f9; }
          .container { max-width: 540px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 20px; text-align: center; }
          .content { padding: 32px 28px; }
          .btn { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 15px; margin: 20px 0; }
          .footer { background-color: #0f172a; padding: 18px 24px; text-align: center; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">LMS Bisnis</h1>
            <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px;">Permintaan Reset Kata Sandi</p>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Halo,</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Kami menerima permintaan untuk mereset kata sandi akun LMS Bisnis Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
            </p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="btn" target="_blank">Atur Ulang Kata Sandi</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 20px;">
              ⏱️ Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak melakukan permintaan ini, abaikan email ini dan akun Anda tetap aman.
            </p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
            <p style="color: #64748b; font-size: 12px; word-break: break-all;">
              Jika tombol di atas tidak dapat diklik, salin dan buka link berikut di browser:<br/>
              <a href="${resetLink}" style="color: #818cf8;">${resetLink}</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LMS Bisnis. Hak Cipta Dilindungi.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { sent: true };
};

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

const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'file_attachment') {
      cb(null, path.join(uploadDir, 'files'));
    } else {
      cb(null, path.join(uploadDir, 'thumbnails'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const materialFilter = (req, file, cb) => {
  if (file.fieldname === 'file_attachment') {
    const allowed = /pdf|docx|xlsx|pptx|doc|xls|ppt/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    return cb(new Error('Only PDF, DOCX, XLSX, PPTX files are allowed for attachments'));
  } else {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    return cb(new Error('Only JPG, PNG, WEBP images are allowed for thumbnails/covers'));
  }
};

const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: materialFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});



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
    return res.status(400).json({ success: false, message: 'Email/No. WhatsApp dan password wajib diisi' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE (email = ? OR whatsapp = ?) AND is_active = 1', [email, email]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Email/No. WhatsApp atau password salah' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email/No. WhatsApp atau password salah' });

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
    return res.status(400).json({ success: false, message: 'Email wajib diisi' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak terdaftar di sistem' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?',
      [email, token, expires, token, expires]
    );

    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://bimbingan-bisnis-ppsi.vercel.app/';
    const resetLink = `${frontendBaseUrl}/reset-password?token=${token}`;

    const mailResult = await sendResetPasswordEmail(email, resetLink);

    let message = 'Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk (atau folder spam).';
    if (mailResult.devMode) {
      message = 'Link reset password berhasil dibuat (Mode Development: Periksa terminal server untuk melihat link)';
    }

    res.json({
      success: true,
      message,
      data: {
        email,
        expiresIn: '1 hour',
        ...(mailResult.devMode ? { devResetLink: resetLink } : {}),
      },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Gagal memproses reset password: ' + err.message });
  }
});

authRouter.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token tidak valid' });
  }
  try {
    const [resets] = await db.query('SELECT email, expires_at FROM password_resets WHERE token = ? AND expires_at > NOW()', [token]);
    if (resets.length === 0) {
      return res.status(400).json({ success: false, message: 'Token reset password tidak valid atau sudah kadaluarsa' });
    }

    res.json({
      success: true,
      message: 'Token valid',
      data: { email: resets[0].email },
    });
  } catch (err) {
    console.error('Verify reset token error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token dan kata sandi baru wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter' });
  }
  try {
    const [resets] = await db.query('SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()', [token]);
    if (resets.length === 0) {
      return res.status(400).json({ success: false, message: 'Token reset password tidak valid atau sudah kadaluarsa' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resets[0].email]);
    await db.query('DELETE FROM password_resets WHERE token = ?', [token]);

    res.json({ success: true, message: 'Kata sandi berhasil diatur ulang. Silakan login kembali.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


const ensureUserProgress = async (userId) => {
  try {
    // Get all published materials
    const [materials] = await db.query('SELECT id, order_index FROM materials WHERE status = "publish" ORDER BY order_index ASC');
    if (materials.length === 0) return;

    // Get current progress for the user
    const [progress] = await db.query('SELECT material_id, status FROM user_progress WHERE user_id = ?', [userId]);
    const progressMap = new Map(progress.map(p => [p.material_id, p.status]));

    for (let i = 0; i < materials.length; i++) {
      const mat = materials[i];
      if (!progressMap.has(mat.id)) {
        let status = 'locked';
        if (i === 0) {
          status = 'available';
        } else {
          const prevMat = materials[i - 1];
          const prevStatus = progressMap.get(prevMat.id);
          if (prevStatus === 'completed') {
            status = 'available';
          }
        }
        await db.query(
          'INSERT INTO user_progress (user_id, material_id, status) VALUES (?, ?, ?)',
          [userId, mat.id, status]
        );
        progressMap.set(mat.id, status);
      }
    }
  } catch (err) {
    console.error('Error ensuring user progress:', err);
  }
};


// ============================================
// ROUTES: MATERIALS (/api/materials)
// ============================================
const materialsRouter = express.Router();

materialsRouter.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  const offset = (page - 1) * limit;

  try {
    if (req.user.role === 'member') {
      await ensureUserProgress(req.user.id);
    }
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
      await ensureUserProgress(req.user.id);
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

materialsRouter.post('/', authMiddleware, adminMiddleware, uploadMaterial.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 },
  { name: 'file_attachment', maxCount: 1 }
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
  const file_attachment = req.files?.file_attachment?.[0]?.filename || null;

  try {
    let orderIdx = order_index;
    if (!orderIdx) {
      const [maxOrder] = await db.query('SELECT MAX(order_index) as max FROM materials');
      orderIdx = (maxOrder[0].max || 0) + 1;
    }

    const [result] = await db.query(
      'INSERT INTO materials (title, description, content, thumbnail, cover_image, youtube_url, file_attachment, duration_minutes, order_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, content, thumbnail, cover_image, youtube_url, file_attachment, duration_minutes, orderIdx, status || 'draft']
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

materialsRouter.put('/:id', authMiddleware, adminMiddleware, uploadMaterial.fields([
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
    await ensureUserProgress(req.user.id);
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
        'INSERT INTO user_progress (user_id, material_id, status) VALUES (?, ?, "available") ON DUPLICATE KEY UPDATE status = CASE WHEN status = "locked" THEN "available" ELSE status END',
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
    await ensureUserProgress(req.user.id);
    const [summary] = await db.query(`
      SELECT
        COUNT(m.id) as total_materials,
        SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN COALESCE(up.status, 'locked') = 'locked' THEN 1 ELSE 0 END) as locked,
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
    await ensureUserProgress(req.user.id);
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
    await ensureUserProgress(req.params.id);
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
// SETTINGS ROUTER (Admin Only)
// ============================================
const settingsRouter = express.Router();

settingsRouter.get('/email', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_settings WHERE id = 1');
    const settings = rows[0] || {};
    res.json({
      success: true,
      data: {
        smtp_host: settings.smtp_host || process.env.SMTP_HOST || DEFAULT_EMAIL_CONFIG.host,
        smtp_port: Number(settings.smtp_port) || Number(process.env.SMTP_PORT) || DEFAULT_EMAIL_CONFIG.port,
        smtp_secure: settings.smtp_secure !== undefined ? Boolean(settings.smtp_secure) : DEFAULT_EMAIL_CONFIG.secure,
        smtp_user: settings.smtp_user || process.env.SMTP_USER || DEFAULT_EMAIL_CONFIG.user,
        app_password: settings.app_password || process.env.SMTP_PASS || DEFAULT_EMAIL_CONFIG.pass,
        sender_name: settings.sender_name || DEFAULT_EMAIL_CONFIG.senderName,
        sender_email: settings.sender_email || DEFAULT_EMAIL_CONFIG.senderEmail,
      },
    });

  } catch (err) {
    console.error('Get email settings error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

settingsRouter.put('/email', authMiddleware, adminMiddleware, async (req, res) => {
  const { smtp_host, smtp_port, smtp_secure, smtp_user, app_password, sender_name, sender_email } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM email_settings WHERE id = 1');
    if (rows.length === 0) {
      await db.query(
        'INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_secure, smtp_user, app_password, sender_name, sender_email) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
        [smtp_host || 'smtp.gmail.com', smtp_port || 465, smtp_secure !== undefined ? smtp_secure : true, smtp_user || '', app_password || '', sender_name || 'LMS Bisnis', sender_email || '']
      );
    } else {
      await db.query(
        'UPDATE email_settings SET smtp_host = ?, smtp_port = ?, smtp_secure = ?, smtp_user = ?, app_password = ?, sender_name = ?, sender_email = ? WHERE id = 1',
        [smtp_host || 'smtp.gmail.com', smtp_port || 465, smtp_secure !== undefined ? smtp_secure : true, smtp_user || '', app_password || '', sender_name || 'LMS Bisnis', sender_email || '']
      );
    }
    res.json({ success: true, message: 'Pengaturan email & App Password berhasil disimpan' });
  } catch (err) {
    console.error('Update email settings error:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan: ' + err.message });
  }
});

settingsRouter.post('/email/test', authMiddleware, adminMiddleware, async (req, res) => {
  const { test_email } = req.body;
  const targetEmail = test_email || req.user.email;
  if (!targetEmail) {
    return res.status(400).json({ success: false, message: 'Email tujuan pengujian wajib diisi' });
  }
  try {
    const config = await getEmailConfig();
    if (!config.auth.user || !config.auth.pass) {
      return res.status(400).json({
        success: false,
        message: 'SMTP User (Email) dan App Password belum diisi. Silakan lengkapi dan simpan terlebih dahulu.',
      });
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    await transporter.verify();

    await transporter.sendMail({
      from: config.from,
      to: targetEmail,
      subject: 'Test Email - LMS Bisnis SMTP Configuration',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #f8fafc;">
          <div style="max-width: 500px; margin: 0 auto; background: #1e293b; padding: 28px; border-radius: 12px; border: 1px solid #334155;">
            <h2 style="color: #818cf8; margin-top: 0;">Pengujian Email Berhasil! 🎉</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              Konfigurasi SMTP dan App Password Anda di LMS Bisnis telah terhubung dengan sempurna dan siap digunakan untuk fitur Reset Password.
            </p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
              Waktu pengujian: ${new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: `Email uji coba berhasil dikirim ke ${targetEmail}` });
  } catch (err) {
    console.error('SMTP test error:', err);
    res.status(400).json({ success: false, message: `Gagal mengirim email: ${err.message}` });
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
app.use('/api/settings', settingsRouter);

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
