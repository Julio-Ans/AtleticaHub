const Evento = require('../models/evento.model');
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
console.log(`Trying to access bucket: ${bucketName}`);

// Verificar se o bucket existe e criar se necessário
let bucket;
async function initializeBucket() {
  try {
    bucket = storage.bucket(bucketName);
    
    // Verificar se o bucket existe
    const [exists] = await bucket.exists();
    if (!exists) {
      console.log(`Bucket ${bucketName} não existe. Tentando criar...`);
      
      // Criar o bucket
      await storage.createBucket(bucketName, {
        location: 'US',
        storageClass: 'STANDARD',
      });
      console.log(`Bucket ${bucketName} criado com sucesso!`);
    } else {
      console.log(`Bucket ${bucketName} já existe.`);
    }
    
    console.log('Bucket object created successfully');
  } catch (err) {
    console.error('Error accessing/creating bucket:', err);
    console.log('Tentando usar bucket padrão do Firebase Storage...');
    
    // Tentar com o bucket padrão do Firebase Storage
    const firebaseBucketName = `${projectId}.firebasestorage.app`;
    console.log(`Tentando bucket Firebase Storage: ${firebaseBucketName}`);
    
    try {
      bucket = storage.bucket(firebaseBucketName);
      const [exists] = await bucket.exists();
      if (exists) {
        console.log(`Usando bucket Firebase Storage: ${firebaseBucketName}`);
        // Atualizar o bucketName global
        global.bucketName = firebaseBucketName;
      } else {
        console.error(`Bucket Firebase Storage ${firebaseBucketName} também não existe.`);
      }
    } catch (firebaseErr) {
      console.error('Erro ao tentar bucket Firebase Storage:', firebaseErr);
    }
  }
}

// Inicializar o bucket
initializeBucket();

module.exports = {
  // Listar todos os eventos
  async listar(req, res) {
    try {
      const eventos = await Evento.find().sort({ data: 1 });
      res.json(eventos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar eventos' });
    }
  },

  // Criar evento (admin)
  async criar(req, res) {
    try {
      const { titulo, descricao, tipo, data, local } = req.body;
      const criadorId = req.user.uid;      let fotoUrl = undefined;
      
      if (req.file) {
        try {          console.log('Iniciando upload de arquivo para o Firebase Storage');
          
          // Upload para o Firebase Storage
          const ext = path.extname(req.file.originalname);
          const filename = `eventos/${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
          
          // Use the global bucket name if it was updated during initialization
          const currentBucketName = global.bucketName || bucketName;
          console.log(`Bucket: ${currentBucketName}`);
          console.log(`Filename: ${filename}`);
          
          const file = bucket.file(filename);
          
          // Salvando o arquivo no bucket
          console.log('Salvando arquivo no bucket...');
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
          
          console.log(`URL pública gerada via signed URL: ${url}`);
            // Standard Google Cloud Storage URL format
          const publicUrl = `https://storage.googleapis.com/${currentBucketName}/${filename}`;
          console.log(`URL pública gerada via padrão: ${publicUrl}`);
            // Use the signed URL which should work more reliably
          fotoUrl = url;
        } catch (uploadErr) {
          console.error('Erro ao fazer upload da imagem:', uploadErr);
          console.error('Stack do erro:', uploadErr.stack);
          console.error('Detalhes do arquivo:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
          });
          console.error('Detalhes do bucket:', {
            bucketName,
            projectId: serviceAccount.project_id
          });
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: uploadErr.message });
        }
      }
      const evento = await Evento.create({ titulo, descricao, tipo, data, local, criadorId, fotoUrl });
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
      const update = req.body;
      update.updatedAt = new Date();
      const evento = await Evento.findByIdAndUpdate(id, update, { new: true });
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao editar evento' });
    }
  },

  // Excluir evento (admin)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findByIdAndDelete(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json({ message: 'Evento excluído com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao excluir evento' });
    }
  },

  // Buscar evento por ID
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao buscar evento' });
    }
  },

  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.user;
      const usuarioId = req.user.uid;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      if (evento.inscricoes.some(i => i.usuarioId === usuarioId)) {
        return res.status(400).json({ error: 'Usuário já inscrito neste evento' });
      }
      evento.inscricoes.push({ usuarioId, nome, email });
      await evento.save();
      res.status(201).json({ message: 'Inscrição realizada com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao inscrever no evento' });
    }
  },

  // Cancelar inscrição
  async cancelarInscricao(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.uid;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      const antes = evento.inscricoes.length;
      evento.inscricoes = evento.inscricoes.filter(i => i.usuarioId !== usuarioId);
      if (evento.inscricoes.length === antes) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      await evento.save();
      res.json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao cancelar inscrição' });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const eventos = await Evento.find({ 'inscricoes.usuarioId': usuarioId });
      res.json(eventos);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao listar eventos inscritos' });
    }
  }
};
