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
    try {
        let seed = req.body;

        // Obtener IP del cliente que envía la semilla
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Obtener país usando geoip-lite
        const geo = geoip.lookup(clientIP);

        // Agregar ip y country a la semilla
        seed.ip = clientIP;
        seed.country = geo ? geo.country : "Desconocido";

        lastSeed = seed;

        console.log("Nueva semilla recibida:", lastSeed);
        res.json({ ok: true });
    } catch (err) {
        console.error("Error procesando la semilla:", err);
        res.status(500).json({ error: "Error procesando la semilla" });
    }
});

// 3) Endpoint para Unity – obtener la última semilla
app.get("/getSeed", (req, res) => {
    if (!lastSeed) {
        return res.json({ available: false, seed: null });
    }

    res.json({
        available: true,
        seed: lastSeed
    });

    // Resetear lastSeed para que no se envíe dos veces
    lastSeed = null;
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
