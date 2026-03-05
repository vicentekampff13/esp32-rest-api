import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const API_TOKEN = process.env.API_TOKEN || "12345";

/* =============================
   AUTH
============================= */

function auth(req, res, next) {

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.substring(7)
    : "";

  if (token !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

/* =============================
   VARIABLES
============================= */

let lastTelemetry = {
  online: false,
  ts: 0,
  data: {}
};

let pendingCommand = null;

/* =============================
   RUTAS PUBLICAS
============================= */

app.get("/", (req, res) => {
  res.send("ESP32 REST API funcionando 🚀");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* =============================
   TELEMETRIA ESP32
============================= */

app.post("/telemetry", auth, (req, res) => {

  console.log("Telemetry recibida:", req.body);

  lastTelemetry = {
    online: true,
    ts: Date.now(),
    data: req.body || {}
  };

  res.json({ ok: true });
});

/* =============================
   ESTADO
============================= */

app.get("/state", auth, (req, res) => {

  res.json(lastTelemetry);

});

/* =============================
   COMANDOS
============================= */

app.post("/command", auth, (req, res) => {

  console.log("Comando recibido:", req.body);

  pendingCommand = {
    ts: Date.now(),
    cmd: req.body
  };

  res.json({ ok: true });

});

app.get("/command", auth, (req, res) => {

  if (!pendingCommand) {
    return res.json({ cmd: null });
  }

  const cmd = pendingCommand;
  pendingCommand = null;

  res.json(cmd);

});

/* =============================
   404
============================= */

app.use((req, res) => {

  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method
  });

});

/* =============================
   SERVER
============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("=================================");
  console.log("Servidor funcionando en puerto", PORT);
  console.log("=================================");

});
