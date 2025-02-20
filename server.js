// import express from "express";
// import cors from "cors";
// import { exec } from "child_process";
// import fs from "fs";
// import path from "path";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post("/download", (req, res) => {
//   const { url, format, quality } = req.body;

//   if (!url) {
//     return res.status(400).json({ error: "URL no proporcionada" });
//   }

//   // Directorio temporal donde se descargará el video
//   const outputDir = "./downloads";
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir);
//   }

//   // Nombre del archivo de salida
//   const filename = `video_${Date.now()}.${format}`;
//   const outputPath = path.join(outputDir, filename);

//   // Comando para descargar el video con yt-dlp
//   const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio/best" -o "${outputPath}" "${url}"`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error descargando el video: ${stderr}`);
//       return res.status(500).json({ error: "Error al descargar el video" });
//     }

//     console.log(`Video descargado: ${outputPath}`);

//     // Enviar el archivo al usuario y luego eliminarlo
//     res.download(outputPath, filename, (err) => {
//       if (err) {
//         console.error("Error al enviar el archivo:", err);
//       }

//       // Eliminar el archivo después de enviarlo
//       fs.unlink(outputPath, (unlinkErr) => {
//         if (unlinkErr) {
//           console.error("Error al eliminar el archivo:", unlinkErr);
//         } else {
//           console.log(`Archivo eliminado: ${outputPath}`);
//         }
//       });
//     });
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });

import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(
  cors({
    origin: "*", // Permite todas las solicitudes
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(
  "/downloads",
  express.static("downloads", {
    setHeaders: (res, path) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);
app.use(express.json());



exec("yt-dlp --version", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando yt-dlp: ${stderr}`);
  } else {
    console.log(`yt-dlp versión instalada: ${stdout}`);
  }
});



// // Servir archivos estáticos desde la carpeta "downloads"
// app.use("/downloads", express.static("downloads"));

app.post("/download", async (req, res) => {
  const { url, format, quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL no proporcionada" });
  }

  const outputDir = "./downloads";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  console.log("Iniciando descarga");
  const filename = `video_${Date.now()}.${format}`;
  const outputPath = path.join(outputDir, filename);

  // Ejecutar yt-dlp desde el sistema
  const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio/best" -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    
    if (error) {
      console.error(`Error descargando el video: ${stderr}`);
      return res.status(500).json({ error: "Error al descargar el video" });
    }
    
    console.log(`Video descargado: ${outputPath}`);

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

    // Generar URL de descarga antes de eliminar el archivo
    const fileUrl = `${req.protocol}://${req.get("host")}/downloads/${filename}`;

    // Enviar la URL al frontend en lugar de hacer res.download directamente
    res.json({ success: true, downloadUrl: fileUrl });

    // Esperar un tiempo antes de eliminar el archivo (ejemplo: 1 minuto)
    setTimeout(() => {
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error al eliminar el archivo:", unlinkErr);
        } else {
          console.log(`Archivo eliminado: ${outputPath}`);
        }
      });
    }, 60000); // 60,000 ms = 1 minuto
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
