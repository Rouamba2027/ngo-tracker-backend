const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NGO Tracker API',
      version: '2.0.0',
      description: 'API REST pour le suivi des ONG - Documentation complète',
      contact: {
        name: 'Support NGO Tracker',
        email: 'support@ngotracker.com',
        url: 'https://thunderous-torrone-7177f8.netlify.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Serveur de développement local'
      },
      {
        url: 'https://ngo-tracker-backend.onrender.com/api',
        description: 'Serveur de production (Render)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: "Entrez votre token JWT dans le format: 'Bearer <token>'"
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Une erreur est survenue'
            },
            error: {
              type: 'object',
              description: 'Détails de l\'erreur (optionnel)'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'VIEWER'],
              example: 'MANAGER'
            },
            organization: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Organization: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86'
            },
            name: {
              type: 'string',
              example: 'Médecins Sans Frontières'
            },
            orgCode: {
              type: 'string',
              example: 'MSF2024'
            },
            receiptNumber: {
              type: 'string',
              example: 'REC-2024-00123'
            },
            country: {
              type: 'string',
              example: 'FR'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c88'
            },
            orgId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86'
            },
            name: {
              type: 'string',
              example: 'Construction école primaire'
            },
            domain: {
              type: 'string',
              enum: ['health', 'education', 'water', 'other'],
              example: 'education'
            },
            status: {
              type: 'string',
              enum: ['active', 'pending', 'done', 'exceeded'],
              example: 'active'
            },
            budgetAllocated: {
              type: 'number',
              example: 50000.00
            },
            budgetSpent: {
              type: 'number',
              example: 12500.50
            },
            budgetPct: {
              type: 'integer',
              example: 25
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2024-12-31'
            },
            assignedManagers: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            createdBy: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c90'
            },
            projectId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c88'
            },
            orgId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86'
            },
            createdBy: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            },
            amount: {
              type: 'number',
              example: 150.75
            },
            category: {
              type: 'string',
              enum: ['material', 'transport', 'staff', 'other'],
              example: 'material'
            },
            description: {
              type: 'string',
              example: 'Achat de fournitures de bureau'
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-03-15'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c95'
            },
            orgId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86'
            },
            projectId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c88',
              nullable: true
            },
            title: {
              type: 'string',
              example: 'Rapport trimestriel Q1 2024'
            },
            type: {
              type: 'string',
              enum: ['quarterly', 'semester', 'annual'],
              example: 'quarterly'
            },
            generatedBy: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            },
            generatedAt: {
              type: 'string',
              format: 'date-time'
            },
            fileUrl: {
              type: 'string',
              example: '/reports/60d21b4667d0d8992e610c95.pdf',
              nullable: true
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: "Endpoints d'authentification"
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Projects',
        description: 'Gestion des projets'
      },
      {
        name: 'Expenses',
        description: 'Gestion des dépenses'
      },
      {
        name: 'Organization',
        description: "Gestion de l'organisation"
      },
      {
        name: 'Reports',
        description: 'Génération et gestion des rapports'
      },
      {
        name: 'Dashboard',
        description: 'Tableau de bord et statistiques'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;