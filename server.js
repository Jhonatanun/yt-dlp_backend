
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();

// Verificar si yt-dlp está instalado correctamente
exec("yt-dlp --version", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando yt-dlp: ${stderr}`);
  } else {
    console.log(`yt-dlp versión instalada: ${stdout.trim()}`);
  }
});

app.use(
  cors({
    origin: "*", // Permite todas las solicitudes
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.get("/downloads/:filename", (req, res) => {
  const filePath = path.join("downloads", req.params.filename);

  // Verificar si el archivo existe antes de enviarlo
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  // Configurar cabeceras adecuadas para evitar problemas de CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Content-Disposition", `attachment; filename="${req.params.filename}"`);

  res.sendFile(filePath, { root: "." }); // Enviar el archivo correctamente
});


app.use(express.json());

app.post("/download", async (req, res) => {
  console.log("Petición de descarga realizada con exito.")
  console.log("Esta es la URL del video a descargar:", url)

  const { url, format = "mp4", quality = "720" } = req.body;

  // Validar que la URL sea válida
  if (!url || typeof url !== "string" || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: "URL no válida" });
  }

  const outputDir = "./downloads";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `video_${Date.now()}.${format}`;
  const outputPath = path.join(outputDir, filename);

  console.log(`Iniciando descarga: ${url}`);

  // Ejecutar yt-dlp con formato seguro
  const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio/best" -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error descargando el video: ${stderr}`);
      return res.status(500).json({ error: "Error al descargar el video" });
    }

    console.log(`Video descargado en el servidor con exito: ${outputPath}`);

    // URL de descarga dinámica (considera HTTPS si está en producción)
    const fileUrl = `https://${req.get("host")}/downloads/${filename}`;
    console.log("Url de descarga generada con exito: Url,", fileUrl)
    res.json({ success: true, downloadUrl: fileUrl });

    // Programar eliminación del archivo tras 2 minutos
    setTimeout(() => {
      fs.access(outputPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(outputPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error al eliminar el archivo:", unlinkErr);
            } else {
              console.log(`Archivo eliminado: ${outputPath}`);
            }
          });
        }
      });
    }, 180000); // 180,000 ms = 3 minutos
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
