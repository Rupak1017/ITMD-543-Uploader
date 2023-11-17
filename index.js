const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkDuplicateFile(file, cb);
  },
});

function checkDuplicateFile(file, cb) {
  const filePath = path.join(__dirname, 'uploads', file.originalname);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      const error = new Error('Duplicate file detected. Do you want to override?');
      cb(error);
    } else {
      cb(null, true);
    }
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  res.json({ message: 'Duplicate, press upload again to override.' });
});

app.get('/files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Error reading uploaded files.');
    }

    res.json(files);
  });
});

app.post('/delete', (req, res) => {
  const fileName = req.body.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);
  console.log('Deleting file:', filePath);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ success: false, message: 'Error deleting file.' });
    }

    res.json({ success: true, message: 'File deleted successfully.' });
  });
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
