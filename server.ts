import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Storage for violations
  const logsDir = path.join(process.cwd(), "logs");
  const thumbnailsDir = path.join(logsDir, "thumbnails");
  
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

  const violationsPath = path.join(logsDir, "violations.json");
  let violations = [];
  if (fs.existsSync(violationsPath)) {
    try {
      violations = JSON.parse(fs.readFileSync(violationsPath, "utf-8"));
    } catch (e) {
      violations = [];
    }
  }

  // API Routes
  app.get("/api/user", (req, res) => {
    res.json({
      name: "Safety Officer",
      role: "Site Administrator",
      organization: "ConstructVision Global",
      lastLogin: new Date().toISOString()
    });
  });

  app.get("/api/violations", (req, res) => {
    res.json(violations);
  });

  app.post("/api/violations", (req, res) => {
    const violation = {
      ...req.body,
      id: `VIO-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    
    if (req.body.thumbnail) {
      const base64Data = req.body.thumbnail.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `violation_${violation.id}.jpg`;
      const filePath = path.join(thumbnailsDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      violation.thumbnailUrl = `/logs/thumbnails/${fileName}`;
      delete violation.thumbnail;
    }

    violations.push(violation);
    fs.writeFileSync(violationsPath, JSON.stringify(violations, null, 2));
    res.json(violation);
  });

  app.get("/api/export", (req, res) => {
    const csvRows = ["ID,Timestamp,Type,Confidence,Coordinates"];
    violations.forEach(v => {
      csvRows.push(`${v.id},${v.timestamp},"${v.type}",${v.confidence},"${v.bbox.xmin},${v.bbox.ymin}"`);
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=violations_export.csv');
    res.send(csvRows.join("\n"));
  });

  app.use("/logs", express.static(logsDir));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ConstructVision Server running on http://localhost:${PORT}`);
  });
}

startServer();
