require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cronJobs');
const { startGrpcServer } = require('./grpc/backupServer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket.io: real-time notifications
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 مستخدم ${userId} انضم للغرفة`);
  });
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/departments', require('./routes/departments'));

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

// SPA catch-all (Must be LAST)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'خطأ في الخادم' });
});

let started = false;

const startServer = async ({ port = process.env.PORT || 5000, enableGrpc = process.env.ENABLE_GRPC !== 'false' } = {}) => {
  if (started) return server;
  started = true;

  connectDB();

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      const actualPort = server.address().port;
      console.log(`\n🏥 منصة طبيبي تعمل على: http://localhost:${actualPort}`);
      console.log(`⚙️  البيئة: ${process.env.NODE_ENV}`);
      startCronJobs();
      if (enableGrpc) startGrpcServer();
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('فشل تشغيل الخادم:', err);
    process.exit(1);
  });
}

module.exports = { app, server, startServer };
