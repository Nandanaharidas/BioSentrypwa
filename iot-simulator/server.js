const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'biosentry123';

// Basic Auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="BioSentry IoT"');
        return res.status(401).json({ error: 'Authentication required' });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user === AUTH_USERNAME && pass === AUTH_PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="BioSentry IoT"');
        return res.status(401).json({ error: 'Invalid credentials' });
    }
};

// Simulated state
let metrics = {
    temp: 36.5,
    pressure: 120,
    o2: 98,
    skin_conductance: 0.4,
};

// Function to jitter metrics slightly to simulate real-time data
const jitter = () => {
    metrics.temp = +(metrics.temp + (Math.random() - 0.5) * 0.2).toFixed(2);
    metrics.pressure = Math.round(metrics.pressure + (Math.random() - 0.5) * 2);
    metrics.o2 = Math.min(100, Math.max(90, Math.round(metrics.o2 + (Math.random() - 0.5))));
    metrics.skin_conductance = +(metrics.skin_conductance + (Math.random() - 0.5) * 0.05).toFixed(2);
};

// Update metrics every second
setInterval(jitter, 1000);

app.get('/metrics', authenticate, (req, res) => {
    console.log(`[IoT-Simulator] Serving metrics to authenticated user:`, metrics);
    res.json({
        ...metrics,
        timestamp: Date.now()
    });
});

app.listen(port, () => {
    console.log(`BioSentry IoT Simulator listening at http://localhost:${port}`);
});

