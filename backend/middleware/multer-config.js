const multer = require('multer');
const sharp = require('sharp');
const path = require('path');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

// Middleware pour l'upload et la conversion de l'image
const convertImageToWebp = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      return res.status(500).json({ error });
    }

    if (!req.file) { return next(); }

    const name = req.file.originalname.split(' ').join('_').split('.')[0];
    const filename = `${name}_${Date.now()}.webp`;
    const outputPath = path.join('images', filename);

    sharp(req.file.buffer)
      .toFormat('webp')
      .toFile(outputPath, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
        }

        req.file.filename = filename;
        req.file.outputPath = outputPath;

        next();
      });
  });
};

module.exports = convertImageToWebp;
