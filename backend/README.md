# Chatbot Local Backend

API Node.js + TypeScript pensada para orquestar peticiones hacia Ollama y exponerlas via Server-Sent Events.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express (elegido por su simplicidad para SSE sin dependencias extra)
- **Lenguaje:** TypeScript estricto

## Estructura de carpetas

```
src/
  config/       -> Configuración del servidor (puertos, futuros toggles)
  constants/    -> Constantes de Ollama, modelos y headers
  clients/      -> Cliente HTTP que encapsula llamadas a Ollama
  controllers/  -> Capa HTTP (Express) y manejo de SSE
  services/     -> Lógica de negocio y orquestación
  routes/       -> Definición de rutas de Express
  utils/        -> Helpers transversales (SSE helpers)
  types/        -> Tipados compartidos
  index.ts      -> Bootstrap del servidor
```

## Scripts

- `npm run dev` – ejecuta el servidor en modo desarrollo con recarga
- `npm run build` – compila TypeScript a `dist/`
- `npm run start` – ejecuta la versión compilada
- `npm run typecheck` – valida los tipos sin emitir código
- `npm run test` – corre la suite de regresión de conocimiento y las pruebas de integridad del chunking (Jest)
- `npm run test:watch` – corre los tests en modo watch
- Para validar regresiones e integridad del knowledge, ejecuta `npm run test`. Los casos de prueba: 
  - Envían preguntas reales al endpoint `/api/chat` (utilizando un cliente simulado de Ollama) y verifican que las respuestas respeten el conocimiento.
  - Ejecutan tests unitarios sobre el chunking para detectar duplicados, pérdida de orden o violaciones de límites de tamaño.
  - Las preguntas dentro del conocimiento mencionen los términos esperados.
  - Las preguntas fuera del alcance respondan exactamente con el fallback configurado.
  - Agregar nuevas “golden questions” es tan simple como editar `tests/regression/questions.ts`.

## Variables de entorno

Crea un archivo `.env` en la raíz de `backend/` (se ignora por git) y define, por ejemplo:

```
PORT=4000
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_DEFAULT_MODEL=llama3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
KNOWLEDGE_FILE=knowledge/knowledge.md # opcional
```

Si alguna variable falta, el runtime utilizará los valores por defecto anteriores.

## Conocimiento controlado (POC RAG)

- El backend carga un archivo estático `knowledge/knowledge.md` y lo procesa mediante una **fuente** (`KnowledgeSource`), un **procesador** (normaliza texto) y un **chunker** (divide en bloques reutilizables de ~400 caracteres).
- Puedes editar el archivo o apuntar a otro usando `KNOWLEDGE_FILE`. La arquitectura está lista para soportar múltiples fuentes en el futuro.
- Si la pregunta no está cubierta por los chunks (heurística básica de palabras clave), respondemos `"No tengo información suficiente para responder esa pregunta."` sin llamar a Ollama.
- Cuando hay coincidencias, concatenamos los chunks relevantes (hoy: todos) en el prompt del sistema y reforzamos la regla de “solo responder con esta información”.
- El chunking está desacoplado, así que podrás reemplazarlo por otro algoritmo (por encabezados Markdown, tamaño distinto, etc.) o agregar embeddings más adelante.

## Probar el endpoint `/api/chat`

```bash
curl -N -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, ¿cómo estás?"}'
```

> `-N` mantiene el stream abierto para recibir los tokens SSE.

## Prerrequisitos

Antes de levantar el backend asegurate de contar con:

- **Ollama instalado y ejecutándose** localmente (`ollama serve`).
- **Modelo `llama3` descargado** en Ollama (`ollama pull llama3`).
- Node.js 18+ y pnpm/npm para instalar dependencias del backend.

## Próximos pasos

- Añadir middlewares de observabilidad y logging
- Integrar módulos RAG / memoria
- Agregar tests end-to-end para el flujo SSE
