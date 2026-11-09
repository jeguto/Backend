const mongoose = require('mongoose');

// Guarda los refresh tokens (solo su hash, nunca el token en claro)
const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    // Todos los tokens que nacen de un mismo login comparten familia.
    // Si se detecta reutilizacion se revoca la familia entera.
    family: {
        type: String,
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    replacedByHash: {
        type: String,
        default: null
    }
}, { timestamps: true });

// MongoDB borra solo los documentos caducados (TTL)
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Token', tokenSchema);
