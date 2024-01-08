// index.js

const express = require('express');
const multer = require('multer');
const mm = require('music-metadata');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(upload.array('mp3Files'));

app.use(express.static("public"));

app.post('/upload', upload.array('mp3Files'), async (req, res) => {
  try { 
      
    const files = req.files;
   

    // Array to hold organized files
    const organizedFiles = [];

    // Process each uploaded file
    for (const file of files) {
      const filePath = file.path;

      // Read metadata of the MP3 file
      const metadata = await mm.parseFile(filePath);

      // Get necessary information (you can adjust as needed)
      const { artist, title } = metadata.common;
      const destinationFolder = path.join('uploads','organized', artist, title);

      // Create destination folder if not exists
      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }

      // Move the file to the organized folder
      const newFilePath = path.join(destinationFolder, file.originalname);
      fs.renameSync(filePath, newFilePath);

      // Add file info to the organizedFiles array
      organizedFiles.push({
        originalName: file.originalname,
        artist,
        title,
        newPath: newFilePath,
      });
    }

    res.json({ message: 'Files organized successfully!', organizedFiles });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
