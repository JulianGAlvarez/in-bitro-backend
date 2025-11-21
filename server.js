const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();     // <-- app se crea aquí, antes de usarla

app.use(cors());
app.use(express.json());

// Ruta inicial
app.get("/", (req, res) => {
    res.send("El servidor está funcionando ✔️");
});

let lastSeed = null;

// 1) Endpoint – la web obtiene la IP y datos del usuario
app.get("/userdata", async (req, res) => {

    try {
        const ipInfo = await axios.get("https://ipapi.co/json/");
        res.json({
            ip: ipInfo.data.ip,
            city: ipInfo.data.city,
            isp: ipInfo.data.org,
            country: ipInfo.data.country_name
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo datos" });
    }
});

// 2) Endpoint para recibir la semilla desde la web
app.post("/sendSeed", (req, res) => {
    lastSeed = req.body;
    console.log("Nueva semilla:", lastSeed);
    res.json({ ok: true });
});

// 3) Endpoint para Unity – obtener la última semilla
app.get("/getSeed", (req, res) => {
    res.json({
        available: lastSeed !== null,
        seed: lastSeed
    });
    lastSeed = null;
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
