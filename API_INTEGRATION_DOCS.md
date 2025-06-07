# AtleticaHub - Documentação Completa da API

## Visão Geral

A API do AtleticaHub oferece um sistema completo de gerenciamento esportivo e loja com endpoints para:
- **Autenticação** (Firebase + Sistema próprio)
- **Esportes** (CRUD para admins, listagem e inscrições para usuários)
- **Eventos** (CRUD para admins, inscrições para usuários)
- **Mensagens** (Sistema de chat por esporte)
- **Inscrições** (Gerenciamento de participações)
- **Produtos** (Sistema de loja - CRUD para admins, listagem para usuários)
- **Carrinho** (Gerenciamento de itens para compra)
- **Pedidos** (Sistema de compras e pagamentos)

### URL Base
```
http://localhost:3000
```

### Autenticação
Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticação

### 1. Configuração Firebase
```javascript
GET /config/firebase
```

**Resposta:**
```json
{
  "apiKey": "sua-api-key",
  "authDomain": "seu-domain.firebaseapp.com",
  "projectId": "seu-project-id"
}
```

### 2. Login
```javascript
POST /auth/login
Content-Type: application/json

{
  "idToken": "firebase-id-token",
  "email": "usuario@exemplo.com",
  "displayName": "Nome do Usuário"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt-token-do-sistema",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "role": "user",
    "criadoEm": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Verificação de Token
```javascript
GET /auth/verify
Authorization: Bearer <token>
```

### 4. Verificação de Usuário/Admin
```javascript
GET /auth/verify-user
GET /auth/verify-admin
Authorization: Bearer <token>
```

---

## 🏃‍♀️ Esportes API

### 1. Listar Esportes
```javascript
GET /api/esportes
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Futebol",
    "descricao": "Modalidade de futebol",
    "foto": "base64-encoded-image",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "inscricoes": [
      {
        "id": 1,
        "status": "aprovada",
        "usuario": {
          "nome": "João Silva"
        }
      }
    ]
  }
]
```

### 2. Criar Esporte (Admin apenas)
```javascript
POST /api/esportes
Authorization: Bearer <token>
Content-Type: multipart/form-data

nome: "Basquete"
descricao: "Modalidade de basquete"
foto: [arquivo de imagem]
```

**Resposta:**
```json
{
  "success": true,
  "message": "Esporte criado com sucesso",
  "esporte": {
    "id": 2,
    "nome": "Basquete",
    "descricao": "Modalidade de basquete",
    "foto": "base64-encoded-image"
  }
}
```

### 3. Atualizar Esporte (Admin apenas)
```javascript
PUT /api/esportes/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

nome: "Basquete Atualizado"
descricao: "Nova descrição"
foto: [arquivo de imagem opcional]
```

### 4. Excluir Esporte (Admin apenas)
```javascript
DELETE /api/esportes/:id
Authorization: Bearer <token>
```

---

## 📅 Eventos API

### 1. Listar Eventos (Público)
```javascript
GET /api/eventos
```

**Resposta:**
```json
[
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e1",
    "titulo": "Treino de Futebol",
    "descricao": "Treino técnico semanal",
    "tipo": "treino",
    "data": "2024-12-31T18:00:00.000Z",
    "local": "Campo Principal",
    "esporteId": "123",
    "criadorId": "admin123",
    "fotoUrl": "https://storage.googleapis.com/...",
    "inscricoes": [
      {
        "usuarioId": "user123",
        "nome": "João Silva",
        "email": "joao@example.com",
        "dataInscricao": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e2",
    "titulo": "Festa de Confraternização",
    "descricao": "Festa de final de ano",
    "tipo": "festa",
    "data": "2024-12-31T20:00:00.000Z",
    "local": "Salão de Festas",
    "esporteId": "0",
    "criadorId": "admin123",
    "fotoUrl": "https://storage.googleapis.com/...",
    "inscricoes": []
  }
]
```

### 2. Listar Eventos por Esporte
```javascript
GET /api/eventos/esporte/:esporteId
```

**Exemplo:**
```javascript
GET /api/eventos/esporte/1  // Eventos do esporte com ID 1
GET /api/eventos/esporte/0  // Eventos gerais
```

### 3. Buscar Evento por ID
```javascript
GET /api/eventos/:id
```

### 4. Criar Evento (Admin apenas)
```javascript
POST /api/eventos
Authorization: Bearer <token>
Content-Type: multipart/form-data

titulo: "Novo Evento"
descricao: "Descrição do evento"
tipo: "festa" // Determinado automaticamente baseado na seleção do dropdown
data: "2024-12-31T18:00:00Z"
local: "Local do evento"
esporteId: "0" // "0" para eventos gerais, ID do esporte para treinos
foto: [arquivo de imagem - opcional]
```

**📋 Nova Estrutura de Criação via Interface:**

**Interface de Criação:**
1. **Primeiro Dropdown** - Tipo de Evento:
   - `geral`: Para eventos abertos a todos
   - `treino`: Para treinos específicos de esporte

2. **Segundo Dropdown** - Depende do primeiro:
   - Se `geral` → Subtipos: `reuniao`, `festa`, `confraternizacao`, `palestra`, `workshop`, `assembleia`, `outro`
   - Se `treino` → Lista de esportes disponíveis

**Lógica de Determinação:**
```javascript
// Para eventos gerais
if (tipoEvento === 'geral') {
  tipo = subtipo; // reuniao, festa, etc.
  esporteId = '0';
}

// Para treinos
if (tipoEvento === 'treino') {
  tipo = 'treino';
  esporteId = idDoEsporteSelecionado;
}
```

**1. Eventos Gerais (esporteId = "0"):**
- **tipo:** `reuniao`, `festa`, `confraternizacao`, `palestra`, `workshop`, `assembleia`, `outro`
- **Público:** Todos os usuários podem se inscrever

**2. Treinos de Esporte Específico:**
- **tipo:** `treino`
- **esporteId:** ID do esporte específico
- **Público:** Apenas usuários inscritos E aceitos no esporte

**Exemplos de Criação via API:**
```javascript
// Para evento geral (festa)
const formData = new FormData();
formData.append('titulo', 'Festa de Confraternização');
formData.append('descricao', 'Festa de final de ano da atlética');
formData.append('tipo', 'festa');
formData.append('esporteId', '0');
formData.append('data', '2024-12-31T20:00:00Z');
formData.append('local', 'Salão de Festas');

// Para treino de futebol
const formData = new FormData();
formData.append('titulo', 'Treino de Futebol');
formData.append('descricao', 'Treino técnico semanal');
formData.append('tipo', 'treino');
formData.append('esporteId', '123'); // ID do esporte futebol
formData.append('data', '2024-12-31T18:00:00Z');
formData.append('local', 'Campo de Futebol');
```

### 5. Atualizar Evento (Admin apenas)
```javascript
PUT /api/eventos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Evento Atualizado",
  "descricao": "Nova descrição",
  "data": "2024-12-31T18:00:00Z",
  "local": "Novo local"
}
```

### 6. Excluir Evento (Admin apenas)
```javascript
DELETE /api/eventos/:id
Authorization: Bearer <token>
```

### 7. Inscrever-se em Evento
```javascript
POST /api/eventos/:id/inscrever
Authorization: Bearer <token>
```

**⚠️ Regras de Validação e Negócio:**

**Criação de Eventos (Admin apenas):**
- Todos os campos são obrigatórios: `titulo`, `data`, `local`, `esporteId`
- Upload de foto é opcional, mas deve ser uma imagem válida
- Validação automática de arquivo: tamanho e tipo de imagem

**Inscrição em Eventos:**
- **Eventos Gerais** (`esporteId = "0"`): Qualquer usuário autenticado pode se inscrever
- **Eventos de Esporte** (`esporteId ≠ "0"`): 
  - Usuário deve estar inscrito **E aceito** no esporte específico
  - Administradores podem se inscrever em qualquer evento
- **Validações adicionais:**
  - Usuário não pode se inscrever duas vezes no mesmo evento
  - Evento deve existir e estar ativo

**Lógica de Verificação de Permissão:**
```javascript
// Pseudocódigo da validação
if (evento.esporteId !== "0" && usuario.role !== 'admin') {
  const inscricoes = await buscarInscricoesDoUsuario(usuarioId);
  const inscricaoAceita = inscricoes.find(
    inscricao => inscricao.esporteId === evento.esporteId && 
                 inscricao.status === 'aceito'
  );
  
  if (!inscricaoAceita) {
    throw new Error('Você precisa estar inscrito no esporte associado a este evento');
  }
}
```

**Estados de Inscrição em Esportes:**
- `pendente`: Aguardando aprovação do administrador
- `aceito`: Aprovado, pode se inscrever em eventos do esporte
- `rejeitado`: Rejeitado pelo administrador

**Possíveis respostas de erro:**
```json
// Erro 403 - Não inscrito no esporte
{
  "error": "Você precisa estar inscrito no esporte associado a este evento para poder se inscrever."
}

// Erro 400 - Já inscrito
{
  "error": "Usuário já está inscrito neste evento"
}

// Erro 404 - Evento não encontrado
{
  "error": "Evento não encontrado"
}

// Erro 400 - Campos obrigatórios
{
  "error": "Título, data, local e esporte são obrigatórios."
}
```

**🎯 Interface de Administração - Criação de Eventos:**

A interface de administração utiliza dropdowns em cascata para simplificar a criação de eventos:

```html
<!-- Primeiro dropdown: Tipo de evento -->
<select id="eventoTipo" onchange="mostrarSubopcoes()">
  <option value="">Selecione o tipo de evento...</option>
  <option value="geral">Geral</option>
  <option value="treino">Treino</option>
</select>

<!-- Segundo dropdown: Dinâmico baseado no primeiro -->
<select id="eventoSubtipo" style="display: none;">
  <option value="">Selecione...</option>
  <!-- Conteúdo carregado dinamicamente -->
</select>
```

**Função JavaScript para Controle de Dropdowns:**
```javascript
function mostrarSubopcoes() {
  const tipoSelect = document.getElementById('eventoTipo');
  const subtipoSelect = document.getElementById('eventoSubtipo');
  const tipoSelecionado = tipoSelect.value;
  
  subtipoSelect.innerHTML = '<option value="">Selecione...</option>';
  
  if (tipoSelecionado === 'geral') {
    subtipoSelect.style.display = 'block';
    const subtiposGerais = [
      { value: 'reuniao', text: 'Reunião' },
      { value: 'festa', text: 'Festa' },
      { value: 'confraternizacao', text: 'Confraternização' },
      { value: 'palestra', text: 'Palestra' },
      { value: 'workshop', text: 'Workshop' },
      { value: 'assembleia', text: 'Assembleia' },
      { value: 'outro', text: 'Outro' }
    ];
    
    subtiposGerais.forEach(subtipo => {
      const option = document.createElement('option');
      option.value = subtipo.value;
      option.textContent = subtipo.text;
      subtipoSelect.appendChild(option);
    });
    
  } else if (tipoSelecionado === 'treino') {
    subtipoSelect.style.display = 'block';
    carregarEsportesParaTreino(); // Carrega lista de esportes
  } else {
    subtipoSelect.style.display = 'none';
  }
}
```

### 8. Cancelar Inscrição em Evento
```javascript
DELETE /api/eventos/:id/inscrever
Authorization: Bearer <token>
```

### 9. Meus Eventos
```javascript
GET /api/eventos/minhas/inscricoes
Authorization: Bearer <token>
```

**📊 Fluxo Completo de Eventos:**

**1. Administrador cria evento:**
```javascript
// Admin seleciona no frontend:
// Dropdown 1: "Geral" ou "Treino"
// Dropdown 2: Se Geral → tipo de evento / Se Treino → esporte

// Resultado da API:
POST /api/eventos
{
  "titulo": "Festa de Confraternização",
  "tipo": "festa",           // Determinado pela seleção
  "esporteId": "0",         // "0" para geral, ID para treino
  "data": "2024-12-31T20:00:00Z",
  "local": "Salão de Festas"
}
```

**2. Usuário tenta se inscrever:**
```javascript
POST /api/eventos/:id/inscrever

// Sistema verifica:
// - Evento existe?
// - Usuário já inscrito?
// - Se evento geral (esporteId="0") → OK
// - Se evento de esporte → usuário aceito no esporte?
// - Se admin → sempre OK
```

**3. Possíveis cenários:**
- ✅ **Evento Geral**: Qualquer usuário autenticado pode se inscrever
- ✅ **Treino + Usuário Aceito**: Usuário inscrito e aceito no esporte pode se inscrever
- ✅ **Admin**: Pode se inscrever em qualquer evento
- ❌ **Treino + Usuário Não Aceito**: Erro 403
- ❌ **Usuário Já Inscrito**: Erro 400

**4. Listagem inteligente:**
```javascript
GET /api/eventos              // Todos os eventos
GET /api/eventos/esporte/0    // Apenas eventos gerais
GET /api/eventos/esporte/123  // Apenas treinos do esporte 123
```

Este sistema garante que usuários só possam se inscrever em treinos de esportes nos quais já estão aprovados, mantendo a organização e segurança do sistema de eventos esportivos.

---

## 📝 Inscrições API

### 1. Criar Inscrição em Esporte
```javascript
POST /api/inscricoes/:esporteId
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "message": "Inscrição criada com sucesso",
  "inscricao": {
    "id": 1,
    "usuarioId": 1,
    "esporteId": 1,
    "status": "pendente",
    "criadoEm": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Listar Minhas Inscrições
```javascript
GET /api/inscricoes/minhas
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "status": "aprovada",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "esporte": {
      "id": 1,
      "nome": "Futebol",
      "descricao": "Modalidade de futebol"
    }
  }
]
```

### 3. Listar Inscrições Pendentes (Admin apenas)
```javascript
GET /api/inscricoes/pendentes/:esporteId
Authorization: Bearer <token>
```

### 4. Atualizar Status da Inscrição (Admin apenas)
```javascript
PUT /api/inscricoes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "aprovada" // ou "rejeitada"
}
```

---

## 💬 Mensagens API

### 1. Listar Mensagens por Esporte
```javascript
GET /api/mensagens/:esporteId
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "conteudo": "Olá pessoal!",
    "fixada": false,
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "role": "user"
    }
  }
]
```

### 2. Criar Mensagem
```javascript
POST /api/mensagens/:esporteId
Authorization: Bearer <token>
Content-Type: application/json

{
  "conteudo": "Nova mensagem no chat!"
}
```

### 3. Editar Mensagem
```javascript
PUT /api/mensagens/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "conteudo": "Mensagem editada"
}
```

### 4. Excluir Mensagem
```javascript
DELETE /api/mensagens/:id
Authorization: Bearer <token>
```

### 5. Fixar/Desfixar Mensagem
```javascript
PATCH /api/mensagens/:id/fixar
Authorization: Bearer <token>
```

---

## 🛍️ Produtos API

### 1. Listar Produtos (Público)
```javascript
GET /api/produtos
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Camiseta do Time",
    "descricao": "Camiseta oficial da atlética",
    "preco": 45.90,
    "estoque": 25,
    "criadoEm": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Buscar Produto por ID (Público)
```javascript
GET /api/produtos/:id
```

**Resposta:**
```json
{
  "id": 1,
  "nome": "Camiseta do Time",
  "descricao": "Camiseta oficial da atlética",
  "preco": 45.90,
  "estoque": 25,
  "criadoEm": "2024-01-01T00:00:00.000Z"
}
```

### 3. Criar Produto (Admin apenas)
```javascript
POST /api/produtos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Nova Camiseta",
  "descricao": "Descrição do produto",
  "preco": 39.90,
  "estoque": 50
}
```

**Resposta:**
```json
{
  "id": 2,
  "nome": "Nova Camiseta",
  "descricao": "Descrição do produto",
  "preco": 39.90,
  "estoque": 50,
  "criadoEm": "2024-01-01T00:00:00.000Z"
}
```

### 4. Atualizar Produto (Admin apenas)
```javascript
PUT /api/produtos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Camiseta Atualizada",
  "preco": 42.90,
  "estoque": 30
}
```

### 5. Excluir Produto (Admin apenas)
```javascript
DELETE /api/produtos/:id
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "message": "Produto removido com sucesso"
}
```

---

## 🛒 Carrinho API

### 1. Adicionar Item ao Carrinho
```javascript
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentEmail": "usuario@exemplo.com",
  "produtoId": 1,
  "quantidade": 2
}
```

**Resposta:**
```json
{
  "id": 1,
  "studentEmail": "usuario@exemplo.com",
  "produtoId": 1,
  "quantidade": 2,
  "produto": {
    "id": 1,
    "nome": "Camiseta do Time",
    "preco": 45.90
  },
  "subtotal": 91.80
}
```

### 2. Listar Itens do Carrinho
```javascript
GET /api/cart?studentEmail=usuario@exemplo.com
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "studentEmail": "usuario@exemplo.com",
    "produtoId": 1,
    "quantidade": 2,
    "produto": {
      "id": 1,
      "nome": "Camiseta do Time",
      "preco": 45.90
    },
    "subtotal": 91.80
  }
]
```

### 3. Atualizar Item do Carrinho
```javascript
PUT /api/cart/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantidade": 3
}
```

### 4. Remover Item do Carrinho
```javascript
DELETE /api/cart/:id
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "message": "Item removido do carrinho"
}
```

### 5. Finalizar Compra (Checkout)
```javascript
POST /api/cart/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentEmail": "usuario@exemplo.com"
}
```

**Resposta:**
```json
{
  "id": 1,
  "studentEmail": "usuario@exemplo.com",
  "total": 91.80,
  "status": "pendente",
  "criadoEm": "2024-01-01T00:00:00.000Z",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "preco": 45.90,
      "produto": {
        "nome": "Camiseta do Time"
      }
    }
  ]
}
```

---

## 📦 Pedidos API

### 1. Listar Meus Pedidos
```javascript
GET /api/pedidos?studentEmail=usuario@exemplo.com
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "studentEmail": "usuario@exemplo.com",
    "total": 91.80,
    "status": "pendente",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "itens": [
      {
        "produtoId": 1,
        "quantidade": 2,
        "preco": 45.90,
        "produto": {
          "nome": "Camiseta do Time"
        }
      }
    ]
  }
]
```

### 2. Buscar Pedido por ID
```javascript
GET /api/pedidos/:id
Authorization: Bearer <token>
```

### 3. Processar Pagamento
```javascript
POST /api/pedidos/:id/payment
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "id": 1,
  "studentEmail": "usuario@exemplo.com",
  "total": 91.80,
  "status": "pago",
  "pagamentoEm": "2024-01-01T12:00:00.000Z"
}
```

### 4. Cancelar Pedido
```javascript
POST /api/pedidos/:id/cancel
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "id": 1,
  "studentEmail": "usuario@exemplo.com",
  "total": 91.80,
  "status": "cancelado",
  "canceladoEm": "2024-01-01T12:00:00.000Z"
}
```

### 5. Listar Todos os Pedidos (Admin apenas)
```javascript
GET /api/pedidos/admin/all
Authorization: Bearer <token>
```

---

## 🔧 Exemplo de Integração Frontend

### 1. Classe de Serviço Base

```javascript
class AtleticaHubAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.token = localStorage.getItem('atletica_token');
  }

  // Configurar headers padrão
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Método genérico para requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }
      
      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }
}
```

### 2. Serviços Específicos

```javascript
class EsportesService extends AtleticaHubAPI {
  // Listar esportes
  async listarEsportes() {
    return this.request('/api/esportes');
  }

  // Criar esporte (admin)
  async criarEsporte(formData) {
    return this.request('/api/esportes', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`
        // Não incluir Content-Type para FormData
      }
    });
  }

  // Atualizar esporte (admin)
  async atualizarEsporte(id, formData) {
    return this.request(`/api/esportes/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Excluir esporte (admin)
  async excluirEsporte(id) {
    return this.request(`/api/esportes/${id}`, {
      method: 'DELETE'
    });
  }
}

class EventosService extends AtleticaHubAPI {
  // Listar eventos (público)
  async listarEventos() {
    return this.request('/api/events', { auth: false });
  }

  // Buscar evento por ID
  async buscarEvento(id) {
    return this.request(`/api/events/${id}`, { auth: false });
  }

  // Criar evento (admin)
  async criarEvento(formData) {
    return this.request('/api/events', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Inscrever-se em evento
  async inscreverEvento(id) {
    return this.request(`/api/events/${id}/inscrever`, {
      method: 'POST'
    });
  }

  // Cancelar inscrição
  async cancelarInscricaoEvento(id) {
    return this.request(`/api/events/${id}/inscrever`, {
      method: 'DELETE'
    });
  }
  // Meus eventos
  async meusEventos() {
    return this.request('/api/events/minhas/inscricoes');
  }

  // Listar eventos por esporte
  async listarEventosPorEsporte(esporteId) {
    return this.request(`/api/events/esporte/${esporteId}`, { auth: false });
  }
}

class InscricoesService extends AtleticaHubAPI {
  // Criar inscrição
  async criarInscricao(esporteId) {
    return this.request(`/api/inscricoes/${esporteId}`, {
      method: 'POST'
    });
  }

  // Minhas inscrições
  async minhasInscricoes() {
    return this.request('/api/inscricoes/minhas');
  }

  // Listar pendentes (admin)
  async listarPendentes(esporteId) {
    return this.request(`/api/inscricoes/pendentes/${esporteId}`);
  }

  // Atualizar status (admin)
  async atualizarStatus(id, status) {
    return this.request(`/api/inscricoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

class MensagensService extends AtleticaHubAPI {
  // Listar mensagens
  async listarMensagens(esporteId) {
    return this.request(`/api/mensagens/${esporteId}`);
  }

  // Criar mensagem
  async criarMensagem(esporteId, conteudo) {
    return this.request(`/api/mensagens/${esporteId}`, {
      method: 'POST',
      body: JSON.stringify({ conteudo })
    });
  }

  // Editar mensagem
  async editarMensagem(id, conteudo) {
    return this.request(`/api/mensagens/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ conteudo })
    });
  }

  // Excluir mensagem
  async excluirMensagem(id) {
    return this.request(`/api/mensagens/${id}`, {
      method: 'DELETE'
    });
  }

  // Fixar mensagem
  async fixarMensagem(id) {
    return this.request(`/api/mensagens/${id}/fixar`, {
      method: 'PATCH'
    });
  }
}

class ProdutosService extends AtleticaHubAPI {
  // Listar produtos
  async listarProdutos() {
    return this.request('/api/produtos', { auth: false });
  }

  // Buscar produto por ID
  async buscarProduto(id) {
    return this.request(`/api/produtos/${id}`, { auth: false });
  }

  // Criar produto (admin)
  async criarProduto(dados) {
    return this.request('/api/produtos', {
      method: 'POST',
      body: JSON.stringify(dados),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Atualizar produto (admin)
  async atualizarProduto(id, dados) {
    return this.request(`/api/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Excluir produto (admin)
  async excluirProduto(id) {
    return this.request(`/api/produtos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}

class CarrinhoService extends AtleticaHubAPI {
  // Adicionar item ao carrinho
  async adicionarAoCarrinho(produtoId, quantidade) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ produtoId, quantidade }),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Listar itens do carrinho
  async listarItensCarrinho() {
    return this.request(`/api/cart?studentEmail=${encodeURIComponent(this.token)}`);
  }

  // Atualizar item do carrinho
  async atualizarItemCarrinho(id, quantidade) {
    return this.request(`/api/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantidade }),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Remover item do carrinho
  async removerItemCarrinho(id) {
    return this.request(`/api/cart/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Finalizar compra
  async finalizarCompra() {
    return this.request('/api/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ studentEmail: this.token }),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}

class PedidosService extends AtleticaHubAPI {
  // Listar meus pedidos
  async listarMeusPedidos() {
    return this.request(`/api/pedidos?studentEmail=${encodeURIComponent(this.token)}`);
  }

  // Buscar pedido por ID
  async buscarPedido(id) {
    return this.request(`/api/pedidos/${id}`);
  }

  // Processar pagamento
  async processarPagamento(id) {
    return this.request(`/api/pedidos/${id}/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Cancelar pedido
  async cancelarPedido(id) {
    return this.request(`/api/pedidos/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Listar todos os pedidos (admin)
  async listarTodosPedidos() {
    return this.request('/api/pedidos/admin/all', {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}
```

### 3. Exemplo de Uso

```javascript
// Inicializar serviços
const esportesService = new EsportesService();
const eventosService = new EventosService();
const inscricoesService = new InscricoesService();
const mensagensService = new MensagensService();
const produtosService = new ProdutosService();
const carrinhoService = new CarrinhoService();
const pedidosService = new PedidosService();

// Exemplo: Listar esportes e criar inscrição
async function exemploUso() {
  try {
    // Listar esportes
    const esportes = await esportesService.listarEsportes();
    console.log('Esportes disponíveis:', esportes);

    // Inscrever-se no primeiro esporte
    if (esportes.length > 0) {
      const inscricao = await inscricoesService.criarInscricao(esportes[0].id);
      console.log('Inscrição criada:', inscricao);
    }

    // Listar eventos
    const eventos = await eventosService.listarEventos();
    console.log('Eventos disponíveis:', eventos);

    // Listar mensagens de um esporte
    if (esportes.length > 0) {
      const mensagens = await mensagensService.listarMensagens(esportes[0].id);
      console.log('Mensagens do esporte:', mensagens);
    }

    // Listar produtos
    const produtos = await produtosService.listarProdutos();
    console.log('Produtos disponíveis:', produtos);

    // Adicionar produto ao carrinho
    if (produtos.length > 0) {
      const carrinho = await carrinhoService.adicionarAoCarrinho(produtos[0].id, 2);
      console.log('Produto adicionado ao carrinho:', carrinho);
    }

    // Listar pedidos
    const pedidos = await pedidosService.listarMeusPedidos();
    console.log('Meus pedidos:', pedidos);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}
```

---

## 🔒 Permissões e Roles

### Usuário Regular (role: "user")
- ✅ Listar esportes e eventos
- ✅ Criar inscrições em esportes
- ✅ Inscrever-se em eventos
- ✅ Enviar mensagens
- ✅ Ver suas próprias inscrições
- ❌ Criar/editar/excluir esportes ou eventos
- ❌ Aprovar/rejeitar inscrições
- ❌ Acessar dados de outros usuários
- ❌ Acessar painel administrativo

### Administrador (role: "admin")
- ✅ Todas as permissões de usuário regular
- ✅ CRUD completo de esportes
- ✅ CRUD completo de eventos
- ✅ Aprovar/rejeitar inscrições
- ✅ Ver inscrições pendentes
- ✅ Fixar mensagens
- ✅ CRUD completo de produtos
- ✅ Acessar todos os pedidos
- ✅ Processar pagamentos
- ✅ Cancelar pedidos
- ✅ Acessar painel administrativo

---

## 📋 Status de Resposta HTTP

- **200**: Sucesso
- **201**: Recurso criado
- **400**: Dados inválidos
- **401**: Não autenticado
- **403**: Sem permissão (role insuficiente)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

---

## 🔄 Fluxo de Trabalho Típico

### Para Usuários:
1. Fazer login com Firebase
2. Listar esportes disponíveis
3. Criar inscrição em esporte(s) de interesse
4. Aguardar aprovação da inscrição
5. Participar do chat do esporte
6. Ver e inscrever-se em eventos
7. Navegar na loja e adicionar produtos ao carrinho
8. Finalizar compra e acompanhar pedidos

### Para Administradores:
1. Fazer login com Firebase
2. Criar/gerenciar esportes
3. Criar/gerenciar eventos
4. Aprovar/rejeitar inscrições pendentes
5. Moderar mensagens (fixar importantes)
6. Gerenciar produtos (CRUD)
7. Acompanhar e gerenciar pedidos
8. Processar pagamentos e cancelar pedidos se necessário

---

## ⚠️ Observações Importantes

1. **Upload de Imagens**: Esportes e eventos aceitam upload de fotos via FormData
2. **CORS**: Sistema configurado para aceitar requisições do frontend
3. **Auto-criação de Usuários**: Usuários são criados automaticamente no primeiro login
4. **Validação Dupla**: Firebase + JWT próprio para maior segurança
5. **Base64**: Imagens são retornadas em formato base64 nas consultas
6. **Chat em Tempo Real**: Considere implementar WebSocket para mensagens em tempo real

Este documento serve como guia completo para integração frontend com a API do AtleticaHub.
