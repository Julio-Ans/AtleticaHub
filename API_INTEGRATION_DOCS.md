# AtleticaHub - Documentação Completa da API

## 📚 Índice
- [Visão Geral](#visão-geral)
- [🔐 Autenticação](#-autenticação)
- [🏃‍♀️ Esportes](#️-esportes)
- [📅 Eventos](#-eventos)
- [📝 Inscrições](#-inscrições)
- [💬 Mensagens](#-mensagens)
- [🛍️ Produtos](#️-produtos)
- [🛒 Carrinho](#-carrinho)
- [📋 Pedidos](#-pedidos)
- [🔧 Configurações e Middlewares](#-configurações-e-middlewares)
- [🚨 Códigos de Erro](#-códigos-de-erro)

## Visão Geral

A API do AtleticaHub é um sistema completo de gerenciamento esportivo e e-commerce desenvolvido com **Node.js**, **Express**, **Prisma ORM**, **MongoDB** (para eventos) e **Firebase Authentication**.

### 🏗️ Arquitetura
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL (via Prisma) + MongoDB (eventos/mensagens)
- **Autenticação**: Firebase Authentication + JWT
- **Upload de Arquivos**: Google Cloud Storage
- **Arquitetura**: Clean Architecture em camadas (Routes → Controllers → Services → Repositories)

### 🎯 Funcionalidades Principais
- **Sistema de Esportes**: Gerenciamento completo de modalidades esportivas
- **Eventos Dinâmicos**: Treinos específicos por esporte e eventos gerais
- **E-commerce Integrado**: Loja com carrinho e sistema de pedidos
- **Chat por Esporte**: Mensagens organizadas por modalidade
- **Sistema de Permissões**: Diferentes níveis de acesso (admin/user)
- **Upload de Imagens**: Suporte a fotos para esportes, eventos e produtos

### 🌐 URL Base
```
http://localhost:3000
```

### 🔑 Autenticação
Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

### 🔧 Tecnologias Utilizadas
- **Express**: Framework web
- **Prisma**: ORM para PostgreSQL
- **Mongoose**: ODM para MongoDB
- **Firebase Admin**: Autenticação e validação
- **Google Cloud Storage**: Upload de arquivos
- **Multer**: Middleware para upload
- **JWT**: Tokens de autenticação
- **Swagger**: Documentação automática

---

## 🔐 Autenticação

### 🎯 Sistema Híbrido
O AtleticaHub utiliza **Firebase Authentication** integrado com **sistema próprio de usuários**, garantindo segurança e flexibilidade.

#### 🔄 Fluxo de Autenticação
1. **Frontend**: Login via Firebase
2. **Backend**: Validação do token Firebase
3. **Sistema**: Geração de JWT próprio
4. **Banco**: Sincronização com tabela de usuários

### 📡 Endpoints

#### 1. Configuração Firebase
```http
GET /config/firebase
```

**Descrição**: Retorna configurações públicas do Firebase para inicialização no frontend.

**Resposta de Sucesso (200)**:
```json
{
  "apiKey": "sua-api-key",
  "authDomain": "seu-domain.firebaseapp.com",
  "projectId": "seu-project-id",
  "storageBucket": "seu-bucket.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}
```

#### 2. Login/Registro
```http
POST /auth/login
Content-Type: application/json
```

**Body**:
```json
{
  "idToken": "firebase-id-token-here",
  "email": "usuario@exemplo.com",
  "displayName": "Nome do Usuário"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt-token-do-sistema",
  "user": {
    "id": "firebase-uid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "role": "user",
    "dataNascimento": "1990-01-01T00:00:00.000Z",
    "telefone": "+5511999999999",
    "curso": "Engenharia",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "error": "Token Firebase inválido"
}
```

#### 3. Verificação de Token
```http
GET /auth/verify
Authorization: Bearer <jwt-token>
```

**Resposta de Sucesso (200)**:
```json
{
  "valid": true,
  "user": {
    "uid": "firebase-uid",
    "email": "usuario@exemplo.com",
    "role": "user"
  }
}
```

#### 4. Verificação de Usuário
```http
GET /auth/verify-user
Authorization: Bearer <jwt-token>
```

**Descrição**: Verifica se o token pertence a um usuário válido.

#### 5. Verificação de Admin
```http
GET /auth/verify-admin
Authorization: Bearer <jwt-token>
```

**Descrição**: Verifica se o token pertence a um administrador.

**Resposta de Erro (403)**:
```json
{
  "error": "Acesso negado. Requer privilégios de administrador."
}
```

### 🔒 Níveis de Permissão

| Papel | Descrição | Permissões |
|-------|-----------|------------|
| `user` | Usuário padrão | Visualizar, inscrever-se, comprar |
| `admin` | Administrador | Todas as permissões + CRUD completo |

### 🛡️ Middlewares de Segurança

#### verificarToken
- Valida JWT em rotas protegidas
- Adiciona `req.user` com dados do usuário

#### checkRole('admin')
- Verifica se usuário é administrador
- Usado em rotas administrativas

### 💡 Exemplo de Implementação (JavaScript)

```javascript
// Inicialização Firebase (Frontend)
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = await fetch('/config/firebase').then(r => r.json());
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
try {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  
  // Enviar para backend
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
} catch (error) {
  console.error('Erro no login:', error);
}
```

---

## 🏃‍♀️ Esportes

### 🎯 Sistema de Modalidades Esportivas
Gerenciamento completo de esportes com sistema de inscrições e aprovações.

### 📡 Endpoints

#### 1. Listar Todos os Esportes
```http
GET /api/esportes
Authorization: Bearer <jwt-token>
```

**Descrição**: Lista todos os esportes disponíveis com informações de inscrições.

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nome": "Futebol",
    "fotoUrl": "https://storage.googleapis.com/bucket/esportes/futebol.jpg",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "inscricoes": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "status": "aceito",
        "criadaEm": "2024-01-15T00:00:00.000Z",
        "usuario": {
          "nome": "João Silva",
          "email": "joao@exemplo.com"
        }
      }
    ]
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "nome": "Basquete",
    "fotoUrl": "https://storage.googleapis.com/bucket/esportes/basquete.jpg",
    "criadoEm": "2024-01-02T00:00:00.000Z",
    "inscricoes": []
  }
]
```

#### 2. Buscar Esporte por ID
```http
GET /api/esportes/:id
Authorization: Bearer <jwt-token>
```

**Parâmetros**:
- `id` (string): UUID do esporte

**Resposta de Sucesso (200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "nome": "Futebol",
  "fotoUrl": "https://storage.googleapis.com/bucket/esportes/futebol.jpg",
  "criadoEm": "2024-01-01T00:00:00.000Z",
  "inscricoes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "status": "aceito",
      "usuario": {
        "nome": "João Silva"
      }
    }
  ]
}
```

#### 3. Criar Esporte
```http
POST /api/esportes
Authorization: Bearer <jwt-token> (Admin)
Content-Type: multipart/form-data
```

**Campos do FormData**:
```
nome: "Vôlei"
foto: [arquivo-imagem.jpg] (opcional)
```

**Validações**:
- Nome é obrigatório e deve ser único
- Foto deve ser imagem válida (JPG, PNG, GIF)
- Tamanho máximo: 5MB
- Apenas administradores podem criar

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Esporte criado com sucesso",
  "esporte": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "nome": "Vôlei",
    "fotoUrl": "https://storage.googleapis.com/bucket/esportes/volei.jpg",
    "criadoEm": "2024-01-10T00:00:00.000Z"
  }
}
```

#### 4. Atualizar Esporte
```http
PUT /api/esportes/:id
Authorization: Bearer <jwt-token> (Admin)
Content-Type: multipart/form-data
```

**Campos do FormData**:
```
nome: "Vôlei de Praia" (opcional)
foto: [nova-imagem.jpg] (opcional)
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Esporte atualizado com sucesso",
  "esporte": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "nome": "Vôlei de Praia",
    "fotoUrl": "https://storage.googleapis.com/bucket/esportes/volei-praia.jpg",
    "criadoEm": "2024-01-10T00:00:00.000Z"
  }
}
```

#### 5. Excluir Esporte
```http
DELETE /api/esportes/:id
Authorization: Bearer <jwt-token> (Admin)
```

**Validações**:
- Verifica se existem inscrições ativas
- Verifica se existem eventos associados
- Apenas administradores podem excluir

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Esporte excluído com sucesso"
}
```

**Resposta de Erro (400)**:
```json
{
  "error": "Não é possível excluir esporte com inscrições ativas"
}
```

### 🔧 Regras de Negócio

#### Criação de Esportes
- ✅ Apenas administradores
- ✅ Nome único obrigatório
- ✅ Upload de foto opcional
- ✅ Validação de tipo de arquivo
- ✅ Redimensionamento automático

#### Sistema de Inscrições
- 📝 Usuários se inscrevem via `/api/inscricoes/:esporteId`
- ⏳ Status inicial: `pendente`
- ✅ Admin aprova: `aceito`
- ❌ Admin rejeita: `rejeitado`
- 🎯 Apenas usuários aceitos podem participar de treinos

### 💡 Exemplo de Uso (JavaScript)

```javascript
// Listar esportes
const esportes = await fetch('/api/esportes', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Criar esporte (Admin)
const formData = new FormData();
formData.append('nome', 'Tênis');
formData.append('foto', fileInput.files[0]);

const novoEsporte = await fetch('/api/esportes', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
}).then(r => r.json());

// Atualizar esporte
const formDataUpdate = new FormData();
formDataUpdate.append('nome', 'Tênis de Mesa');

await fetch(`/api/esportes/${esporteId}`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formDataUpdate
});
```

---

## 📅 Eventos

### 🎯 Sistema Inteligente de Eventos
Sistema avançado que diferencia **eventos gerais** (abertos a todos) de **treinos específicos** (por esporte) com controle de permissões.

### 🏗️ Tipos de Eventos

#### 1. **Eventos Gerais** (esporteId = "0")
- **Público**: Todos os usuários autenticados
- **Tipos**: `reuniao`, `festa`, `confraternizacao`, `palestra`, `workshop`, `assembleia`, `outro`
- **Acesso**: Qualquer usuário pode se inscrever

#### 2. **Treinos de Esporte** (esporteId ≠ "0")
- **Público**: Usuários inscritos E aceitos no esporte específico
- **Tipos**: `treino`
- **Acesso**: Requer inscrição aprovada no esporte + Admins sempre podem

### 📡 Endpoints

#### 1. Listar Todos os Eventos (Público)
```http
GET /api/eventos
```

**Descrição**: Lista todos os eventos públicos, sem autenticação necessária.

**Resposta de Sucesso (200)**:
```json
[
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e1",
    "titulo": "Treino de Futebol",
    "descricao": "Treino técnico semanal",
    "tipo": "treino",
    "data": "2024-12-31T18:00:00.000Z",
    "local": "Campo Principal",
    "esporteId": "550e8400-e29b-41d4-a716-446655440001",
    "criadorId": "firebase-admin-uid",
    "fotoUrl": "https://storage.googleapis.com/bucket/eventos/treino-futebol.jpg",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "inscricoes": [
      {
        "usuarioId": "firebase-user-uid",
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "dataInscricao": "2024-01-15T00:00:00.000Z"
      }
    ]
  },
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e2",
    "titulo": "Festa de Confraternização",
    "descricao": "Festa de final de ano da atlética",
    "tipo": "festa",
    "data": "2024-12-31T20:00:00.000Z",
    "local": "Salão de Festas",
    "esporteId": "0",
    "criadorId": "firebase-admin-uid",
    "fotoUrl": "https://storage.googleapis.com/bucket/eventos/festa.jpg",
    "criadoEm": "2024-01-01T00:00:00.000Z",
    "inscricoes": []
  }
]
```

#### 2. Listar Eventos Permitidos para Usuário
```http
GET /api/eventos/permitidos
Authorization: Bearer <jwt-token>
```

**Descrição**: Lista apenas eventos que o usuário pode se inscrever baseado em suas permissões.

**Lógica de Filtro**:
- **Admin**: Vê todos os eventos
- **User**: Vê eventos gerais + treinos dos esportes onde está aceito

#### 3. Listar Eventos por Esporte
```http
GET /api/eventos/esporte/:esporteId
```

**Parâmetros**:
- `esporteId` (string): UUID do esporte ou "0" para eventos gerais

**Exemplos**:
```http
GET /api/eventos/esporte/550e8400-e29b-41d4-a716-446655440001  # Eventos do futebol
GET /api/eventos/esporte/0  # Eventos gerais
```

#### 4. Buscar Evento por ID
```http
GET /api/eventos/:id
```

**Parâmetros**:
- `id` (string): ObjectId do evento MongoDB

#### 5. Criar Evento
```http
POST /api/eventos
Authorization: Bearer <jwt-token> (Admin)
Content-Type: multipart/form-data
```

**Campos do FormData**:
```
titulo: "Novo Evento"
descricao: "Descrição detalhada do evento"
tipo: "festa" | "treino" | "reuniao" | "confraternizacao" | "palestra" | "workshop" | "assembleia" | "outro"
data: "2024-12-31T18:00:00.000Z"
local: "Local do evento"
esporteId: "0" | "uuid-do-esporte"
foto: [arquivo-imagem.jpg] (opcional)
```

**Validações**:
- ✅ Todos os campos obrigatórios: `titulo`, `data`, `local`, `esporteId`
- ✅ Data deve ser futura
- ✅ EsporteId deve existir ou ser "0"
- ✅ Foto opcional (validação de tipo e tamanho)
- ✅ Apenas administradores podem criar

**Resposta de Sucesso (201)**:
```json
{
  "_id": "60f1b2a3c4e5f6a7b8c9d0e3",
  "titulo": "Novo Evento",
  "descricao": "Descrição detalhada do evento",
  "tipo": "festa",
  "data": "2024-12-31T18:00:00.000Z",
  "local": "Local do evento",
  "esporteId": "0",
  "criadorId": "firebase-admin-uid",
  "fotoUrl": "https://storage.googleapis.com/bucket/eventos/novo-evento.jpg",
  "criadoEm": "2024-01-10T00:00:00.000Z",
  "inscricoes": []
}
```

#### 6. Atualizar Evento
```http
PUT /api/eventos/:id
Authorization: Bearer <jwt-token> (Admin)
Content-Type: application/json
```

**Body**:
```json
{
  "titulo": "Evento Atualizado",
  "descricao": "Nova descrição",
  "data": "2024-12-31T19:00:00.000Z",
  "local": "Novo local"
}
```

#### 7. Excluir Evento
```http
DELETE /api/eventos/:id
Authorization: Bearer <jwt-token> (Admin)
```

**Validações**:
- ✅ Verifica se evento existe
- ✅ Remove inscrições associadas
- ✅ Apenas administradores podem excluir

#### 8. Inscrever-se em Evento
```http
POST /api/eventos/:id/inscrever
Authorization: Bearer <jwt-token>
```

**Validações Avançadas**:
- ✅ Evento deve existir
- ✅ Usuário não pode estar já inscrito
- ✅ **Para eventos gerais**: Qualquer usuário autenticado
- ✅ **Para treinos**: Usuário deve estar aceito no esporte OU ser admin

**Resposta de Sucesso (201)**:
```json
{
  "message": "Inscrição realizada com sucesso"
}
```

**Resposta de Erro (403)**:
```json
{
  "error": "Você precisa estar inscrito no esporte associado a este evento para poder se inscrever."
}
```

#### 9. Cancelar Inscrição
```http
DELETE /api/eventos/:id/inscrever
Authorization: Bearer <jwt-token>
```

#### 10. Meus Eventos (Usuário)
```http
GET /api/eventos/minhas/inscricoes
Authorization: Bearer <jwt-token>
```

**Descrição**: Lista eventos em que o usuário está inscrito.

### 🧠 Lógica de Validação de Permissões

```javascript
// Pseudocódigo da validação de inscrição
async function validarInscricaoEvento(usuario, evento) {
  // Se for evento geral, libera para qualquer usuário
  if (evento.esporteId === "0") {
    return true;
  }
  
  // Se for admin, libera para qualquer evento
  if (usuario.role === 'admin') {
    return true;
  }
  
  // Para treinos, verifica se usuário está aceito no esporte
  const inscricoes = await buscarInscricoesUsuario(usuario.uid);
  const inscricaoAceita = inscricoes.find(
    inscricao => 
      inscricao.esporteId === evento.esporteId && 
      inscricao.status === 'aceito'
  );
  
  if (!inscricaoAceita) {
    throw new Error('Você precisa estar inscrito no esporte associado a este evento');
  }
  
  return true;
}
```

### 🎨 Interface de Criação (Frontend)

```html
<!-- Dropdowns em cascata para criação -->
<select id="tipoEvento" onchange="atualizarSubtipo()">
  <option value="">Selecione o tipo...</option>
  <option value="geral">Evento Geral</option>
  <option value="treino">Treino de Esporte</option>
</select>

<select id="subtipo" style="display: none;">
  <!-- Carregado dinamicamente via JavaScript -->
</select>
```

```javascript
function atualizarSubtipo() {
  const tipo = document.getElementById('tipoEvento').value;
  const subtipo = document.getElementById('subtipo');
  
  if (tipo === 'geral') {
    subtipo.innerHTML = `
      <option value="festa">Festa</option>
      <option value="reuniao">Reunião</option>
      <option value="confraternizacao">Confraternização</option>
      <option value="palestra">Palestra</option>
      <option value="workshop">Workshop</option>
      <option value="assembleia">Assembleia</option>
      <option value="outro">Outro</option>
    `;
    subtipo.style.display = 'block';
  } else if (tipo === 'treino') {
    // Carregar lista de esportes via API
    carregarEsportes(subtipo);
  }
}
```

### 💡 Exemplos de Uso

```javascript
// Criar evento geral
const formData = new FormData();
formData.append('titulo', 'Festa de Confraternização');
formData.append('descricao', 'Festa de final de ano');
formData.append('tipo', 'festa');
formData.append('esporteId', '0');
formData.append('data', '2024-12-31T20:00:00.000Z');
formData.append('local', 'Salão de Festas');
formData.append('foto', fotoFile);

const evento = await fetch('/api/eventos', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
});

// Inscrever-se em evento
await fetch(`/api/eventos/${eventoId}/inscrever`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${userToken}` }
});

// Listar eventos permitidos
const eventosPermitidos = await fetch('/api/eventos/permitidos', {
  headers: { 'Authorization': `Bearer ${userToken}` }
}).then(r => r.json());
```
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

## 📝 Inscrições

### 🎯 Sistema de Inscrições em Esportes
Gerenciamento de participação dos usuários em modalidades esportivas com sistema de aprovação administrativa.

### 📡 Endpoints

#### 1. Inscrever-se em Esporte
```http
POST /api/inscricoes/:esporteId
Authorization: Bearer <jwt-token>
```

**Parâmetros**:
- `esporteId` (string): UUID do esporte

**Validações**:
- ✅ Esporte deve existir
- ✅ Usuário não pode se inscrever no "Geral" (esporteId = "0")
- ✅ Usuário não pode ter inscrição duplicada
- ✅ Status inicial: `pendente`

**Resposta de Sucesso (201)**:
```json
{
  "inscricao": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "usuarioId": "firebase-user-uid",
    "esporteId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pendente",
    "criadaEm": "2024-01-15T00:00:00.000Z"
  },
  "message": "Inscrição enviada com sucesso! Aguardando aprovação."
}
```

#### 2. Listar Minhas Inscrições
```http
GET /api/inscricoes/minhas
Authorization: Bearer <jwt-token>
```

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "status": "aceito",
    "criadaEm": "2024-01-15T00:00:00.000Z",
    "esporte": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nome": "Futebol",
      "fotoUrl": "https://storage.googleapis.com/bucket/futebol.jpg"
    }
  }
]
```

#### 3. Listar Todas as Inscrições (Admin)
```http
GET /api/inscricoes
Authorization: Bearer <jwt-token> (Admin)
```

**Query Parameters**:
- `status` (opcional): `pendente`, `aceito`, `rejeitado`
- `esporteId` (opcional): Filtrar por esporte

**Exemplo**:
```http
GET /api/inscricoes?status=pendente&esporteId=550e8400-e29b-41d4-a716-446655440001
```

#### 4. Gerenciar Inscrição (Admin)
```http
PUT /api/inscricoes/:id/status
Authorization: Bearer <jwt-token> (Admin)
Content-Type: application/json
```

**Body**:
```json
{
  "status": "aceito" | "rejeitado"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "message": "Status da inscrição atualizado com sucesso",
  "inscricao": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "status": "aceito",
    "usuario": {
      "nome": "João Silva",
      "email": "joao@exemplo.com"
    },
    "esporte": {
      "nome": "Futebol"
    }
  }
}
```

### 🔧 Estados da Inscrição

| Status | Descrição | Permissões |
|--------|-----------|------------|
| `pendente` | Aguardando aprovação | Não pode participar de treinos |
| `aceito` | Aprovado pelo admin | Pode participar de treinos do esporte |
| `rejeitado` | Rejeitado pelo admin | Não pode participar |

---

## 💬 Mensagens

### 🎯 Sistema de Chat por Esporte
Chat organizado por modalidades esportivas com mensagens em tempo real.

### 📡 Endpoints

#### 1. Listar Mensagens por Esporte
```http
GET /api/mensagens/:esporteId
Authorization: Bearer <jwt-token>
```

**Parâmetros**:
- `esporteId` (string): UUID do esporte ou "0" para chat geral

**Query Parameters**:
- `limit` (opcional): Número de mensagens (padrão: 50)
- `offset` (opcional): Paginação (padrão: 0)

**Resposta de Sucesso (200)**:
```json
[
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e5",
    "texto": "Pessoal, treino hoje às 18h!",
    "usuarioId": "firebase-user-uid",
    "nomeUsuario": "João Silva",
    "esporteId": "550e8400-e29b-41d4-a716-446655440001",
    "criadaEm": "2024-01-15T15:30:00.000Z"
  },
  {
    "_id": "60f1b2a3c4e5f6a7b8c9d0e6",
    "texto": "Confirmo presença!",
    "usuarioId": "firebase-user-uid-2",
    "nomeUsuario": "Maria Santos",
    "esporteId": "550e8400-e29b-41d4-a716-446655440001",
    "criadaEm": "2024-01-15T15:35:00.000Z"
  }
]
```

#### 2. Enviar Mensagem
```http
POST /api/mensagens
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body**:
```json
{
  "texto": "Mensagem a ser enviada",
  "esporteId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Validações**:
- ✅ Texto obrigatório (1-500 caracteres)
- ✅ EsporteId deve existir ou ser "0"
- ✅ Usuário deve estar inscrito no esporte (exceto chat geral e admins)

**Resposta de Sucesso (201)**:
```json
{
  "_id": "60f1b2a3c4e5f6a7b8c9d0e7",
  "texto": "Mensagem a ser enviada",
  "usuarioId": "firebase-user-uid",
  "nomeUsuario": "João Silva",
  "esporteId": "550e8400-e29b-41d4-a716-446655440001",
  "criadaEm": "2024-01-15T16:00:00.000Z"
}
```

#### 3. Excluir Mensagem
```http
DELETE /api/mensagens/:id
Authorization: Bearer <jwt-token>
```

**Validações**:
- ✅ Usuário só pode excluir próprias mensagens
- ✅ Admins podem excluir qualquer mensagem

---

## 🛍️ Produtos

### 🎯 Sistema de E-commerce
Loja integrada com gerenciamento completo de produtos, estoque e vendas.

### 📡 Endpoints

#### 1. Listar Produtos (Público)
```http
GET /api/produtos
```

**Query Parameters**:
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Busca por nome/descrição

**Resposta de Sucesso (200)**:
```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Camiseta Atlética",
      "descricao": "Camiseta oficial da atlética universitária",
      "preco": 45.99,
      "estoque": 25,
      "imagemUrl": "https://storage.googleapis.com/bucket/produtos/camiseta.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

#### 2. Buscar Produto por ID
```http
GET /api/produtos/:id
```

#### 3. Criar Produto (Admin)
```http
POST /api/produtos
Authorization: Bearer <jwt-token> (Admin)
Content-Type: multipart/form-data
```

**Campos do FormData**:
```
nome: "Novo Produto"
descricao: "Descrição detalhada"
preco: "29.99"
estoque: "50"
imagem: [arquivo-imagem.jpg] (opcional)
```

**Validações**:
- ✅ Nome obrigatório (até 200 caracteres)
- ✅ Preço obrigatório (> 0)
- ✅ Estoque obrigatório (≥ 0)
- ✅ Imagem opcional (validação de tipo e tamanho)

#### 4. Atualizar Produto (Admin)
```http
PUT /api/produtos/:id
Authorization: Bearer <jwt-token> (Admin)
Content-Type: multipart/form-data
```

#### 5. Excluir Produto (Admin)
```http
DELETE /api/produtos/:id
Authorization: Bearer <jwt-token> (Admin)
```

---

## 🛒 Carrinho

### 🎯 Sistema de Carrinho de Compras
Gerenciamento de itens para compra com validações de estoque em tempo real.

### 📡 Endpoints

#### 1. Listar Itens do Carrinho
```http
GET /api/cart
Authorization: Bearer <jwt-token>
```

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "studentEmail": "usuario@exemplo.com",
    "quantidade": 2,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "produto": {
      "id": 1,
      "nome": "Camiseta Atlética",
      "preco": 45.99,
      "estoque": 25,
      "imagemUrl": "https://storage.googleapis.com/bucket/produtos/camiseta.jpg"
    }
  }
]
```

#### 2. Adicionar Item ao Carrinho
```http
POST /api/cart
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body**:
```json
{
  "produtoId": 1,
  "quantidade": 2
}
```

**Validações**:
- ✅ Produto deve existir
- ✅ Quantidade deve ser > 0
- ✅ Estoque suficiente
- ✅ Se item já existe, soma a quantidade

**Resposta de Sucesso (201)**:
```json
{
  "id": 1,
  "studentEmail": "usuario@exemplo.com",
  "produtoId": 1,
  "quantidade": 2,
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

#### 3. Atualizar Quantidade
```http
PUT /api/cart/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body**:
```json
{
  "quantidade": 3
}
```

#### 4. Remover Item
```http
DELETE /api/cart/:id
Authorization: Bearer <jwt-token>
```

#### 5. Finalizar Pedido
```http
POST /api/cart/finalizar
Authorization: Bearer <jwt-token>
```

**Validações**:
- ✅ Carrinho não pode estar vazio
- ✅ Valida estoque de todos os itens
- ✅ Calcula total automaticamente
- ✅ Atualiza estoque dos produtos
- ✅ Limpa carrinho após sucesso

**Resposta de Sucesso (201)**:
```json
{
  "id": 1,
  "usuarioId": "firebase-user-uid",
  "total": 91.98,
  "status": "pendente",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "produtos": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "produto": {
        "nome": "Camiseta Atlética",
        "preco": 45.99
      }
    }
  ]
}
```

#### 6. Limpar Carrinho
```http
DELETE /api/cart
Authorization: Bearer <jwt-token>
```

---

## 📋 Pedidos

### 🎯 Sistema de Gerenciamento de Pedidos
Controle completo de vendas com diferentes status e histórico.

### 📡 Endpoints

#### 1. Listar Meus Pedidos
```http
GET /api/pedidos/usuario
Authorization: Bearer <jwt-token>
```

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "usuarioId": "firebase-user-uid",
    "total": 91.98,
    "status": "pendente",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "produtos": [
      {
        "id": 1,
        "quantidade": 2,
        "produto": {
          "id": 1,
          "nome": "Camiseta Atlética",
          "preco": 45.99,
          "imagemUrl": "https://storage.googleapis.com/bucket/produtos/camiseta.jpg"
        }
      }
    ]
  }
]
```

#### 2. Listar Todos os Pedidos (Admin)
```http
GET /api/pedidos
Authorization: Bearer <jwt-token> (Admin)
```

**Query Parameters**:
- `status` (opcional): `pendente`, `processando`, `enviado`, `entregue`, `cancelado`
- `page` (opcional): Paginação
- `limit` (opcional): Itens por página

#### 3. Buscar Pedido por ID
```http
GET /api/pedidos/:id
Authorization: Bearer <jwt-token>
```

**Validações**:
- ✅ Usuários só veem próprios pedidos
- ✅ Admins veem qualquer pedido

#### 4. Atualizar Status do Pedido (Admin)
```http
PATCH /api/pedidos/admin/:id/status
Authorization: Bearer <jwt-token> (Admin)
Content-Type: application/json
```

**Body**:
```json
{
  "status": "pendente" | "processando" | "entregue" | "cancelado"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "status": "processando",
  "total": 91.98,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

#### 5. Listar Pedidos Recentes (Admin)
```http
GET /api/pedidos/admin/recentes
Authorization: Bearer <jwt-token> (Admin)
```

**Resposta de Sucesso (200)**:
```json
{
  "pedidos": [
    {
      "id": 1,
      "usuarioId": "firebase-user-uid",
      "usuario": {
        "nome": "João Silva",
        "telefone": "+5511999999999"
      },
      "total": 91.98,
      "status": "pendente",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "produtos": [
        {
          "id": 1,
          "quantidade": 2,
          "produto": {
            "nome": "Camiseta Atlética",
            "preco": 45.99
          }
        }
      ]
    }
  ]
}
```

#### 6. Obter Estatísticas da Loja (Admin)
```http
GET /api/pedidos/admin/estatisticas
Authorization: Bearer <jwt-token> (Admin)
```

**Resposta de Sucesso (200)**:
```json
{
  "totalPedidos": 150,
  "vendasMes": 4875.50
}
```

#### 7. Relatório de Vendas por Produto (Admin)
```http
GET /api/pedidos/admin/relatorio-vendas
Authorization: Bearer <jwt-token> (Admin)
```

**Resposta de Sucesso (200)**:
```json
{
  "relatorio": [
    {
      "produtoId": 1,
      "nome": "Camiseta Atlética",
      "totalVendido": 45,
      "totalPedidos": 23,
      "receita": 2069.55
    },
    {
      "produtoId": 2,
      "nome": "Bermuda Esportiva",
      "totalVendido": 32,
      "totalPedidos": 18,
      "receita": 1599.68
    }
  ]
}
```

#### 8. Excluir Pedido (Admin)
```http
DELETE /api/pedidos/admin/:id
Authorization: Bearer <jwt-token> (Admin)
```

**Resposta de Sucesso (200)**:
```json
{
  "message": "Pedido excluído com sucesso"
}
```

### 🔧 Status dos Pedidos

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
| `pendente` | Pedido criado | Admin pode processar |
| `processando` | Em preparação | Admin pode marcar entregue |
| `entregue` | Finalizado | Admin pode excluir |
| `cancelado` | Cancelado | Admin pode excluir |

### 📊 Funcionalidades do Admin Dashboard

#### **Dashboard Principal**
- **Pedidos Recentes**: Lista dos últimos pedidos com detalhes
- **Estatísticas**: Total de pedidos e vendas do mês
- **Relatório de Vendas**: Produtos mais vendidos com receita

#### **Gerenciamento de Pedidos**
- ✅ **Visualizar Detalhes**: Ver produtos, quantidades e cliente
- ✅ **Atualizar Status**: Alterar status do pedido
- ✅ **Excluir Pedidos**: Remover pedidos cancelados/antigos
- ✅ **Buscar por ID**: Localizar pedido específico

### 💡 Exemplo de Fluxo Completo

```javascript
// 1. Adicionar itens ao carrinho
await fetch('/api/cart', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    produtoId: 1,
    quantidade: 2
  })
});

// 2. Visualizar carrinho
const carrinho = await fetch('/api/cart', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 3. Finalizar pedido
const pedido = await fetch('/api/cart/finalizar', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 4. Admin: Atualizar status
await fetch(`/api/pedidos/admin/${pedido.id}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'processando' })
});

// 5. Acompanhar pedidos
const meusPedidos = await fetch('/api/pedidos/meus', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

## 🔧 Configurações e Middlewares

### 🛡️ Middlewares de Segurança

#### 1. Autenticação (`verificarToken`)
Valida tokens JWT em todas as rotas protegidas.

**Implementação**:
```javascript
const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

**Uso**:
```javascript
// Aplicar em rotas específicas
router.get('/api/esportes', verificarToken, esporteController.listarTodos);

// Aplicar globalmente
app.use('/api', verificarToken);
```

#### 2. Verificação de Permissão (`checkRole`)
Valida se usuário tem permissão específica.

**Implementação**:
```javascript
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: 'Acesso negado. Permissão insuficiente.' 
      });
    }
    next();
  };
};
```

**Uso**:
```javascript
// Apenas administradores
router.post('/api/esportes', verificarToken, checkRole('admin'), esporteController.criar);

// Múltiplas permissões
const checkRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
```

#### 3. Upload de Arquivos (`multer`)
Middleware para upload de imagens com validações.

**Configuração**:
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

**Uso**:
```javascript
// Upload único
router.post('/api/esportes', 
  verificarToken, 
  checkRole('admin'),
  upload.single('foto'),
  esporteController.criar
);

// Upload múltiplo
router.post('/api/produtos',
  upload.array('imagens', 5),
  produtoController.criar
);
```

#### 4. Validação de Dados (`express-validator`)
Validação robusta de entrada de dados.

**Configuração**:
```javascript
const { body, validationResult } = require('express-validator');

// Middleware de validação
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validações específicas
const validarEsporte = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  validarCampos
];
```

#### 5. Rate Limiting
Proteção contra spam e ataques.

**Configuração**:
```javascript
const rateLimit = require('express-rate-limit');

// Rate limit geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});

// Rate limit para upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 uploads por minuto
  message: {
    error: 'Limite de upload excedido. Aguarde 1 minuto.'
  }
});

// Rate limit para login
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // máximo 5 tentativas de login
  skipSuccessfulRequests: true
});
```

#### 6. CORS (Cross-Origin Resource Sharing)
Configuração para permitir requisições do frontend.

**Configuração**:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://atleticahub.com.br'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ]
};

app.use(cors(corsOptions));
```

#### 7. Helmet (Segurança de Headers)
Proteção adicional via headers HTTP.

**Configuração**:
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
```

### 🔗 Ordem de Middlewares

```javascript
// 1. Middlewares básicos
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Rate limiting
app.use('/api/', generalLimiter);
app.use('/auth/', authLimiter);

// 3. Rotas públicas
app.use('/config', configRoutes);

// 4. Rotas com autenticação
app.use('/api/', verificarToken);
app.use('/api/esportes', esporteRoutes);
app.use('/api/eventos', eventoRoutes);

// 5. Middleware de erro (sempre por último)
app.use(errorHandler);
```

### 🔧 Variáveis de Ambiente

```bash
# .env
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@projeto.iam.gserviceaccount.com

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_BUCKET_NAME=atleticahub-uploads
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/service-account.json

# PostgreSQL (via Prisma)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/atleticahub"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/atleticahub-eventos"

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# URLs
FRONTEND_URL=http://localhost:3001
API_BASE_URL=http://localhost:3000
```

### 📋 Middleware de Log

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware de log
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});
```

---

## 🚨 Códigos de Erro

### 📊 Códigos HTTP Padrão

| Código | Status | Descrição | Uso |
|--------|--------|-----------|-----|
| **200** | OK | Sucesso | GET, PUT bem-sucedidos |
| **201** | Created | Criado | POST bem-sucedido |
| **204** | No Content | Sem conteúdo | DELETE bem-sucedido |
| **400** | Bad Request | Dados inválidos | Validação falhou |
| **401** | Unauthorized | Não autenticado | Token ausente/inválido |
| **403** | Forbidden | Sem permissão | Acesso negado |
| **404** | Not Found | Não encontrado | Recurso inexistente |
| **409** | Conflict | Conflito | Duplicação de dados |
| **429** | Too Many Requests | Rate limit | Muitas requisições |
| **500** | Internal Server Error | Erro interno | Falha no servidor |

### 🎯 Estrutura Padrão de Erro

```json
{
  "error": "Mensagem de erro legível",
  "code": "CODIGO_ERRO_ESPECIFICO",
  "details": "Informações adicionais",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/esportes",
  "method": "POST"
}
```

### 🔍 Códigos de Erro Específicos

#### Autenticação (AUTH_*)
```json
// TOKEN_MISSING
{
  "error": "Token de autenticação não fornecido",
  "code": "AUTH_TOKEN_MISSING"
}

// TOKEN_INVALID
{
  "error": "Token inválido ou expirado",
  "code": "AUTH_TOKEN_INVALID"
}

// FIREBASE_TOKEN_INVALID
{
  "error": "Token Firebase inválido",
  "code": "AUTH_FIREBASE_INVALID"
}

// INSUFFICIENT_PERMISSIONS
{
  "error": "Acesso negado. Permissão insuficiente.",
  "code": "AUTH_INSUFFICIENT_PERMISSIONS"
}
```

#### Validação (VALIDATION_*)
```json
// REQUIRED_FIELD
{
  "error": "Campos obrigatórios não fornecidos",
  "code": "VALIDATION_REQUIRED_FIELD",
  "details": {
    "missing_fields": ["nome", "email"]
  }
}

// INVALID_FORMAT
{
  "error": "Formato de dados inválido",
  "code": "VALIDATION_INVALID_FORMAT",
  "details": {
    "field": "email",
    "expected": "email válido",
    "received": "texto-inválido"
  }
}

// FILE_TOO_LARGE
{
  "error": "Arquivo muito grande",
  "code": "VALIDATION_FILE_SIZE",
  "details": {
    "max_size": "5MB",
    "received_size": "8MB"
  }
}
```

#### Recursos (RESOURCE_*)
```json
// NOT_FOUND
{
  "error": "Esporte não encontrado",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "esporte",
    "id": "550e8400-e29b-41d4-a716-446655440001"
  }
}

// ALREADY_EXISTS
{
  "error": "Esporte com este nome já existe",
  "code": "RESOURCE_ALREADY_EXISTS",
  "details": {
    "field": "nome",
    "value": "Futebol"
  }
}

// CONFLICT
{
  "error": "Não é possível excluir esporte com inscrições ativas",
  "code": "RESOURCE_CONFLICT",
  "details": {
    "active_inscriptions": 5
  }
}
```

#### Negócio (BUSINESS_*)
```json
// INSUFFICIENT_STOCK
{
  "error": "Estoque insuficiente para o produto",
  "code": "BUSINESS_INSUFFICIENT_STOCK",
  "details": {
    "produto_id": 1,
    "estoque_disponivel": 3,
    "quantidade_solicitada": 5
  }
}

// DUPLICATE_INSCRIPTION
{
  "error": "Usuário já inscrito neste esporte",
  "code": "BUSINESS_DUPLICATE_INSCRIPTION",
  "details": {
    "esporte_id": "550e8400-e29b-41d4-a716-446655440001",
    "status_atual": "pendente"
  }
}

// EVENT_PERMISSION_DENIED
{
  "error": "Você precisa estar inscrito no esporte associado a este evento",
  "code": "BUSINESS_EVENT_PERMISSION_DENIED",
  "details": {
    "esporte_id": "550e8400-e29b-41d4-a716-446655440001",
    "esporte_nome": "Futebol"
  }
}
```

#### Sistema (SYSTEM_*)
```json
// DATABASE_ERROR
{
  "error": "Erro interno do banco de dados",
  "code": "SYSTEM_DATABASE_ERROR",
  "details": "Entre em contato com o suporte"
}

// STORAGE_ERROR
{
  "error": "Erro ao salvar arquivo",
  "code": "SYSTEM_STORAGE_ERROR"
}

// EXTERNAL_SERVICE_ERROR
{
  "error": "Serviço Firebase temporariamente indisponível",
  "code": "SYSTEM_EXTERNAL_SERVICE_ERROR"
}
```

### 🔧 Middleware de Tratamento de Erro

```javascript
const errorHandler = (err, req, res, next) => {
  let error = {
    message: err.message || 'Erro interno do servidor',
    code: err.code || 'SYSTEM_INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Log do erro
  console.error('Error Details:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.uid || 'anonymous',
    body: req.body,
    timestamp: error.timestamp
  });

  // Personalizar resposta baseada no tipo de erro
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ...error,
      code: 'VALIDATION_ERROR',
      details: err.details
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ...error,
      message: 'Token inválido',
      code: 'AUTH_TOKEN_INVALID'
    });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ...error,
        message: 'Arquivo muito grande',
        code: 'VALIDATION_FILE_SIZE',
        details: 'Tamanho máximo: 5MB'
      });
    }
  }

  // Erro genérico
  res.status(err.statusCode || 500).json({
    error: error.message,
    code: error.code,
    timestamp: error.timestamp
  });
};

module.exports = errorHandler;
```

### 📱 Tratamento no Frontend

```javascript
// Função auxiliar para tratar erros da API
const handleApiError = (error, showToast = true) => {
  console.error('API Error:', error);
  
  const errorMessage = error.response?.data?.error || 'Erro inesperado';
  const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';
  
  // Tratar erros específicos
  switch (errorCode) {
    case 'AUTH_TOKEN_INVALID':
      // Redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
      
    case 'AUTH_INSUFFICIENT_PERMISSIONS':
      if (showToast) {
        showErrorToast('Você não tem permissão para esta ação');
      }
      break;
      
    case 'VALIDATION_REQUIRED_FIELD':
      const details = error.response?.data?.details;
      if (details?.missing_fields) {
        showErrorToast(`Campos obrigatórios: ${details.missing_fields.join(', ')}`);
      }
      break;
      
    default:
      if (showToast) {
        showErrorToast(errorMessage);
      }
  }
  
  return {
    message: errorMessage,
    code: errorCode,
    details: error.response?.data?.details
  };
};

// Uso em requisições
try {
  const response = await fetch('/api/esportes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro na requisição');
  }
  
  const result = await response.json();
  return result;
} catch (error) {
  return handleApiError(error);
}
```

---

## 📚 Guias de Integração

### 🚀 Configuração Inicial do Frontend

#### 1. Configuração do Firebase
```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseApp;
let auth;

const initializeFirebase = async () => {
  try {
    // Buscar configuração do backend
    const response = await fetch('/config/firebase');
    const config = await response.json();
    
    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);
    
    return auth;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    throw error;
  }
};

export { auth, initializeFirebase };
```

#### 2. Context de Autenticação (React)
```javascript
// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, initializeFirebase } from './firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeFirebase().then(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            
            // Fazer login no backend
            const response = await fetch('/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idToken,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              setToken(data.token);
              setUser(data.user);
              localStorage.setItem('token', data.token);
            }
          } catch (error) {
            console.error('Erro no login:', error);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 3. Hook para Requisições Autenticadas
```javascript
// useApi.js
import { useAuth } from './AuthContext';
import { useCallback } from 'react';

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = useCallback(async (url, options = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }, [token]);

  return { apiCall };
};
```

### 📱 Exemplos de Implementação

#### 1. Lista de Esportes com Inscrição
```javascript
// EsportesList.js
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

const EsportesList = () => {
  const [esportes, setEsportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    loadEsportes();
  }, []);

  const loadEsportes = async () => {
    try {
      const data = await apiCall('/api/esportes');
      setEsportes(data);
    } catch (error) {
      console.error('Erro ao carregar esportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInscricao = async (esporteId) => {
    try {
      await apiCall(`/api/inscricoes/${esporteId}`, { method: 'POST' });
      alert('Inscrição enviada com sucesso!');
      loadEsportes(); // Recarregar lista
    } catch (error) {
      alert(`Erro na inscrição: ${error.message}`);
    }
  };

  const isUserInscrito = (esporte) => {
    return esporte.inscricoes?.some(
      inscricao => inscricao.usuarioId === user?.uid
    );
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="esportes-grid">
      {esportes.map(esporte => (
        <div key={esporte.id} className="esporte-card">
          <img src={esporte.fotoUrl} alt={esporte.nome} />
          <h3>{esporte.nome}</h3>
          <p>Inscritos: {esporte.inscricoes?.length || 0}</p>
          
          {!isUserInscrito(esporte) ? (
            <button 
              onClick={() => handleInscricao(esporte.id)}
              className="btn-primary"
            >
              Inscrever-se
            </button>
          ) : (
            <span className="status-inscrito">✓ Inscrito</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default EsportesList;
```

#### 2. Carrinho de Compras
```javascript
// ShoppingCart.js
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await apiCall('/api/cart');
      setCartItems(data);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await apiCall(`/api/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantidade: newQuantity })
      });
      loadCart();
    } catch (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiCall(`/api/cart/${itemId}`, { method: 'DELETE' });
      loadCart();
    } catch (error) {
      alert(`Erro ao remover: ${error.message}`);
    }
  };

  const finalizePurchase = async () => {
    try {
      const pedido = await apiCall('/api/cart/finalizar', { method: 'POST' });
      alert(`Pedido #${pedido.id} criado com sucesso!`);
      loadCart(); // Carrinho será limpo
    } catch (error) {
      alert(`Erro na compra: ${error.message}`);
    }
  };

  const total = cartItems.reduce((sum, item) => 
    sum + (item.produto.preco * item.quantidade), 0
  );

  if (loading) return <div>Carregando carrinho...</div>;

  if (cartItems.length === 0) {
    return <div>Carrinho vazio</div>;
  }

  return (
    <div className="shopping-cart">
      <h2>Meu Carrinho</h2>
      
      {cartItems.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.produto.imagemUrl} alt={item.produto.nome} />
          <div className="item-details">
            <h4>{item.produto.nome}</h4>
            <p>Preço: R$ {item.produto.preco.toFixed(2)}</p>
            
            <div className="quantity-controls">
              <button 
                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                disabled={item.quantidade <= 1}
              >
                -
              </button>
              <span>{item.quantidade}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                disabled={item.quantidade >= item.produto.estoque}
              >
                +
              </button>
            </div>
            
            <button 
              onClick={() => removeItem(item.id)}
              className="btn-remove"
            >
              Remover
            </button>
          </div>
          
          <div className="item-total">
            R$ {(item.produto.preco * item.quantidade).toFixed(2)}
          </div>
        </div>
      ))}
      
      <div className="cart-summary">
        <h3>Total: R$ {total.toFixed(2)}</h3>
        <button 
          onClick={finalizePurchase}
          className="btn-primary btn-large"
        >
          Finalizar Compra
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;
```

### 🔧 Utilitários e Helpers

#### 1. Formatação de Dados
```javascript
// utils/formatters.js
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatStatus = (status) => {
  const statusMap = {
    'pendente': 'Pendente',
    'aceito': 'Aceito',
    'rejeitado': 'Rejeitado',
    'processando': 'Processando',
    'enviado': 'Enviado',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  
  return statusMap[status] || status;
};
```

#### 2. Validações
```javascript
// utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png']) => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
```

---

## 📋 Checklist de Implementação

### ✅ Backend Setup
- [ ] **Configuração do Ambiente**
  - [ ] Instalar dependências (`npm install`)
  - [ ] Configurar variáveis de ambiente (`.env`)
  - [ ] Configurar Firebase Admin SDK
  - [ ] Configurar Google Cloud Storage

- [ ] **Banco de Dados**
  - [ ] Configurar PostgreSQL
  - [ ] Executar migrações Prisma (`npx prisma migrate dev`)
  - [ ] Configurar MongoDB para eventos
  - [ ] Verificar conexões

- [ ] **Autenticação**
  - [ ] Configurar Firebase Authentication
  - [ ] Implementar middleware de autenticação
  - [ ] Testar login/logout
  - [ ] Configurar permissões de admin

### ✅ Frontend Setup
- [ ] **Projeto React**
  - [ ] Configurar Context de Autenticação
  - [ ] Implementar interceptadores HTTP
  - [ ] Configurar roteamento protegido
  - [ ] Implementar tratamento de erros

- [ ] **Componentes Principais**
  - [ ] Tela de Login/Registro
  - [ ] Lista de Esportes
  - [ ] Sistema de Eventos
  - [ ] Loja/Carrinho
  - [ ] Painel Administrativo

### ✅ Testes
- [ ] **Testes de API**
  - [ ] Autenticação
  - [ ] CRUD de esportes
  - [ ] Sistema de inscrições
  - [ ] Carrinho e pedidos

- [ ] **Testes de Integração**
  - [ ] Fluxo completo de compra
  - [ ] Sistema de permissões
  - [ ] Upload de arquivos

### ✅ Deploy
- [ ] **Produção**
  - [ ] Configurar CI/CD
  - [ ] Configurar domínio e SSL
  - [ ] Monitoramento e logs
  - [ ] Backup de dados

---

## 🎯 Conclusão

Este documento fornece uma visão completa da API do AtleticaHub, incluindo:

- **Autenticação robusta** com Firebase + JWT
- **Sistema de esportes** com inscrições e aprovações
- **Eventos inteligentes** (gerais + treinos por esporte)
- **E-commerce completo** com carrinho e pedidos
- **Chat por modalidade** esportiva
- **Sistema de permissões** (user/admin)
- **Upload de imagens** com Google Cloud Storage
- **Documentação completa** de todos os endpoints
- **Guias de integração** para frontend
- **Tratamento de erros** padronizado
- **Exemplos práticos** de implementação

### 🚀 Próximos Passos

1. **Implementar notificações push** para eventos e pedidos
2. **Sistema de pagamentos** (PIX, cartão)
3. **Dashboard analítico** para administradores
4. **App mobile** com React Native
5. **Sistema de avaliações** de produtos
6. **Gamificação** com ranking de participação

### 🆘 Suporte

- **Email**: suporte@atleticahub.com.br
- **Documentação**: https://docs.atleticahub.com.br
- **GitHub**: https://github.com/atleticahub/backend

---

**AtleticaHub API v1.0** - Desenvolvido com ❤️ para atletas universitários.
