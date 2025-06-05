const multer = require('multer');

// Armazena o arquivo apenas em memória, pois será enviado ao Firebase
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
    }
  }
});

module.exports = upload;
