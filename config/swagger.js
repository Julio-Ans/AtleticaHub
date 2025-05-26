module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API Loja AtléticaHub",
    version: "1.0.0",
    description: "Gerenciamento de produtos, carrinho e pedidos no AtléticaHub"
  },
  servers: [
    { url: "http://localhost:3000/api", description: "Servidor local" }
  ],
  components: {
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
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      }
    }
  },
  paths: {
    "/produtos": {
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
    "/cart": {
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
    "/pedidos": {
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
    "/pedidos/{id}/payment": {
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
  }
};
