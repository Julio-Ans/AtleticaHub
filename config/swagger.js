module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API AtléticaHub",
    version: "1.0.0",
    description: "API para gerenciamento de esportes, inscrições, mensagens, produtos e pedidos do AtléticaHub"
  },
  servers: [
    { url: "http://localhost:3000", description: "Servidor local" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          descricao: { type: "string" },
          preco: { type: "number", format: "float" },
          estoque: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["nome","preco","estoque"]
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          studentEmail: { type: "string" },
          produtoId: { type: "integer" },
          quantidade: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["studentEmail","produtoId","quantidade"]
      },
      Pedido: {
        type: "object",
        properties: {
          id: { type: "integer" },
          studentEmail: { type: "string" },
          produtos: {
            type: "array",
            items: {
              type: "object",
              properties: {
                produtoId: { type: "integer" },
                quantidade: { type: "integer" }
              }
            }
          },
          total: { type: "number", format: "float" },
          status: { type: "string", enum: ["pendente", "pago", "enviado", "cancelado"] },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string" },
          dataNascimento: { type: "string", format: "date-time" },
          telefone: { type: "string" },
          curso: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["nome", "dataNascimento", "telefone", "curso"]
      },
      Esporte: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string" },
          criadoEm: { type: "string", format: "date-time" }
        },
        required: ["nome"]
      },
      Inscricao: {
        type: "object",
        properties: {
          id: { type: "string" },
          usuarioId: { type: "string" },
          esporteId: { type: "string" },
          status: { type: "string", enum: ["pendente", "aceito", "recusado"] },
          criadaEm: { type: "string", format: "date-time" }
        },
        required: ["usuarioId", "esporteId"]
      },
      Mensagem: {
        type: "object",
        properties: {
          id: { type: "string" },
          conteudo: { type: "string" },
          usuarioId: { type: "string" },
          usuarioNome: { type: "string" },
          esporteId: { type: "string" },
          fixada: { type: "boolean" },
          criadaEm: { type: "string", format: "date-time" },
          editadaEm: { type: "string", format: "date-time" }
        },
        required: ["conteudo", "usuarioId", "usuarioNome", "esporteId"]
      },
      Login: {
        type: "object",
        properties: {
          idToken: { type: "string" }
        },
        required: ["idToken"]
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" }
        }
      }
    }
  },
  paths: {
    // Autenticação
    "/auth/login": {
      post: {
        summary: "Autenticação com token Firebase",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" }
            }
          }
        },
        responses: {
          "200": {
            description: "Login bem sucedido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/Usuario" },
                    token: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { 
            description: "Token inválido ou não fornecido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/verify-user": {
      get: {
        summary: "Verifica acesso de usuário comum",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access: { type: "string", example: "granted" }
                  }
                }
              }
            }
          },
          "403": { 
            description: "Acesso negado", 
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/verify-admin": {
      get: {
        summary: "Verifica acesso de administrador",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access: { type: "string", example: "granted" }
                  }
                }
              }
            }
          },
          "403": { 
            description: "Acesso negado", 
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    
    // Esportes
    "/api/esportes": {
      get: {
        summary: "Listar todos os esportes",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de esportes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Esporte" }
                }
              }
            }
          },
          "401": { description: "Não autorizado" }
        }
      },
      post: {
        summary: "Criar novo esporte",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" }
                },
                required: ["nome"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Esporte criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Esporte" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" }
        }
      }
    },
    
    // Produtos
    "/api/produtos": {
      post: {
        summary: "Criar produto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Produto" }
            }
          }
        },
        responses: {
          "201": {
            description: "Produto criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" }
              }
            }
          },
          "400": { description: "Requisição inválida" }
        }
      },
      get: {
        summary: "Listar produtos",
        responses: {
          "200": {
            description: "Lista de produtos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Produto" }
                }
              }
            }
          }
        }
      }
    },
    "/api/esportes/{id}": {
      put: {
        summary: "Atualizar esporte",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" }
                },
                required: ["nome"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Esporte atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Esporte" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "403": { description: "Acesso negado - apenas administradores" },
          "404": { description: "Esporte não encontrado" }
        }
      },
      delete: {
        summary: "Excluir esporte",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        responses: {
          "200": {
            description: "Esporte excluído",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { description: "Não é possível excluir o esporte Geral ou um esporte com inscrições ativas" },
          "403": { description: "Acesso negado - apenas administradores" },
          "404": { description: "Esporte não encontrado" }
        }
      }
    },
    
    // Inscrições
    "/api/inscricoes/minhas": {
      get: {
        summary: "Listar minhas inscrições",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de inscrições do usuário atual",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Inscricao" }
                }
              }
            }
          },
          "401": { description: "Não autorizado" }
        }
      }
    },
    "/api/inscricoes/{esporteId}": {
      post: {
        summary: "Criar inscrição em um esporte",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "esporteId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        responses: {
          "201": {
            description: "Inscrição criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Inscricao" }
              }
            }
          },
          "400": { description: "Inscrição já existente ou dados inválidos" },
          "401": { description: "Não autorizado" },
          "404": { description: "Esporte não encontrado" }
        }
      }
    },
    "/api/inscricoes/pendentes/{esporteId}": {
      get: {
        summary: "Listar inscrições pendentes para um esporte (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "esporteId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        responses: {
          "200": {
            description: "Lista de inscrições pendentes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Inscricao" }
                }
              }
            }
          },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" },
          "404": { description: "Esporte não encontrado" }
        }
      }
    },
    "/api/inscricoes/{id}": {
      put: {
        summary: "Atualizar status de inscrição (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da inscrição"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { 
                    type: "string",
                    enum: ["aceito", "recusado"]
                  }
                },
                required: ["status"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Status atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Inscricao" }
              }
            }
          },
          "400": { description: "Status inválido" },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" },
          "404": { description: "Inscrição não encontrada" }
        }
      }
    },
    
    // Mensagens
    "/api/mensagens/{esporteId}": {
      get: {
        summary: "Listar mensagens de um esporte",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "esporteId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        responses: {
          "200": {
            description: "Lista de mensagens",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Mensagem" }
                }
              }
            }
          },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - usuário não inscrito neste esporte" },
          "404": { description: "Esporte não encontrado" }
        }
      },
      post: {
        summary: "Criar nova mensagem em um esporte",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "esporteId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do esporte"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  conteudo: { type: "string" },
                  texto: { type: "string" }
                },
                required: ["conteudo"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Mensagem criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Mensagem" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - usuário não inscrito neste esporte" },
          "404": { description: "Esporte não encontrado" }
        }
      }
    },
    
    // Cart e e-commerce
    "/api/cart": {
      post: {
        summary: "Adicionar item ao carrinho",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItem" }
            }
          }
        },
        responses: {
          "201": {
            description: "Item adicionado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItem" }
              }
            }
          },
          "400": { description: "Dados inválidos" }
        }
      },
      get: {
        summary: "Listar itens do carrinho",
        parameters: [
          {
            name: "studentEmail",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Email do estudante"
          }
        ],
        responses: {
          "200": {
            description: "Itens encontrados",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CartItem" }
                }
              }
            }
          },
          "400": { description: "Parâmetro ausente" }
        }
      }
    },
    "/api/cart/{id}": {
      put: {
        summary: "Atualizar item no carrinho",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do item no carrinho"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  quantidade: { type: "integer", minimum: 1 }
                },
                required: ["quantidade"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Item atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItem" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "404": { description: "Item não encontrado" }
        }
      },
      delete: {
        summary: "Remover item do carrinho",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do item no carrinho"
          }
        ],
        responses: {
          "200": {
            description: "Item removido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "404": { description: "Item não encontrado" }
        }
      }
    },
    "/api/checkout": {
      post: {
        summary: "Finalizar compra",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  studentEmail: { type: "string" }
                },
                required: ["studentEmail"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Pedido criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Pedido" }
              }
            }
          },
          "400": { description: "Dados inválidos ou carrinho vazio" }
        }
      }
    },
    "/api/produtos/{id}": {
      put: {
        summary: "Atualizar produto",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do produto"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Produto" }
            }
          }
        },
        responses: {
          "200": {
            description: "Produto atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "404": { description: "Produto não encontrado" }
        }
      },
      delete: {
        summary: "Excluir produto",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do produto"
          }
        ],
        responses: {
          "200": {
            description: "Produto excluído",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "404": { description: "Produto não encontrado" }
        }
      }
    },
    "/api/mensagens/{id}": {
      put: {
        summary: "Editar mensagem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da mensagem"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  conteudo: { type: "string" }
                },
                required: ["conteudo"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Mensagem editada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Mensagem" }
              }
            }
          },
          "401": { description: "Não autorizado" },
          "403": { description: "Permissão negada - somente o autor pode editar" },
          "404": { description: "Mensagem não encontrada" }
        }
      },
      delete: {
        summary: "Excluir mensagem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da mensagem"
          }
        ],
        responses: {
          "200": {
            description: "Mensagem excluída",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "401": { description: "Não autorizado" },
          "403": { description: "Permissão negada - somente o autor ou admin podem excluir" },
          "404": { description: "Mensagem não encontrada" }
        }
      }
    },
    "/api/mensagens/{id}/fixar": {
      patch: {
        summary: "Fixar/desfixar mensagem (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da mensagem"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fixada: { type: "boolean" }
                },
                required: ["fixada"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Status de fixação atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Mensagem" }
              }
            }
          },
          "401": { description: "Não autorizado" },
          "403": { description: "Permissão negada - somente admin pode fixar mensagens" },
          "404": { description: "Mensagem não encontrada" }
        }
      }
    },
    "/api/pedidos": {
      get: {
        summary: "Listar pedidos",
        parameters: [
          {
            name: "studentEmail",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Email do estudante"
          }
        ],
        responses: {
          "200": {
            description: "Pedidos encontrados",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Pedido" }
                }
              }
            }
          },
          "400": { description: "Parâmetro ausente" }
        }
      }
    },
    "/api/pedidos/{id}/payment": {
      post: {
        summary: "Processar pagamento",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do pedido"
          }
        ],
        responses: {
          "200": {
            description: "Pagamento confirmado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    pedido: { $ref: "#/components/schemas/Pedido" }
                  }
                }
              }
            }
          },
          "404": { description: "Pedido não encontrado" }
        }
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ]
};
