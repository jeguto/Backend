# E-commerce API (Sesión 6)

API REST hecha con Node.js, Express y MongoDB (Mongoose) para la práctica de Desarrollo Web Full Stack.

Recursos implementados: **productos**, **categorías** y **usuarios**.

> Los endpoints de usuarios todavía no tienen JWT ni roles, así que solo se deben usar en local y con datos ficticios. No desplegar.

## Estructura

```
MO/
├── api/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/   (product, category, user)
│   │   ├── services/      (product, category, user)
│   │   ├── routes/        (product, category, user)
│   │   ├── models/        (Producto, Category, User)
│   │   ├── middleware/errorHandler.js
│   │   ├── utils/         (AppError, helpers)
│   │   ├── app.js
│   │   └── index.js
│   ├── postman/           (colección y entorno)
│   ├── .env.example
│   └── package.json
├── Docker/docker-compose.yml
└── docs/
```

## Cómo ejecutarlo

1. Arrancar MongoDB con Docker:

   ```bash
   cd Docker
   docker compose up -d
   docker compose ps
   ```

2. Configurar las variables de entorno. Copiar `.env.example` a `.env` y poner los datos de MongoDB (los mismos que el `docker-compose.yml`):

   ```
   MONGO_URI=mongodb://admin:1234@localhost:27017/ecommerce?authSource=admin
   PORT=3000
   ```

3. Instalar dependencias y arrancar:

   ```bash
   cd api
   npm install
   npm run dev
   ```

   El servidor queda en http://localhost:3000

## Endpoints

| Método | Endpoint | Operación |
|--------|----------|-----------|
| POST | /api/products | Crear producto |
| GET | /api/products | Listar productos |
| GET | /api/products/:id | Consultar producto |
| PUT | /api/products/:id | Modificar producto |
| DELETE | /api/products/:id | Eliminar producto |
| POST | /api/categories | Crear categoría |
| GET | /api/categories | Listar categorías |
| GET | /api/categories/:id | Consultar categoría |
| PUT | /api/categories/:id | Modificar categoría |
| DELETE | /api/categories/:id | Eliminar categoría (409 si tiene productos) |
| POST | /api/users | Crear usuario |
| GET | /api/users | Listar usuarios |
| GET | /api/users/:id | Consultar usuario |
| PUT | /api/users/:id | Modificar usuario |
| DELETE | /api/users/:id | Desactivar usuario (`active=false`) |

### Filtros, orden y paginación (categorías y usuarios)

- `active=true|false`
- `name=texto` (busca por coincidencia parcial, sin distinguir mayúsculas)
- `sort=name`, `sort=-createdAt` (el `-` indica orden descendente). Campos permitidos: `name`, `slug`/`email`, `createdAt`
- `page` y `limit` (enteros positivos, `limit` máximo 50, por defecto 10)

Ejemplo de respuesta:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

## Errores

Todos los errores salen con el mismo formato (middleware global en `middleware/errorHandler.js`):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos no son válidos",
    "details": [{ "field": "name", "message": "El nombre es obligatorio" }]
  }
}
```

| Código HTTP | Cuándo |
|-------------|--------|
| 200 / 201 / 204 | Correcto / creado / eliminado |
| 400 | ID inválido, JSON roto, query params incorrectos, campos no permitidos |
| 404 | Recurso o ruta inexistente |
| 409 | Email o slug duplicado, categoría con productos |
| 422 | Error de validación (campo obligatorio, formato, contraseña corta...) |
| 500 | Error inesperado (no se muestra la traza) |

## Contraseñas

La contraseña se recibe en el campo `password` (mínimo 12 caracteres), se transforma con **bcrypt** y solo se guarda `passwordHash`. El hash nunca se devuelve en las respuestas. `role` siempre se crea como `client` y no se puede enviar desde el body.

## Postman

1. Importar `api/postman/ecommerce.postman_collection.json` (colección **Ecommerce API**).
2. Importar `api/postman/ecommerce_local.postman_environment.json` (entorno **Ecommerce Local**, `baseUrl=http://localhost:3000`).
3. Seleccionar el entorno **Ecommerce Local** arriba a la derecha.
4. Ejecutar las carpetas en orden (Categories → Products → Users), una a una o con el Collection Runner. Las peticiones guardan los IDs en variables de la colección y llevan tests automáticos.

La colección no contiene secretos, solo datos ficticios.
