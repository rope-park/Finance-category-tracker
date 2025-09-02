import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Category Tracker API',
      version: '1.0.0',
      description: '개인 재정 관리 및 카테고리 추적 API 문서입니다.',
      contact: {
        name: 'API Support',
        email: 'support@finance-tracker.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:8000',
        description: '개발 서버'
      },
      {
        url: 'https://api.finance-tracker.com',
        description: '프로덕션 서버'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 사용한 인증'
        }
      },
      schemas: {
        // 사용자 스키마
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: '사용자 고유 ID',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: '사용자 이메일',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: '사용자 비밀번호 (최소 8자)',
              example: 'password123'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '계정 생성일',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '계정 수정일',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        
        // 거래 스키마
        Transaction: {
          type: 'object',
          required: ['category_key', 'amount', 'description', 'date'],
          properties: {
            id: {
              type: 'integer',
              description: '거래 고유 ID',
              example: 1
            },
            category_key: {
              type: 'string',
              description: '카테고리 키',
              example: 'food_dining'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              description: '거래 금액',
              example: 15000
            },
            description: {
              type: 'string',
              description: '거래 설명',
              example: '점심 식사'
            },
            date: {
              type: 'string',
              format: 'date',
              description: '거래 일자',
              example: '2024-01-15'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: '거래 유형',
              example: 'expense'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '거래 태그',
              example: ['식사', '외식']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '거래 생성일',
              example: '2024-01-15T12:00:00Z'
            }
          }
        },
        
        // 예산 스키마
        Budget: {
          type: 'object',
          required: ['category_key', 'amount', 'period_start', 'period_end'],
          properties: {
            id: {
              type: 'integer',
              description: '예산 고유 ID',
              example: 1
            },
            category_key: {
              type: 'string',
              description: '카테고리 키',
              example: 'food_dining'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              description: '예산 금액',
              example: 300000
            },
            period_start: {
              type: 'string',
              format: 'date',
              description: '예산 시작일',
              example: '2024-01-01'
            },
            period_end: {
              type: 'string',
              format: 'date',
              description: '예산 종료일',
              example: '2024-01-31'
            },
            spent_amount: {
              type: 'number',
              format: 'decimal',
              description: '사용된 금액',
              example: 150000,
              readOnly: true
            },
            remaining_amount: {
              type: 'number',
              format: 'decimal',
              description: '남은 금액',
              example: 150000,
              readOnly: true
            },
            usage_percentage: {
              type: 'number',
              format: 'decimal',
              description: '사용률 (%)',
              example: 50.0,
              readOnly: true
            }
          }
        },
        
        // 통계 스키마
        Statistics: {
          type: 'object',
          properties: {
            totalIncome: {
              type: 'number',
              format: 'decimal',
              description: '총 수입',
              example: 5000000
            },
            totalExpense: {
              type: 'number',
              format: 'decimal',
              description: '총 지출',
              example: 3500000
            },
            netAmount: {
              type: 'number',
              format: 'decimal',
              description: '순 금액 (수입 - 지출)',
              example: 1500000
            },
            categoryBreakdown: {
              type: 'object',
              description: '카테고리별 지출 내역',
              additionalProperties: {
                type: 'number',
                format: 'decimal'
              },
              example: {
                'food_dining': 500000,
                'transportation': 200000,
                'shopping': 300000
              }
            },
            monthlyTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: {
                    type: 'string',
                    example: '2024-01'
                  },
                  income: {
                    type: 'number',
                    format: 'decimal',
                    example: 2500000
                  },
                  expense: {
                    type: 'number',
                    format: 'decimal',
                    example: 1750000
                  }
                }
              },
              description: '월별 수입/지출 추이'
            }
          }
        },
        
        // 에러 응답 스키마
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: '에러 메시지',
              example: '요청 처리 중 오류가 발생했습니다.'
            },
            errorCode: {
              type: 'string',
              description: '에러 코드',
              example: 'VALIDATION_ERROR'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: '유효한 이메일 주소를 입력해주세요.'
                  }
                }
              },
              description: '상세 에러 정보'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '에러 발생 시간',
              example: '2024-01-15T12:00:00Z'
            }
          }
        },
        
        // 성공 응답 스키마
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: '성공 메시지',
              example: '요청이 성공적으로 처리되었습니다.'
            },
            data: {
              type: 'object',
              description: '응답 데이터'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '응답 시간',
              example: '2024-01-15T12:00:00Z'
            }
          }
        },
        
        // 페이지네이션 응답 스키마
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {},
              description: '데이터 목록'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: '현재 페이지',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  description: '페이지당 항목 수',
                  example: 10
                },
                total: {
                  type: 'integer',
                  description: '전체 항목 수',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  description: '전체 페이지 수',
                  example: 10
                },
                hasNext: {
                  type: 'boolean',
                  description: '다음 페이지 존재 여부',
                  example: true
                },
                hasPrev: {
                  type: 'boolean',
                  description: '이전 페이지 존재 여부',
                  example: false
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: '인증 실패',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '인증이 필요합니다.',
                errorCode: 'AUTHENTICATION_ERROR',
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: '권한 없음',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '권한이 없습니다.',
                errorCode: 'AUTHORIZATION_ERROR',
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        },
        NotFoundError: {
          description: '리소스를 찾을 수 없음',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '요청한 리소스를 찾을 수 없습니다.',
                errorCode: 'NOT_FOUND_ERROR',
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        },
        ValidationError: {
          description: '입력값 검증 실패',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '입력값이 올바르지 않습니다.',
                errorCode: 'VALIDATION_ERROR',
                details: [
                  {
                    field: 'email',
                    message: '유효한 이메일 주소를 입력해주세요.'
                  }
                ],
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        },
        RateLimitError: {
          description: '요청 한도 초과',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                errorCode: 'RATE_LIMIT_EXCEEDED',
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        },
        InternalServerError: {
          description: '서버 내부 오류',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '서버 내부 오류가 발생했습니다.',
                errorCode: 'INTERNAL_SERVER_ERROR',
                timestamp: '2024-01-15T12:00:00Z'
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: '페이지 번호 (1부터 시작)',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: '페이지당 항목 수',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: '정렬 기준 (필드명:asc|desc)',
          required: false,
          schema: {
            type: 'string',
            example: 'date:desc'
          }
        },
        DateFromParam: {
          name: 'dateFrom',
          in: 'query',
          description: '시작 날짜 (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-01-01'
          }
        },
        DateToParam: {
          name: 'dateTo',
          in: 'query',
          description: '종료 날짜 (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-01-31'
          }
        },
        CategoryParam: {
          name: 'category',
          in: 'query',
          description: '카테고리 키',
          required: false,
          schema: {
            type: 'string',
            example: 'food_dining'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: '인증 관련 API'
      },
      {
        name: 'Users',
        description: '사용자 관리 API'
      },
      {
        name: 'Transactions',
        description: '거래 관리 API'
      },
      {
        name: 'Budgets',
        description: '예산 관리 API'
      },
      {
        name: 'Statistics',
        description: '통계 및 분석 API'
      },
      {
        name: 'Categories',
        description: '카테고리 관리 API'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

// Swagger 문서 생성
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 커스텀 CSS
const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info h1 { color: #2c3e50; }
  .swagger-ui .info h2 { color: #34495e; }
  .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
`;

// Swagger UI 옵션
const swaggerUiOptions = {
  customCss,
  customSiteTitle: 'Finance Tracker API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

// API 문서화 설정 함수
export const setupSwagger = (app: Express): void => {
  // Swagger JSON 엔드포인트
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI 설정
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  console.log('📚 API Documentation available at /api-docs');
};

// 개발 환경에서만 문서 활성화
export const conditionalSwagger = (app: Express): void => {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
    setupSwagger(app);
  }
};

export { swaggerSpec };
