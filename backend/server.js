const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'PCS Playbook API is running.'
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/installations', require('./routes/installationRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/mentor-requests', require('./routes/mentorRequestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/upload', require('./routes/uploadRoutes'));
app.use('/api/city-info', require('./routes/cityInfoRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});