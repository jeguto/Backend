const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    // Antes era String, ahora es una referencia a Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es obligatoria']
    },
    image: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
