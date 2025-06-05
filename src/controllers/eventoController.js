const eventoService = require('../services/eventoService');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const admin = require('../config/firebaseAdmin');
const serviceAccount = require('../config/firebase-service-account.json');

// Configuração do Google Cloud Storage
const storage = new Storage({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key
  }
});
// Firebase Storage bucket name format
const projectId = serviceAccount.project_id;
const bucketName = `${projectId}.appspot.com`;

// Verificar se o bucket existe e usar o correto
let bucket;
async function initializeBucket() {
  try {
    bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();
    
    if (!exists) {
      // Tentar com o bucket padrão do Firebase Storage
      const firebaseBucketName = `${projectId}.firebasestorage.app`;
      bucket = storage.bucket(firebaseBucketName);
      const [firebaseExists] = await bucket.exists();
      
      if (firebaseExists) {
        global.bucketName = firebaseBucketName;
      }
    }
  } catch (err) {
    // Fallback para o bucket Firebase Storage
    const firebaseBucketName = `${projectId}.firebasestorage.app`;
    try {
      bucket = storage.bucket(firebaseBucketName);
      const [exists] = await bucket.exists();
      if (exists) {
        global.bucketName = firebaseBucketName;
      }
    } catch (firebaseErr) {
      console.error('Erro ao conectar com Firebase Storage:', firebaseErr);
    }
  }
}

// Inicializar o bucket
initializeBucket();

module.exports = {  // Listar todos os eventos
  async listar(req, res) {
    try {
      const eventos = await eventoService.listarEventos();
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos:', err);
      res.status(500).json({ error: 'Erro ao listar eventos' });
    }
  },  // Criar evento (admin)
  async criar(req, res) {
    try {
      const { titulo, descricao, tipo, data, local } = req.body;
      const criadorId = req.user.uid;
      let fotoUrl = undefined;
        
      if (req.file) {
        try {
          // Upload para o Firebase Storage
          const ext = path.extname(req.file.originalname);
          const filename = `eventos/${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
          
          // Use the global bucket name if it was updated during initialization
          const currentBucketName = global.bucketName || bucketName;
          
          const file = bucket.file(filename);
          
          // Salvando o arquivo no bucket
          await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            public: true,
            metadata: { cacheControl: 'public, max-age=31536000' }
          });
          
          // Generate a signed URL (authenticated access)
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // A very long expiration
          });
          
          fotoUrl = url;
        } catch (uploadErr) {
          console.error('Erro ao fazer upload da imagem:', uploadErr.message);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: uploadErr.message });
        }
      }
      
      const evento = await eventoService.criarEvento({ 
        titulo, 
        descricao, 
        tipo, 
        data, 
        local, 
        criadorId, 
        fotoUrl 
      });
      res.status(201).json(evento);
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      res.status(400).json({ error: 'Erro ao criar evento', details: err.message });
    }
  },
  // Editar evento (admin)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const evento = await eventoService.editarEvento(id, updateData);
      res.json(evento);
    } catch (err) {
      console.error('Erro ao editar evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao editar evento', details: err.message });
    }
  },

  // Excluir evento (admin)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      await eventoService.excluirEvento(id);
      res.json({ message: 'Evento excluído com sucesso' });
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao excluir evento', details: err.message });
    }
  },

  // Buscar evento por ID
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const evento = await eventoService.buscarEventoPorId(id);
      res.json(evento);
    } catch (err) {
      console.error('Erro ao buscar evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao buscar evento', details: err.message });
    }
  },
  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.user;
      const usuarioId = req.user.uid;
      
      await eventoService.inscreverUsuario(id, { usuarioId, nome, email });
      res.status(201).json({ message: 'Inscrição realizada com sucesso' });
    } catch (err) {
      console.error('Erro ao inscrever no evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('já inscrito')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao inscrever no evento', details: err.message });
    }
  },

  // Cancelar inscrição
  async cancelarInscricao(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.uid;
      
      await eventoService.cancelarInscricao(id, usuarioId);
      res.json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      if (err.message.includes('não encontrado') || err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao cancelar inscrição', details: err.message });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const eventos = await eventoService.listarEventosDoUsuario(usuarioId);
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos inscritos:', err);
      res.status(400).json({ error: 'Erro ao listar eventos inscritos', details: err.message });
    }
  }
};
