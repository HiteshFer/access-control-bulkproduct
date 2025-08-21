const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./utils/ApiError');
const swaggerSetup = require('./config/swagger');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json({limit: '50mb'}));
app.use(morgan('dev'));


// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// For form submissions
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup Swagger
swaggerSetup(app);

// Routes
app.use('/api', routes);

// Handle undefined routes
// app.all('*', (req, res, next) => {
//   next(ApiError(404, `Route ${req.originalUrl} not found`));
// });

// Global error handling middleware (MUST be last)
app.use(errorHandler);

module.exports = app;