# Proyecto Integrador 2 — Blog API

API REST construida con **Node.js + Express + PostgreSQL** que gestiona autores, posts y comentarios.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x          |
| npm         | 9.x           |
| PostgreSQL  | 14.x          |

---

## Instalación y puesta en marcha

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/proyecto-integrador-2.git
cd proyecto-integrador-2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 4. Crear la base de datos en PostgreSQL
createdb blog_db   # o desde psql: CREATE DATABASE blog_db;

# 5. Ejecutar el script SQL (crea tablas e inserta datos de ejemplo)
psql -U postgres -d blog_db -f setup.sql

# 6. Iniciar el servidor
npm start          # producción
npm run dev        # desarrollo con hot-reload (nodemon)
```

El servidor queda disponible en `http://localhost:3000`.

---

## Documentación interactiva (Swagger UI)

Una vez iniciado el servidor, abre en el navegador:

```
http://localhost:3000/api-docs
```

---

## Endpoints disponibles

### Authors

| Método | Ruta             | Descripción                        |
|--------|------------------|------------------------------------|
| GET    | /authors         | Listar todos los autores           |
| GET    | /authors/:id     | Obtener autor por ID               |
| POST   | /authors         | Crear nuevo autor                  |
| PUT    | /authors/:id     | Actualizar autor                   |
| DELETE | /authors/:id     | Eliminar autor (cascade)           |

### Posts

| Método | Ruta                      | Descripción                              |
|--------|---------------------------|------------------------------------------|
| GET    | /posts                    | Listar todos los posts                   |
| GET    | /posts/:id                | Obtener post por ID                      |
| GET    | /posts/author/:authorId   | Posts de un autor con detalle del autor  |
| POST   | /posts                    | Crear nuevo post                         |
| PUT    | /posts/:id                | Actualizar post                          |
| DELETE | /posts/:id                | Eliminar post                            |

### Comments *(Extra credit)*

| Método | Ruta              | Descripción                              |
|--------|-------------------|------------------------------------------|
| GET    | /comments         | Listar comentarios (filtrar con ?post_id)|
| GET    | /comments/:id     | Obtener comentario por ID                |
| POST   | /comments         | Crear comentario                         |
| DELETE | /comments/:id     | Eliminar comentario                      |

---

## Ejemplos de uso con curl

```bash
# Listar autores
curl http://localhost:3000/authors

# Crear autor
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@example.com","bio":"Developer"}'

# Crear post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi post","content":"Contenido...","author_id":1,"published":true}'

# Posts de un autor
curl http://localhost:3000/posts/author/1

# Crear comentario
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{"body":"Gran artículo!","post_id":1,"author_id":2}'

# Comentarios de un post
curl "http://localhost:3000/comments?post_id=1"
```

---

## Tests

```bash
npm test              # ejecutar todos los tests
npm run test:coverage # con reporte de cobertura
```

Los tests usan **Jest + Supertest** y mockean el pool de PostgreSQL, por lo que **no necesitan una base de datos real** para correr.

---

## Despliegue en Railway

1. Crear un proyecto en [Railway](https://railway.app).
2. Agregar un servicio **PostgreSQL** desde el catálogo de Railway.
3. Conectar el repositorio de GitHub al proyecto.
4. En **Variables**, copiar el valor de `DATABASE_URL` que Railway genera automáticamente (apunta a la DB de Railway).
5. Agregar las demás variables: `NODE_ENV=production`, `PORT=3000`.
6. Railway detecta `npm start` automáticamente.
7. Una vez desplegado, ejecutar el `setup.sql` desde la consola de Railway o con `psql $DATABASE_URL -f setup.sql`.

---

## Estructura del proyecto

```
proyecto-integrador-2/
├── src/
│   ├── app.js                  # Config Express (exportado para tests)
│   ├── server.js               # Punto de entrada HTTP
│   ├── db/
│   │   └── pool.js             # Pool de conexión PostgreSQL
│   ├── routes/
│   │   ├── authors.js          # Rutas + validaciones de authors
│   │   ├── posts.js            # Rutas + validaciones de posts
│   │   └── comments.js         # Rutas + validaciones de comments
│   ├── services/
│   │   ├── authorsService.js   # Consultas SQL de authors
│   │   ├── postsService.js     # Consultas SQL de posts
│   │   └── commentsService.js  # Consultas SQL de comments
│   └── middlewares/
│       └── errorHandler.js     # Middleware global de errores
├── tests/
│   ├── setup.js                # Mock del pool de PG
│   ├── authors.test.js
│   ├── posts.test.js
│   └── comments.test.js
├── docs/
│   └── openapi.yaml            # Especificación OpenAPI 3.0
├── setup.sql                   # Script SQL (CREATE TABLE + seed)
├── .env.example
├── .gitignore
└── package.json
```

---

## Decisiones técnicas

- **`pg.Pool`** sobre `pg.Client`: el pool reutiliza conexiones y maneja reconexiones automáticamente.
- **Consultas parametrizadas** (`$1, $2`): previenen SQL injection en todos los servicios.
- **Separación routes/services**: las rutas solo validan y delegan; los services contienen únicamente lógica SQL.
- **`app.js` vs `server.js`**: separar la app del listener permite que supertest inyecte la app sin abrir un puerto real.
- **CASCADE en FK**: al borrar un author se eliminan automáticamente sus posts y comentarios; al borrar un post, sus comentarios.
- **`/posts/author/:authorId` antes de `/posts/:id`**: evita que Express interprete "author" como un ID numérico.

---

## Prompts de IA utilizados

Durante el desarrollo se usó IA como apoyo para:

1. **Estructura inicial del proyecto**: *"Genera la estructura de carpetas para una API REST Node.js + Express con PostgreSQL siguiendo la separación routes/services/db."*
2. **Consulta SQL con JOIN**: *"Escribe una query PostgreSQL parametrizada que devuelva posts con los datos del autor usando json_build_object."*
3. **Configuración de Jest con mocks**: *"¿Cómo mockeo un módulo de pool de pg en Jest para que los tests no necesiten una base de datos real?"*
4. **OpenAPI YAML**: *"Genera la spec OpenAPI 3.0 para estos endpoints con sus schemas de request y response."*

En todos los casos se revisó y adaptó el output al contexto del proyecto.
