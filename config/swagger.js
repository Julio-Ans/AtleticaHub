module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API AtléticaHub",
    version: "1.0.0",
    description: "API para gerenciamento de esportes, eventos, inscrições, mensagens, produtos, carrinho e pedidos do AtléticaHub, incluindo recomendações de produtos."
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
      // GENERIC SCHEMAS
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", description: "Mensagem de erro" },
          success: { type: "boolean", default: false },
          message: { type: "string", description: "Mensagem de erro (alternativa)" },
          code: { type: "string", description: "Código de erro interno (opcional)" },
          missingFields: { type: "array", items: { type: "string" }, description: "Campos ausentes na requisição (opcional)" }
        }
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: true },
          message: { type: "string", description: "Mensagem de sucesso" }
        }
      },

      // AUTH SCHEMAS
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID do usuário (Firebase UID)" },
          nome: { type: "string" },
          email: { type: "string", format: "email" },
          dataNascimento: { type: "string", format: "date-time", description: "Data de nascimento do usuário" },
          telefone: { type: "string" },
          curso: { type: "string" },
          role: { type: "string", enum: ["user", "admin"], description: "Papel do usuário" },
          createdAt: { type: "string", format: "date-time", description: "Data de criação do registro do usuário" },
          updatedAt: { type: "string", format: "date-time", description: "Data da última atualização do registro do usuário" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "nome", "telefone", "curso", "dataNascimento"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6, description: "Senha com no mínimo 6 caracteres" },
          nome: { type: "string" },
          telefone: { type: "string" },
          curso: { type: "string" },
          dataNascimento: { type: "string", format: "date", description: "Data de nascimento no formato YYYY-MM-DD" },
          codigo: { type: "string", description: "Código de convite opcional para definir papel (ex: admin)" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          user: { "$ref": "#/components/schemas/Usuario" },
          token: { type: "string", description: "Token JWT (geralmente não retornado aqui, o token é o Bearer enviado)" },
          role: { type: "string", description: "Papel do usuário logado" }
        }
      },
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "string" },
          curso: { type: "string" }
        },
        minProperties: 1,
        description: "Pelo menos um campo deve ser fornecido para atualização."
      },
      VerifyResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          uid: { type: "string" },
          email: { type: "string" }
        }
      },
      VerifyAccessResponse: {
        type: "object",
        properties: {
          authenticated: { type: "boolean" },
          admin: { type: "boolean", description: "Presente e true se for verificação de admin" },
          user: { 
            type: "object",
            properties: {
              uid: { type: "string" },
              nome: { type: "string" },
              role: { type: "string" }
            }
          }
        }
      },
      PromoteUserResponse: {
         type: "object",
         properties: {
           message: { type: "string" },
           user: { "$ref": "#/components/schemas/Usuario" }
         }
      },

      // PRODUTO SCHEMAS
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int32", description: "ID do produto" },
          nome: { type: "string" },
          descricao: { type: "string", nullable: true },
          preco: { type: "number", format: "float" },
          estoque: { type: "integer", format: "int32" },
          imagemUrl: { type: "string", format: "url", nullable: true, description: "URL da imagem do produto" },
          categoriaId: { type: "string", nullable: true, description: "ID da categoria do produto" },
          atleticaId: { type: "string", nullable: true, description: "ID da atlética associada ao produto" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["nome", "preco", "estoque"]
      },
      CreateProdutoRequest: {
        type: "object",
        required: ["nome", "preco", "estoque"],
        properties: {
          nome: { type: "string" },
          descricao: { type: "string" },
          preco: { type: "number", format: "float" },
          estoque: { type: "integer", format: "int32" },
          categoriaId: { type: "string" },
          atleticaId: { type: "string" },
          imagem: { type: "string", format: "binary", description: "Arquivo de imagem do produto" }
        }
      },
      UpdateProdutoRequest: {
        type: "object",
        properties: {
          nome: { type: "string" },
          descricao: { type: "string" },
          preco: { type: "number", format: "float" },
          estoque: { type: "integer", format: "int32" },
          categoriaId: { type: "string" },
          atleticaId: { type: "string" },
          imagem: { type: "string", format: "binary", description: "Arquivo de imagem do produto (opcional)" }
        },
        minProperties: 1
      },
      ProdutoRecomendacaoRequest: {
        type: "object",
        properties: {
          produtoBaseId: { type: "string", description: "ID do produto base para recomendações (opcional)" },
          quantidade: { type: "integer", format: "int32", description: "Número de recomendações desejadas (default: 3)", nullable: true }
        }
      },
      ProdutoRecomendacaoResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          recomendacoes: {
            type: "array",
            items: { "$ref": "#/components/schemas/Produto" }
          }
        }
      },
      AtualizarImagensResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          atualizados: { type: "integer", format: "int32" },
          falhas: { type: "integer", format: "int32" },
          produtosNaoEncontrados: { type: "integer", format: "int32" }
        }
      },

      // ESPORTE SCHEMAS
      Esporte: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID do esporte (gerado automaticamente)" },
          nome: { type: "string" },
          fotoUrl: { type: "string", format: "url", nullable: true, description: "URL da foto do esporte" },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" }
        },
        required: ["nome"]
      },
      CreateEsporteRequest: {
        type: "object",
        required: ["nome"],
        properties: {
          nome: { type: "string" },
          foto: { type: "string", format: "binary", description: "Arquivo de imagem do esporte" }
        }
      },
      UpdateEsporteRequest: {
        type: "object",
        properties: {
          nome: { type: "string" },
          foto: { type: "string", format: "binary", description: "Arquivo de imagem do esporte (opcional)" }
        },
        minProperties: 1
      },

      // EVENTO SCHEMAS (MongoDB)
      Evento: {
        type: "object",
        properties: {
          _id: { type: "string", description: "ID do evento (MongoDB ObjectId)" },
          titulo: { type: "string" },
          descricao: { type: "string", nullable: true },
          tipo: { type: "string", description: "Tipo de evento (ex: Jogo, Treino, Social)" },
          data: { type: "string", format: "date-time", description: "Data e hora do evento" },
          local: { type: "string" },
          fotoUrl: { type: "string", format: "url", nullable: true, description: "URL da foto do evento" },
          esporteId: { type: "string", description: "ID do esporte associado, ou '0' para eventos gerais" },
          criadorId: { type: "string", description: "ID do usuário que criou o evento" },
          inscricoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string", description: "ID da inscrição no evento" },
                usuarioId: { type: "string" },
                nome: { type: "string", description: "Nome do usuário inscrito (denormalizado)" },
                email: { type: "string", format: "email", description: "Email do usuário inscrito (denormalizado)" },
                dataInscricao: { type: "string", format: "date-time" }
              }
            },
            description: "Lista de usuários inscritos no evento"
          },
          criadoEm: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["titulo", "tipo", "data", "local", "criadorId", "esporteId"]
      },
      CreateEventoRequest: {
        type: "object",
        required: ["titulo", "tipo", "data", "local", "esporteId"],
        properties: {
          titulo: { type: "string" },
          descricao: { type: "string" },
          tipo: { type: "string" },
          data: { type: "string", format: "date-time" },
          local: { type: "string" },
          esporteId: { type: "string", description: "ID do esporte ou '0' para geral" },
          foto: { type: "string", format: "binary", description: "Arquivo de imagem do evento" }
        }
      },
      UpdateEventoRequest: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          descricao: { type: "string" },
          tipo: { type: "string" },
          data: { type: "string", format: "date-time" },
          local: { type: "string" },
          esporteId: { type: "string" },
          foto: { type: "string", format: "binary" }
        },
        minProperties: 1
      },
      InscricaoEventoResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          evento: { "$ref": "#/components/schemas/Evento" }
        }
      },
      ListaInscritosEventoResponse: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string" },
            usuarioId: { type: "string" },
            nome: { type: "string" },
            email: { type: "string" },
            dataInscricao: { type: "string", format: "date-time" }
          }
        }
      },

      // INSCRICAO (Modalidade/Esporte) SCHEMAS
      InscricaoEsporte: { // Renomeado de Inscricao para evitar conflito com inscricao de evento
        type: "object",
        properties: {
          id: { type: "string", description: "ID da inscrição na modalidade/esporte" },
          usuarioId: { type: "string" },
          esporteId: { type: "string" },
          status: { type: "string", enum: ["pendente", "aceito", "recusado"], default: "pendente" },
          criadaEm: { type: "string", format: "date-time" },
          atualizadaEm: { type: "string", format: "date-time" },
          usuario: { "$ref": "#/components/schemas/Usuario" }, // Para detalhes do usuário
          esporte: { "$ref": "#/components/schemas/Esporte" }  // Para detalhes do esporte
        }
      },
      CreateInscricaoEsporteRequest: {
        type: "object",
        required: ["esporteId"],
        properties: {
          esporteId: { type: "string", description: "ID do esporte para se inscrever" }
        }
      },
      UpdateInscricaoEsporteStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["aceito", "recusado"] }
        }
      },

      // MENSAGEM SCHEMAS (MongoDB)
      Mensagem: {
        type: "object",
        properties: {
          _id: { type: "string", description: "ID da mensagem (MongoDB ObjectId)" },
          conteudo: { type: "string" },
          usuarioId: { type: "string", description: "ID do usuário que enviou (Firebase UID)" },
          usuarioNome: { type: "string", description: "Nome do usuário que enviou (denormalizado)" },
          esporteId: { type: "string", description: "ID do esporte ao qual a mensagem pertence" },
          fixada: { type: "boolean", default: false },
          criadaEm: { type: "string", format: "date-time" },
          editadaEm: { type: "string", format: "date-time", nullable: true }
        },
        required: ["conteudo", "usuarioId", "usuarioNome", "esporteId"]
      },
      CreateMensagemRequest: {
        type: "object",
        required: ["conteudo", "esporteId"],
        properties: {
          conteudo: { type: "string" },
          esporteId: { type: "string" }
        }
      },
      UpdateMensagemRequest: {
        type: "object",
        required: ["conteudo"],
        properties: {
          conteudo: { type: "string" }
        }
      },

      // CART SCHEMAS
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int32" },
          usuarioId: { type: "string" },
          produtoId: { type: "integer", format: "int32" },
          quantidade: { type: "integer", format: "int32" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          produto: { "$ref": "#/components/schemas/Produto" } // Detalhes do produto no carrinho
        }
      },
      Cart: {
        type: "object",
        properties: {
          itens: {
            type: "array",
            items: { "$ref": "#/components/schemas/CartItem" }
          },
          total: { type: "number", format: "float", description: "Valor total do carrinho" }
        }
      },
      AddCartItemRequest: {
        type: "object",
        required: ["produtoId", "quantidade"],
        properties: {
          produtoId: { type: "integer", format: "int32" },
          quantidade: { type: "integer", format: "int32", minimum: 1 }
        }
      },
      UpdateCartItemRequest: {
        type: "object",
        required: ["quantidade"],
        properties: {
          quantidade: { type: "integer", format: "int32", minimum: 1 }
        }
      },

      // PEDIDO SCHEMAS
      PedidoItemDetalhe: { // Usado dentro do Pedido
        type: "object",
        properties: {
          id: { type: "integer" },
          produtoId: { type: "integer" },
          quantidade: { type: "integer" },
          precoUnitario: { type: "number", format: "float", description: "Preço do produto no momento da compra" },
          produto: { // Detalhes simplificados do produto no pedido
            type: "object",
            properties: {
              nome: { type: "string" },
              imagemUrl: { type: "string", nullable: true }
            }
          }
        }
      },
      Pedido: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int32" },
          usuarioId: { type: "string" },
          usuario: { // Detalhes simplificados do usuário no pedido
            type: "object",
            properties: {
              nome: { type: "string" },
              email: { type: "string" },
              telefone: { type: "string", nullable: true }
            }
          },
          itens: { // Renomeado de 'produtos' para 'itens' para clareza
            type: "array",
            items: { "$ref": "#/components/schemas/PedidoItemDetalhe" }
          },
          total: { type: "number", format: "float" },
          status: { type: "string", enum: ["pendente", "processando", "pagamento_falhou", "pago", "enviado", "entregue", "cancelado"], default: "pendente" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      UpdatePedidoStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["processando", "pagamento_falhou", "pago", "enviado", "entregue", "cancelado"] }
        }
      },
      PagamentoRequest: { // Para a rota /api/pedidos/pagar
        type: "object",
        required: ["pedidoId"],
        properties: {
          pedidoId: { type: "integer", format: "int32", description: "ID do pedido a ser pago" }
          // Outros detalhes como método de pagamento podem ser inferidos ou fixos por enquanto
          // Se o cliente puder escolher o método, adicionar aqui:
          // metodoPagamento: { type: "string", enum: ["pix", "cartao_credito", "boleto"] }
        }
      },
      PagamentoResponse: { // Resposta da criação de pagamento
        type: "object",
        properties: {
          id: { type: "string", description: "ID da preferência de pagamento ou do pagamento" },
          status: { type: "string", description: "Status do pagamento" },
          qr_code: { type: "string", description: "QR Code para PIX (string de dados)" , nullable: true},
          qr_code_base64: { type: "string", description: "QR Code para PIX em Base64", nullable: true },
          ticket_url: { type: "string", description: "URL do boleto (se aplicável)", nullable: true },
          init_point: { type: "string", description: "Ponto de inicialização do pagamento (URL de checkout)", nullable: true },
          message: { type: "string", description: "Mensagem adicional", nullable: true }
        }
      }
    }
  },
  paths: {
    // =================== AUTHENTICATION ===================
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
            content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } }
          },
          "400": { description: "Erro de validação (ex: campos ausentes, email inválido, senha fraca)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Domínio de email não autorizado ou código de convite inválido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "409": { description: "Email já está em uso", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro interno do servidor", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login do usuário com token Firebase",
        description: "Recebe um token Firebase ID (obtido pelo cliente ao autenticar com Firebase) via Bearer token e retorna o perfil do usuário no sistema AtléticaHub.",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }], // Indica que espera "Authorization: Bearer <FirebaseIdToken>"
        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } }
          },
          "401": { description: "Token ausente, malformado ou inválido/expirado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Usuário não encontrado no banco de dados local (deve ser criado automaticamente se o token for válido)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro interno do servidor", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/verify": {
      post: {
        summary: "Verificar token de autenticação Firebase",
        description: "Verifica a validade de um token Firebase ID enviado via Bearer token.",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }], // Indica que espera "Authorization: Bearer <FirebaseIdToken>"
        responses: {
          "200": { description: "Token válido", content: { "application/json": { schema: { "$ref": "#/components/schemas/VerifyResponse" } } } },
          "401": { description: "Token ausente, malformado ou inválido/expirado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/profile": {
      get: {
        summary: "Obter perfil do usuário logado",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Perfil obtido com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } },
          "401": { description: "Não autorizado (token inválido ou ausente)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Usuário não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/update-profile": {
      put: {
        summary: "Atualizar perfil do usuário logado",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/ProfileUpdateRequest" } } }
        },
        responses: {
          "200": { description: "Perfil atualizado com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } },
          "400": { description: "Dados inválidos ou nenhum campo fornecido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/logout": {
      post: {
        summary: "Logout do usuário (informativo)",
        description: "O logout efetivo é gerenciado no cliente invalidando o token Firebase. Esta rota é informativa.",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Logout realizado com sucesso (no servidor)", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/verify-user": {
      get: {
        summary: "Verifica se o usuário logado tem acesso de 'user' ou superior",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Acesso permitido", content: { "application/json": { schema: { "$ref": "#/components/schemas/VerifyAccessResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (papel insuficiente)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/verify-admin": {
      get: {
        summary: "Verifica se o usuário logado tem acesso de 'admin'",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Acesso de administrador permitido", content: { "application/json": { schema: { "$ref": "#/components/schemas/VerifyAccessResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (não é administrador)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/promote/{userId}": {
      patch: {
        summary: "Promover um usuário a administrador (Admin)",
        tags: ["Auth"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" }, description: "ID do usuário a ser promovido" }
        ],
        responses: {
          "200": { description: "Usuário promovido com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/PromoteUserResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (requer papel de admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Usuário não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao promover usuário", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== PRODUTOS ===================
    "/api/produtos": {
      get: {
        summary: "Listar todos os produtos",
        tags: ["Produtos"],
        parameters: [
          { name: "categoriaId", in: "query", required: false, schema: { type: "string" }, description: "Filtrar produtos por ID da categoria" },
          { name: "atleticaId", in: "query", required: false, schema: { type: "string" }, description: "Filtrar produtos por ID da atlética" },
          { name: "minPreco", in: "query", required: false, schema: { type: "number", format: "float" }, description: "Preço mínimo" },
          { name: "maxPreco", in: "query", required: false, schema: { type: "number", format: "float" }, description: "Preço máximo" },
          { name: "nome", in: "query", required: false, schema: { type: "string" }, description: "Buscar produtos por nome (parcial)" },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Número da página" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, description: "Resultados por página" }
        ],
        responses: {
          "200": { description: "Lista de produtos", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Produto" } } } } },
          "500": { description: "Erro ao buscar produtos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      post: {
        summary: "Criar novo produto (Admin)",
        tags: ["Produtos"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/CreateProdutoRequest" } } }
        },
        responses: {
          "201": { description: "Produto criado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Produto" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (requer papel de admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao criar produto", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/produtos/{id}": {
      get: {
        summary: "Obter produto por ID",
        tags: ["Produtos"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do produto" }
        ],
        responses: {
          "200": { description: "Detalhes do produto", content: { "application/json": { schema: { "$ref": "#/components/schemas/Produto" } } } },
          "404": { description: "Produto não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar produto", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      put: {
        summary: "Atualizar produto (Admin)",
        tags: ["Produtos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do produto" }
        ],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/UpdateProdutoRequest" } } }
        },
        responses: {
          "200": { description: "Produto atualizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Produto" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Produto não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar produto", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        summary: "Deletar produto (Admin)",
        tags: ["Produtos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do produto" }
        ],
        responses: {
          "200": { description: "Produto deletado", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Produto não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao deletar produto", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/produtos/admin/atualizar-imagens-aleatorias": {
      post: {
        summary: "Atualizar imagens de produtos sem imagem (Admin)",
        description: "Busca produtos com imagemUrl nula ou vazia e atualiza com uma URL padrão.",
        tags: ["Produtos"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Processo de atualização de imagens concluído.", content: { "application/json": { schema: { "$ref": "#/components/schemas/AtualizarImagensResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (requer papel de admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro no processo de atualização", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/produtos/recomendacoes": {
      post: {
        summary: "Obter recomendações de produtos (Usuário Logado)",
        tags: ["Produtos"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: false,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/ProdutoRecomendacaoRequest" } } }
        },
        responses: {
          "200": { description: "Recomendações de produtos obtidas com sucesso.", content: { "application/json": { schema: { "$ref": "#/components/schemas/ProdutoRecomendacaoResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao obter recomendações", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== ESPORTES ===================
    "/api/esportes": {
      get: {
        summary: "Listar todos os esportes",
        tags: ["Esportes"],
        // security: [{ "bearerAuth": [] }], // Rota pública conforme esporteRoutes.js
        responses: {
          "200": { description: "Lista de esportes", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Esporte" } } } } },
          // "401": { description: "Não autorizado" }, // Removido pois a rota é pública
          "500": { description: "Erro ao buscar esportes", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      post: {
        summary: "Criar novo esporte (Admin)",
        tags: ["Esportes"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/CreateEsporteRequest" } } }
        },
        responses: {
          "201": { description: "Esporte criado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Esporte" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao criar esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/esportes/{id}": {
      get: {
        summary: "Obter esporte por ID",
        tags: ["Esportes"],
        // security: [{ "bearerAuth": [] }], // Rota pública
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        responses: {
          "200": { description: "Detalhes do esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/Esporte" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      put: {
        summary: "Atualizar esporte (Admin)",
        tags: ["Esportes"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/UpdateEsporteRequest" } } }
        },
        responses: {
          "200": { description: "Esporte atualizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Esporte" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        summary: "Deletar esporte (Admin)",
        tags: ["Esportes"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        responses: {
          "200": { description: "Esporte deletado", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao deletar esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== EVENTOS ===================
    "/api/eventos": {
      get: {
        summary: "Listar todos os eventos",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
         parameters: [
          { name: "esporteId", in: "query", required: false, schema: { type: "string" }, description: "Filtrar eventos por ID do esporte (use '0' para eventos gerais)" },
          { name: "tipo", in: "query", required: false, schema: { type: "string" }, description: "Filtrar eventos por tipo" },
          { name: "dataInicio", in: "query", required: false, schema: { type: "string", format: "date" }, description: "Filtrar eventos com data a partir de (YYYY-MM-DD)" },
          { name: "dataFim", in: "query", required: false, schema: { type: "string", format: "date" }, description: "Filtrar eventos com data até (YYYY-MM-DD)" }
        ],
        responses: {
          "200": { description: "Lista de eventos", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Evento" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar eventos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      post: {
        summary: "Criar novo evento (Admin ou Usuário Logado)",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/CreateEventoRequest" } } }
        },
        responses: {
          "201": { description: "Evento criado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Evento" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao criar evento", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
     "/api/eventos/user": {
      get: {
        summary: "Listar eventos nos quais o usuário está inscrito ou que são gerais",
        tags: ["Eventos"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de eventos do usuário", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Evento" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar eventos do usuário", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/eventos/{id}": {
      get: {
        summary: "Obter evento por ID",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do evento" }
        ],
        responses: {
          "200": { description: "Detalhes do evento", content: { "application/json": { schema: { "$ref": "#/components/schemas/Evento" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar evento", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      put: {
        summary: "Atualizar evento (Criador ou Admin)",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do evento" }
        ],
        requestBody: {
          required: true,
          content: { "multipart/form-data": { schema: { "$ref": "#/components/schemas/UpdateEventoRequest" } } }
        },
        responses: {
          "200": { description: "Evento atualizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Evento" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (usuário não é criador nem admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar evento", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        summary: "Deletar evento (Criador ou Admin)",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID do evento" }
        ],
        responses: {
          "200": { description: "Evento deletado", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao deletar evento", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/eventos/{eventoId}/inscrever": {
      post: {
        summary: "Inscrever usuário logado em um evento",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "eventoId", in: "path", required: true, schema: { type: "string" }, description: "ID do evento para se inscrever" }
        ],
        responses: {
          "200": { description: "Inscrição realizada com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/InscricaoEventoResponse" } } } },
          "400": { description: "Usuário já inscrito ou evento não permite mais inscrições", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao realizar inscrição", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/eventos/{eventoId}/inscricao": {
      delete: {
        summary: "Cancelar inscrição do usuário logado em um evento",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "eventoId", in: "path", required: true, schema: { type: "string" }, description: "ID do evento para cancelar inscrição" }
        ],
        responses: {
          "200": { description: "Inscrição cancelada com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/InscricaoEventoResponse" } } } },
          "400": { description: "Usuário não estava inscrito", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao cancelar inscrição", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/eventos/{eventoId}/inscritos": {
      get: {
        summary: "Listar usuários inscritos em um evento (Admin)",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "eventoId", in: "path", required: true, schema: { type: "string" }, description: "ID do evento" }
        ],
        responses: {
          "200": { description: "Lista de usuários inscritos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ListaInscritosEventoResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar inscritos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/eventos/{eventoId}/inscritos/{usuarioId}": {
      delete: {
        summary: "Remover inscrição de um usuário específico de um evento (Admin)",
        tags: ["Eventos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "eventoId", in: "path", required: true, schema: { type: "string" }, description: "ID do evento" },
          { name: "usuarioId", in: "path", required: true, schema: { type: "string" }, description: "ID do usuário a ser removido da inscrição" }
        ],
        responses: {
          "200": { description: "Inscrição do usuário removida com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/InscricaoEventoResponse" } } } },
          "400": { description: "Usuário não estava inscrito ou erro ao remover", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (requer papel de admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Evento ou usuário não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao remover inscrição", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== INSCRIÇÕES (Modalidades/Esportes) ===================
    "/api/inscricoes": {
      post: {
        summary: "Inscrever-se em uma modalidade esportiva",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateInscricaoEsporteRequest" } } }
        },
        responses: {
          "201": { description: "Inscrição criada com sucesso (status pendente)", content: { "application/json": { schema: { "$ref": "#/components/schemas/InscricaoEsporte" } } } },
          "400": { description: "Dados inválidos ou já inscrito", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao criar inscrição", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      get: {
        summary: "Listar todas as inscrições em modalidades (Admin)",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Lista de todas as inscrições", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/InscricaoEsporte" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar inscrições", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/inscricoes/minhas": {
      get: {
        summary: "Listar minhas inscrições em modalidades esportivas",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Lista das minhas inscrições", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/InscricaoEsporte" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar minhas inscrições", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/inscricoes/esporte/{esporteId}": {
      get: {
        summary: "Listar inscrições para um esporte específico (Admin)",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "esporteId", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        responses: {
          "200": { description: "Lista de inscrições para o esporte", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/InscricaoEsporte" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar inscrições do esporte", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/inscricoes/{id}/status": {
      put: {
        summary: "Aprovar ou recusar inscrição em modalidade (Admin)",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da inscrição" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/UpdateInscricaoEsporteStatusRequest" } } }
        },
        responses: {
          "200": { description: "Status da inscrição atualizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/InscricaoEsporte" } } } },
          "400": { description: "Status inválido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Inscrição não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar status", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
     "/api/inscricoes/{id}": {
      delete: {
        summary: "Cancelar/deletar inscrição em modalidade (Usuário dono ou Admin)",
        tags: ["Inscrições Esportes"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da inscrição a ser deletada" }
        ],
        responses: {
          "200": { description: "Inscrição deletada com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (usuário não é dono nem admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Inscrição não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao deletar inscrição", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== MENSAGENS ===================
    "/api/mensagens": {
      post: {
        summary: "Enviar nova mensagem em um chat de esporte",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateMensagemRequest" } } }
        },
        responses: {
          "201": { description: "Mensagem enviada", content: { "application/json": { schema: { "$ref": "#/components/schemas/Mensagem" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Usuário não inscrito no esporte (se necessário para postar)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao enviar mensagem", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/mensagens/esporte/{esporteId}": {
      get: {
        summary: "Listar mensagens de um chat de esporte",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "esporteId", in: "path", required: true, schema: { type: "string" }, description: "ID do esporte" }
        ],
        responses: {
          "200": { description: "Lista de mensagens", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Mensagem" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Esporte não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar mensagens", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/mensagens/{id}": {
      put: {
        summary: "Editar uma mensagem (Autor ou Admin)",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da mensagem" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/UpdateMensagemRequest" } } }
        },
        responses: {
          "200": { description: "Mensagem editada", content: { "application/json": { schema: { "$ref": "#/components/schemas/Mensagem" } } } },
          "400": { description: "Conteúdo inválido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (não é autor nem admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Mensagem não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao editar mensagem", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        summary: "Deletar uma mensagem (Autor ou Admin)",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da mensagem" }
        ],
        responses: {
          "200": { description: "Mensagem deletada", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Mensagem não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao deletar mensagem", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/mensagens/{id}/fixar": {
      put: {
        summary: "Fixar uma mensagem no chat do esporte (Admin)",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da mensagem a ser fixada" }
        ],
        responses: {
          "200": { description: "Mensagem fixada", content: { "application/json": { schema: { "$ref": "#/components/schemas/Mensagem" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Mensagem não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao fixar mensagem", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/mensagens/{id}/desafixar": {
      put: {
        summary: "Desafixar uma mensagem no chat do esporte (Admin)",
        tags: ["Mensagens"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID da mensagem a ser desafixada" }
        ],
        responses: {
          "200": { description: "Mensagem desafixada", content: { "application/json": { schema: { "$ref": "#/components/schemas/Mensagem" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Mensagem não encontrada", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao desafixar mensagem", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== CARRINHO (Cart) ===================
    "/api/cart": {
      get: {
        summary: "Obter carrinho do usuário logado",
        tags: ["Carrinho"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Carrinho do usuário", content: { "application/json": { schema: { "$ref": "#/components/schemas/Cart" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao obter carrinho", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/cart/add": {
      post: {
        summary: "Adicionar item ao carrinho",
        tags: ["Carrinho"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/AddCartItemRequest" } } }
        },
        responses: {
          "200": { description: "Item adicionado/atualizado no carrinho", content: { "application/json": { schema: { "$ref": "#/components/schemas/CartItem" } } } },
          "400": { description: "Dados inválidos (ex: produtoId ou quantidade)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Produto não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao adicionar item", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/cart/update/{itemId}": {
      put: {
        summary: "Atualizar quantidade de um item no carrinho",
        tags: ["Carrinho"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "itemId", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do item no carrinho" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/UpdateCartItemRequest" } } }
        },
        responses: {
          "200": { description: "Quantidade do item atualizada", content: { "application/json": { schema: { "$ref": "#/components/schemas/CartItem" } } } },
          "400": { description: "Quantidade inválida", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Item do carrinho não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar item", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/cart/remove/{itemId}": {
      delete: {
        summary: "Remover item do carrinho",
        tags: ["Carrinho"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "itemId", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do item no carrinho" }
        ],
        responses: {
          "200": { description: "Item removido do carrinho", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Item do carrinho não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao remover item", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // =================== PEDIDOS ===================
    "/api/pedidos": {
      post: {
        summary: "Criar novo pedido a partir do carrinho do usuário",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "201": { description: "Pedido criado com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/Pedido" } } } },
          "400": { description: "Carrinho vazio ou itens indisponíveis", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao criar pedido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      get: {
        summary: "Listar todos os pedidos (Admin)",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
            { name: "status", in: "query", required: false, schema: { type: "string", enum: ["pendente", "processando", "pagamento_falhou", "pago", "enviado", "entregue", "cancelado"] }, description: "Filtrar pedidos por status" },
            { name: "usuarioId", in: "query", required: false, schema: { type: "string" }, description: "Filtrar pedidos por ID do usuário" },
            { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Número da página" },
            { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, description: "Resultados por página" }
        ],
        responses: {
          "200": { description: "Lista de todos os pedidos", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Pedido" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar pedidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/pedidos/meus": {
      get: {
        summary: "Listar meus pedidos",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        responses: {
          "200": { description: "Lista de pedidos do usuário", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Pedido" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar meus pedidos", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/pedidos/{id}": {
      get: {
        summary: "Obter detalhes de um pedido por ID (Usuário dono ou Admin)",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do pedido" }
        ],
        responses: {
          "200": { description: "Detalhes do pedido", content: { "application/json": { schema: { "$ref": "#/components/schemas/Pedido" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado (usuário não é dono nem admin)", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Pedido não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao buscar pedido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/pedidos/{id}/status": {
      put: {
        summary: "Atualizar status de um pedido (Admin)",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", format: "int32" }, description: "ID do pedido" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/UpdatePedidoStatusRequest" } } }
        },
        responses: {
          "200": { description: "Status do pedido atualizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/Pedido" } } } },
          "400": { description: "Status inválido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Pedido não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao atualizar status do pedido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/pedidos/pagar": {
      post: {
        summary: "Iniciar processo de pagamento para um pedido",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/PagamentoRequest" } } }
        },
        responses: {
          "200": { description: "Preferência de pagamento criada com sucesso", content: { "application/json": { schema: { "$ref": "#/components/schemas/PagamentoResponse" } } } },
          "400": { description: "Dados inválidos ou pedido já pago/processando", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Usuário não autorizado a pagar este pedido", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Pedido não encontrado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao processar pagamento", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    // "/api/pedidos/webhook/mercadopago": {
    //   post: {
    //     summary: "Webhook para notificações de pagamento do Mercado Pago",
    //     tags: ["Pedidos"],
    //     description: "Endpoint para receber atualizações de status de pagamento do Mercado Pago.",
    //     requestBody: {
    //       required: true,
    //       content: { "application/json": { schema: { "$ref": "#/components/schemas/MercadoPagoWebhookRequest" } } }
    //     },
    //     responses: {
    //       "200": { description: "Notificação recebida e processada", content: { "application/json": { schema: { "$ref": "#/components/schemas/SuccessResponse" } } } },
    //       "400": { description: "Payload inválido ou tipo de evento não suportado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
    //       "500": { description: "Erro ao processar notificação", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
    //     }
    //   }
    // },
    "/api/pedidos/status-admin": {
      get: {
        summary: "Listar pedidos por status (Admin)",
        tags: ["Pedidos"],
        security: [{ "bearerAuth": [] }],
        parameters: [
          { name: "status", in: "query", required: false, schema: { type: "string" }, description: "Status do pedido (ex: pendente, pago)" },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Número da página" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 }, description: "Resultados por página" }
        ],
        responses: {
          "200": { description: "Lista de pedidos filtrados por status", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Pedido" } } } } },
          "401": { description: "Não autorizado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Acesso negado", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao listar pedidos por status", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    }
  },
  security: [ // Aplica bearerAuth globalmente, pode ser sobrescrito por endpoint
    {
      "bearerAuth": []
    }
  ]
};