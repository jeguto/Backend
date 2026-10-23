const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [3, 'El nombre debe tener mínimo 3 caracteres'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'El slug es obligatorio'],
        unique: true, // OJO: esto crea un indice, no es un validador
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede tener letras minúsculas, números y guiones']
    },
    description: {
        type: String,
        maxlength: [500, 'La descripción no puede pasar de 500 caracteres'],
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
