const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'API for user authentication with JWT',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    //   {
    //     url: 'https://api.example.com',
    //     description: 'Production server',
    //   }
    ],
    components: {
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
              description: 'User password (minimum 6 characters)'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Operation success status'
            },
            message: {
              type: 'string',
              example: 'Login successful',
              description: 'Response message'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT access token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'User email'
            },
            name: {
              type: 'string',
              example: 'John Doe',
              description: 'User full name'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Operation success status'
            },
            message: {
              type: 'string',
              example: 'Invalid credentials',
              description: 'Error message'
            },
            error: {
              type: 'string',
              example: 'INVALID_CREDENTIALS',
              description: 'Error code'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      }
    ]
  },
  apis: ['../routes/*.js'],
};

function setupSwagger(app) {
  const specs = swaggerJsdoc(swaggerOptions);
  
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'Authentication API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    }
  }));

  // JSON endpoint for the spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

module.exports = setupSwagger;