const admin = require('../config/firebaseAdmin');

// Função auxiliar para obter o project ID
function getProjectId() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return serviceAccount.project_id;
    } catch (error) {
      console.error('Erro ao parsear FIREBASE_SERVICE_ACCOUNT:', error);
      return 'atleticahub-7b449'; // fallback
    }
  } else {
    // Em desenvolvimento, tentar carregar do arquivo
    try {
      const serviceAccount = require('../config/firebase-service-account.json');
      return serviceAccount.project_id;
    } catch (error) {
      console.warn('Arquivo firebase-service-account.json não encontrado, usando project_id padrão');
      return 'atleticahub-7b449'; // fallback
    }
  }
}

class UploadService {
  constructor() {
    // Obter projeto ID do Firebase Admin já configurado
    const projectId = getProjectId();
    
    // Tentar primeiro com o bucket padrão do Firebase Storage
    let bucketName = `${projectId}.firebasestorage.app`;
    
    this.bucket = admin.storage().bucket(bucketName);
    this.bucketInitialized = false;
    this.initializeBucket();
  }  async initializeBucket() {
    try {
      const projectId = getProjectId();
      let bucketName = `${projectId}.appspot.com`;
      
      this.bucket = admin.storage().bucket(bucketName);
      const [exists] = await this.bucket.exists();
      
      if (!exists) {
        // Tentar com o bucket padrão do Firebase Storage
        const firebaseBucketName = `${projectId}.firebasestorage.app`;
        this.bucket = admin.storage().bucket(firebaseBucketName);
        const [firebaseExists] = await this.bucket.exists();
        
        if (!firebaseExists) {
          console.error('Nenhum bucket encontrado! Verifique a configuração do Firebase Storage.');
        }
      }
      this.bucketInitialized = true;    } catch (err) {
      console.error('Erro ao inicializar bucket:', err);
      // Fallback para o bucket Firebase Storage
      const projectId = getProjectId();
      const firebaseBucketName = `${projectId}.firebasestorage.app`;
      this.bucket = admin.storage().bucket(firebaseBucketName);
      this.bucketInitialized = true;
    }
  }

  /**
   * Upload de arquivo para o Firebase Storage
   * @param {Buffer} buffer - Buffer do arquivo
   * @param {string} fileName - Nome original do arquivo
   * @param {string} folder - Pasta onde será salvo (ex: 'esportes', 'eventos')
   * @returns {Promise<string>} - URL pública do arquivo
   */  async uploadFile(buffer, fileName, folder = 'uploads') {
    try {
      // Aguardar inicialização do bucket se necessário
      if (!this.bucketInitialized) {
        await this.initializeBucket();
      }

      // Gerar nome único para o arquivo (mesmo padrão dos controllers)
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;

      // Criar referência do arquivo no bucket
      const file = this.bucket.file(uniqueFileName);

      // Fazer upload do buffer
      const stream = file.createWriteStream({
        metadata: {
          contentType: this.getContentType(fileExtension),
        },
      });      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Erro no upload:', error);
          reject(new Error('Falha no upload do arquivo'));
        });

        stream.on('finish', async () => {
          try {
            // Gerar URL com assinatura (mesmo padrão dos controllers antigos)
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: '03-01-2500', // Expiração muito longa
            });
            
            resolve(url);
          } catch (error) {
            console.error('Erro ao gerar URL assinada:', error);
            reject(new Error('Erro ao gerar URL do arquivo'));
          }
        });

        stream.end(buffer);
      });
    } catch (error) {
      console.error('Erro no serviço de upload:', error);
      throw new Error('Erro interno do serviço de upload');
    }
  }

  /**
   * Deletar arquivo do Firebase Storage
   * @param {string} fileUrl - URL do arquivo a ser deletado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return true;

      // Extrair nome do arquivo da URL
      const fileName = fileUrl.split('/').pop();
      const file = this.bucket.file(fileName);

      await file.delete();
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false; // Não falhar se não conseguir deletar
    }
  }

  /**
   * Obter content type baseado na extensão do arquivo
   * @param {string} extension - Extensão do arquivo
   * @returns {string} - Content type
   */
  getContentType(extension) {
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };

    return contentTypes[extension?.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Validar se o arquivo é uma imagem válida
   * @param {string} fileName - Nome do arquivo
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {boolean} - Se é válido
   */
  validateImageFile(fileName, fileSize) {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!fileName) return false;

    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error('Formato de arquivo não suportado. Use: JPG, JPEG, PNG, GIF ou WEBP');
    }

    if (fileSize > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    return true;
  }
}

module.exports = new UploadService();
