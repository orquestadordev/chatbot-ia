# Chatbot Local

Repositorio para un chatbot local basado en Ollama. Actualmente solo incluye el backend Node.js encargado de exponer un endpoint SSE `/api/chat` que reenvía tokens desde Ollama hacia el cliente.

````markdown
# Chatbot Local

Repositorio para un chatbot local basado en Ollama. Actualmente solo incluye el backend Node.js encargado de exponer un endpoint SSE `/api/chat` que reenvía tokens desde Ollama hacia el cliente.

## Carpetas

- `backend/` – API Node.js + TypeScript (Express) que orquesta peticiones a Ollama y transmite tokens vía Server-Sent Events.
- `ui/` – reservada para la interfaz futura (aún no implementada).

## Cómo ejecutar el backend

```bash
cd backend
npm install
npm run dev
```

El servidor arrancará en `http://localhost:4000` (configurable con `PORT`).

## Estado actual

- ✅ API `/api/chat` con validación básica, SSE y forward de streaming desde Ollama
- 🚧 Pendiente: construir la UI, agregar observabilidad y RAG

## Requisitos previos

- Node.js 18+
- Ollama instalado y corriendo manualmente con `ollama serve` en una terminal aparte (`http://127.0.0.1:11434`).
- Modelo `llama3` descargado localmente (`ollama pull llama3`).
- El backend **no** inicia Ollama automáticamente: asegurate de que el servicio esté arriba antes de `npm run dev`.

````
