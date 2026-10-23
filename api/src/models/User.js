const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [2, 'El nombre debe tener mínimo 2 caracteres'],
        maxlength: [100, 'El nombre no puede pasar de 100 caracteres'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true, // indice unico (no es un validador)
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email incorrecto']
    },
    passwordHash: {
        type: String,
        required: true,
        select: false // no sale en las consultas
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        // Por si acaso: el hash nunca sale en un JSON
        transform: (doc, ret) => {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('User', userSchema);
