const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
    const { url, format, quality } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    const videoFormat = format || "mp4";
    const videoQuality = quality || "720"; 

    
    console.log ( "Url Recibida:", url, format, quality, " Iniciando Descarga");

    const command = `yt-dlp -f "bestvideo[ext=${videoFormat}][height=${videoQuality}]+bestaudio[ext=m4a]/best" --merge-output-format ${videoFormat} -o "downloads/%(title)s.%(ext)s" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr });
        }
        res.json({ message: "Descarga finalizada", details: stdout }); 
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Uso del res.download para descargar mi video desde el fronted

// res.download(outputPath, filename, (err) => {
    //   if (err) {
    //     console.error("Error al enviar el archivo:", err);
    //   }

    //   fs.unlink(outputPath, (unlinkErr) => {
    //     if (unlinkErr) {
    //       console.error("Error al eliminar el archivo:", unlinkErr);
    //     } else {
    //       console.log(`Archivo eliminado: ${outputPath}`);
    //     }
    //   });
    // });