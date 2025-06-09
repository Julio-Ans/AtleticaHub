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
    schemas: {      Produto: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          descricao: { type: "string" },
          preco: { type: "number", format: "float" },
          estoque: { type: "integer" },
          imagemUrl: { type: "string", description: "URL da imagem do produto" },
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
      },      Esporte: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string" },
          fotoUrl: { type: "string", description: "URL da foto do esporte" },
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
      },      RegisterRequest: {
        type: "object",
        required: ["email", "password", "nome", "telefone", "curso", "dataNascimento"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          nome: { type: "string" },
          telefone: { type: "string" },
          curso: { type: "string" },
          dataNascimento: { type: "string", format: "date" },
          codigo: { type: "string", description: "Código de convite opcional para admin" }
        }
      },      TokenRequest: {
        type: "object",
        required: ["idToken"],
        properties: {
          idToken: { type: "string", description: "Token JWT do Firebase" }
        }
      },
      UserResponse: {
        type: "object",
        properties: {
          uid: { type: "string" },
          email: { type: "string" },
          nome: { type: "string" },
          telefone: { type: "string" },
          curso: { type: "string" },
          role: { type: "string" },
          dataNascimento: { type: "string", format: "date" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          user: { "$ref": "#/components/schemas/UserResponse" },
          error: { type: "string" }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" }
        }
      },      Evento: {
        type: "object",        properties: {
          _id: { type: "string" },
          titulo: { type: "string" },
          descricao: { type: "string" },
          tipo: { type: "string" },
          data: { type: "string", format: "date-time" },
          local: { type: "string" },
          fotoUrl: { type: "string", description: "URL da foto do evento" },
          esporteId: { type: "string", description: "ID do esporte ao qual o evento pertence. Use '0' para eventos gerais." },
          criadoEm: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          criadorId: { type: "string" },
          inscricoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                usuarioId: { type: "string" },
                nome: { type: "string" },
                email: { type: "string" },
                dataInscricao: { type: "string", format: "date-time" }
              }
            }
          }
        },
        required: ["titulo", "tipo", "data", "local", "criadorId", "esporteId"]
      }
    }
  },
  paths: {
    // Autenticação
    "/auth/register": {
      post: {
        summary: "Registrar novo usuário",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Usuário registrado com sucesso",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "400": { description: "Erro de validação" },
          "403": { description: "Email não autorizado" }
        }
      }
    },    "/auth/login": {
      post: {
        summary: "Login do usuário",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/TokenRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "400": { description: "Token não fornecido" },
          "401": { description: "Token inválido" },
          "404": { description: "Usuário não encontrado" }
        }
      }
    },    "/auth/verify": {
      post: {
        summary: "Verificar token de autenticação",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/TokenRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Token válido" },
          "401": { description: "Token inválido" }
        }
      }
    },
    "/auth/profile": {
      post: {
        summary: "Obter perfil do usuário",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/TokenRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Perfil obtido com sucesso",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { description: "Token inválido" },
          "404": { description: "Usuário não encontrado" }
        }
      }
    },
    "/auth/update-profile": {
      put: {
        summary: "Atualizar perfil do usuário",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idToken"],
                properties: {
                  idToken: { type: "string" },
                  nome: { type: "string" },
                  telefone: { type: "string" },
                  curso: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Perfil atualizado com sucesso",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "400": { description: "Dados inválidos" },
          "401": { description: "Token inválido" }
        }
      }
    },
    "/auth/logout": {
      post: {
        summary: "Logout do usuário",
        tags: ["Auth"],
        responses: {
          "200": { description: "Logout realizado com sucesso" }        }
      }
    },
    "/auth/verify-user": {
      get: {
        summary: "Verifica acesso de usuário comum",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean" },
                    user: { $ref: "#/components/schemas/Usuario" }
                  }
                }
              }
            }
          },
          "403": { description: "Acesso negado" }
        }
      }
    },
    "/auth/verify-admin": {
      get: {
        summary: "Verifica acesso de administrador",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean" },
                    admin: { type: "boolean" },
                    user: { $ref: "#/components/schemas/Usuario" }
                  }
                }
              }
            }
          },
          "403": { description: "Acesso negado" }
        }
      }
    },
    "/auth/promote/{userId}": {
      patch: {
        summary: "Promover usuário a admin",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do usuário a ser promovido"
          }
        ],
        responses: {
          "200": { description: "Usuário promovido com sucesso" },
          "404": { description: "Usuário não encontrado" },
          "403": { description: "Acesso negado" }
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
      },      post: {
        summary: "Criar novo esporte",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  foto: { 
                    type: "string", 
                    format: "binary",
                    description: "Arquivo de imagem do esporte" 
                  }
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
    "/api/produtos": {      post: {
        summary: "Criar produto",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  descricao: { type: "string" },
                  preco: { type: "number", format: "float" },
                  estoque: { type: "integer" },
                  imagem: { 
                    type: "string", 
                    format: "binary",
                    description: "Arquivo de imagem do produto" 
                  }
                },
                required: ["nome", "descricao", "preco", "estoque", "imagem"]
              }
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
          "400": { description: "Requisição inválida" },
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" }
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
        ],        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  foto: { 
                    type: "string", 
                    format: "binary",
                    description: "Arquivo de imagem do esporte (opcional)" 
                  }
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
      }    },
    "/api/produtos/{id}": {
      get: {
        summary: "Detalhar produto por ID",
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
            description: "Produto encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" }
              }
            }
          },
          "404": { description: "Produto não encontrado" }
        }
      },
      put: {
        summary: "Atualizar produto",
        security: [{ bearerAuth: [] }],
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
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  descricao: { type: "string" },
                  preco: { type: "number", format: "float" },
                  estoque: { type: "integer" },
                  imagem: { 
                    type: "string", 
                    format: "binary",
                    description: "Arquivo de imagem do produto (opcional)" 
                  }
                }
              }
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
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" },
          "404": { description: "Produto não encontrado" }
        }
      },      delete: {
        summary: "Excluir produto",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "ID do produto"
          }
        ],        responses: {
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
          "401": { description: "Não autorizado" },
          "403": { description: "Acesso negado - apenas administradores" },
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
    },
    // Eventos
    "/api/eventos": {
      get: {
        summary: "Listar todos os eventos",
        responses: {
          "200": {
            description: "Lista de eventos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Evento" } }
              }
            }
          }
        }
      },      post: {
        summary: "Criar evento (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  tipo: { type: "string" },
                  data: { type: "string", format: "date-time" },
                  local: { type: "string" },
                  esporteId: { type: "string", description: "ID do esporte ao qual o evento pertence. Use '0' para eventos gerais." },
                  foto: { 
                    type: "string", 
                    format: "binary",
                    description: "Arquivo de imagem do evento" 
                  }
                },
                required: ["titulo", "tipo", "data", "local", "esporteId"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Evento criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Evento" }
              }
            }
          },
          "400": { description: "Erro ao criar evento" }
        }
      }
    },
    "/api/eventos/permitidos": {
      get: {
        summary: "Listar eventos permitidos para o usuário",
        security: [{ bearerAuth: [] }],
        description: "Lista eventos baseados nas inscrições em esportes do usuário",
        responses: {
          "200": {
            description: "Lista de eventos permitidos",
            content: {
              "application/json": {
                schema: { 
                  type: "array", 
                  items: { $ref: "#/components/schemas/Evento" } 
                }
              }
            }
          },
          "401": { description: "Token de autenticação inválido" },
          "500": { description: "Erro interno do servidor" }
        }
      }
    },
    "/api/eventos/{id}": {
      get: {
        summary: "Buscar evento por ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Evento encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Evento" }
              }
            }
          },
          "404": { description: "Evento não encontrado" }
        }
      },
      put: {
        summary: "Editar evento (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  tipo: { type: "string" },
                  data: { type: "string", format: "date-time" },
                  local: { type: "string" },
                  esporteId: { type: "string", description: "ID do esporte ao qual o evento pertence. Use '0' para eventos gerais." }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Evento atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Evento" } } } },
          "400": { description: "Erro ao editar evento" },
          "404": { description: "Evento não encontrado" }
        }
      },
      delete: {
        summary: "Excluir evento (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Evento excluído", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
          "404": { description: "Evento não encontrado" }
        }
      }
    },
    "/api/eventos/{id}/inscrever": {
      post: {
        summary: "Inscrever usuário no evento",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "201": { description: "Inscrição realizada com sucesso" },
          "400": { description: "Erro ao inscrever ou já inscrito" },
          "404": { description: "Evento não encontrado" }
        }
      },
      delete: {
        summary: "Cancelar inscrição do usuário no evento",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Inscrição cancelada com sucesso" },
          "404": { description: "Inscrição não encontrada ou evento não encontrado" }
        }
      }
    },    "/api/eventos/minhas/inscricoes": {
      get: {
        summary: "Listar eventos em que o usuário está inscrito",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de eventos inscritos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Evento" } }
              }
            }
          }
        }
      }
    },
    "/api/eventos/esporte/{esporteId}": {
      get: {
        summary: "Listar eventos por esporte",
        parameters: [
          { name: "esporteId", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        responses: {
          "200": {
            description: "Lista de eventos do esporte",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Evento" } }
              }
            }
          },
          "400": { description: "Erro ao buscar eventos" }
        }
      }
    },
  },
  security: [
    { bearerAuth: [] }
  ]
};
