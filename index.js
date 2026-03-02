import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_TOKEN = process.env.API_TOKEN || "12345";

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (token !== API_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

let lastTelemetry = { online: false, ts: 0, data: {} };
let pendingCommand = null;

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/telemetry", auth, (req, res) => {
  lastTelemetry = { online: true, ts: Date.now(), data: req.body ?? {} };
  res.json({ ok: true });
});

app.get("/state", auth, (req, res) => {
  res.json(lastTelemetry);
});

app.post("/command", auth, (req, res) => {
  pendingCommand = { ts: Date.now(), cmd: req.body };
  res.json({ ok: true });
});

app.get("/command", auth, (req, res) => {
  if (!pendingCommand) return res.json({ cmd: null });
  const cmd = pendingCommand;
  pendingCommand = null;
  res.json(cmd);
});

app.listen(3000, () => console.log("Servidor funcionando en puerto 3000"));
