import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8081;
const API_KEY = process.env.API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Storage TMS API",
    version: "1.0.0",
    description: "API documentation for TMS file storage service. **All requests require API Key in `x-api-key` header.**",
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "**API Key required for all requests. Add `x-api-key` in the request header.**",
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check server health
 *     description: Returns a message confirming that the server is running.
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get("/api/health", (req, res) => {
  res.json({ message: "server is running" });
});

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  next();
};

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     description: "**Requires API Key in `x-api-key` header.** Upload a file to the server."
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", checkApiKey, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/file/${req.file.filename}`;
  console.log(`File uploaded: ${req.file.filename} (${fileUrl})`);

  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    url: fileUrl,
  });
});

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Get list of uploaded files
 *     description: "**Requires API Key in `x-api-key` header.** Get all uploaded files with their URLs."
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of files
 */
app.get("/files", checkApiKey, async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir);
    const fileUrls = files.map(file => ({
      filename: file,
      url: `${req.protocol}://${req.get("host")}/file/${file}`,
    }));

    res.json({ files: fileUrls });
  } catch (err) {
    res.status(500).json({ message: "Failed to read directory", error: err.message });
  }
});

/**
 * @swagger
 * /file/{filename}:
 *   get:
 *     summary: Get a file by filename
 *     description: "**Requires API Key in `x-api-key` header.** Retrieve a file by filename."
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to retrieve
 *     responses:
 *       200:
 *         description: File retrieved successfully
 */
app.get("/file/:filename", checkApiKey, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});