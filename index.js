const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors({
  origin: 'http://localhost:6066', // 允许来自 http://localhost:6066 的请求
  methods: 'GET,POST', // 允许的请求方法
  allowedHeaders: 'Content-Type', // 允许的请求头
}))

app.post('/upload', (req, res) => {
  console.log(req,'req')
  const fileName = req.body.fileName;
  const currentChunk = parseInt(req.body.currentChunk);
  const totalChunks = parseInt(req.body.totalChunks);

  const chunkDir = path.join(uploadDir, fileName);
  
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkPath = path.join(chunkDir, `chunk-${currentChunk}`);
  
  const fileStream = fs.createWriteStream(chunkPath);
  req.pipe(fileStream);

  req.on('end', async () => {
    if (currentChunk + 1 === totalChunks) {
      await mergeChunks(chunkDir, fileName);
    }
    res.status(200).send('Chunk uploaded successfully');
  });
});

function mergeChunks(chunkDir, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadDir, fileName);
    const writeStream = fs.createWriteStream(filePath);
    
    fs.readdir(chunkDir, (err, files) => {
      if (err) reject(err);

      files
        .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))
        .forEach((file) => {
          const filePath = path.join(chunkDir, file);
          const data = fs.readFileSync(filePath);
          writeStream.write(data);
        });

      writeStream.end();
      fs.rmdirSync(chunkDir, { recursive: true });
      resolve();
    });
  });
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
