// errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it's our custom ApiError
  if (err.name === 'ApiError') {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors
  else if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate entry - resource already exists';
  }
  else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }
  else if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    message = 'Database operation failed';
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle syntax errors in JSON
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Log error for debugging (in production, use proper logging library)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      code: err.code
    });
  } else {
    // In production, log less sensitive information
    console.error('Error:', err.message);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err 
      })
    }
  });
};

module.exports = errorHandler;