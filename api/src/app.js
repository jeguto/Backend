const express = require('express');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Ecommerce en marcha');
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// siempre al final
app.use(notFound);
app.use(errorHandler);

module.exports = app;
