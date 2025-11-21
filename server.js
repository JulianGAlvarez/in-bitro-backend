const express = require("express");
const axios = require("axios");
const cors = require("cors");
const geoip = require("geoip-lite"); // Para obtener país desde IP

const app = express();

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
    console.log("Nueva semilla recibida:", lastSeed);
    res.json({ ok: true });
});

// 3) Endpoint para Unity – obtener la última semilla
app.get("/getSeed", (req, res) => {
    if (!lastSeed) {
        return res.json({ available: false, seed: null });
    }

    // Obtener IP del cliente que hace la petición
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Lookup de país usando geoip-lite
    const geo = geoip.lookup(clientIP);

    // Añadir ip y country a la semilla
    const seedWithInfo = {
        ...lastSeed,
        ip: clientIP,
        country: geo ? geo.country : "Desconocido"
    };

    res.json({
        available: true,
        seed: seedWithInfo
    });

    // Resetear lastSeed
    lastSeed = null;
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
