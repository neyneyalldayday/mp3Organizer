// index.js

const express = require("express");
const multer = require("multer");
const mm = require("music-metadata");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.static("public"));

app.post("/upload", upload.array("mp3Files"), async (req, res) => {
  try {
    console.log("Received POST request to /upload");
    console.log("Request headers       ", req.headers);
    const files = req.files;
    console.log("Received files:", req.files);

    // Array to hold organized files
    const organizedFiles = [];

    // Process each uploaded file
    for (const file of files) {
      const filePath = file.path;

      // Read metadata of the MP3 file
      const metadata = await mm.parseFile(filePath);

      const songId = crypto
        .createHash("md5")
        .update(JSON.stringify(metadata))
        .digest("hex");
      // Get necessary information (you can adjust as needed)
      const { artist, title } = metadata.common;
      const destinationFolder = path.join(
        __dirname,
        "uploads",
        "organized",
        songId
      );

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

    res.json({ message: "Files organized successfully!", organizedFiles });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.delete("/uploads/", async (req, res) => {
  try {
    const files = fs.readdirSync("./uploads/");
    files.forEach((file) => {
      const filePath = path.join(__dirname, './uploads', file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
     
    });

    res.status(200).json({ message: "songs cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
