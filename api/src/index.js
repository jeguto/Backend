require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Falta JWT_SECRET en el .env');
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('Falta JWT_REFRESH_SECRET en el .env');
        }

        await connectDB();

        app.listen(PORT, () => {
            console.log('Servidor en marcha en el puerto ' + PORT);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();