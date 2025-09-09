import express, { Express } from "express";
import http from "http";

const port = 3000;

const app: Express = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, Node + TypeScript!");
});

// Optional health check route
app.get("/health", (req, res) => {
  res.status(200).send("App is healthy");
});

// Create HTTP server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// Graceful shutdown (optional)
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
