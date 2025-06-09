const { admin, bucket } = require('../config/firebaseAdmin');

class UploadService {
  constructor() {
    // Usar o mesmo bucket que está funcionando nos produtos
    this.bucket = bucket;
  }  /**
   * Upload de arquivo para o Firebase Storage
   * @param {Buffer} buffer - Buffer do arquivo
   * @param {string} fileName - Nome original do arquivo
   * @param {string} folder - Pasta onde será salvo (ex: 'esportes', 'eventos')
   * @returns {Promise<string>} - URL pública do arquivo
   */
  async uploadFile(buffer, fileName, folder = 'uploads') {
    try {
      // Gerar nome único para o arquivo (mesmo padrão dos controllers)
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${Date.now()}_${fileName}`;

      // Criar referência do arquivo no bucket
      const file = this.bucket.file(uniqueFileName);

      // Fazer upload do buffer (mesmo padrão do produtoController)
      await file.save(buffer, {
        metadata: {
          contentType: this.getContentType(fileExtension),
        },
      });

      // Retornar URL no mesmo formato do produtoController
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;
      return imageUrl;
      
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
