# Base de conocimiento del chatbot

Esta información es la única fuente autorizada para el modelo.

## Producto
- El chatbot local se llama **AndesGPT**.
- AndesGPT se ejecuta exclusivamente en equipos macOS con Ollama instalado.

## Capacidades
- AndesGPT puede responder preguntas sobre la arquitectura del backend Node.js provisto.
- El backend expone un endpoint POST `/api/chat` que transmite respuestas vía SSE.

## Limitaciones
- Si una pregunta no está cubierta por este documento, la respuesta debe ser: "No tengo información suficiente para responder esa pregunta.".

# Base de Conocimiento del Sistema

Este documento contiene la ÚNICA información que el asistente puede utilizar para responder.

---

## Información técnica del proyecto

- El backend está desarrollado en Node.js.
- El backend actúa como intermediario entre el cliente y una instancia local de Ollama.
- Ollama se ejecuta localmente y expone una API HTTP en el puerto 11434.
- El modelo utilizado puede configurarse dinámicamente mediante la request.
- El endpoint principal del backend es `/chat`.
- El backend soporta respuestas en streaming utilizando Server-Sent Events (SSE).

---

## Restricciones del asistente

- El asistente NO tiene acceso a internet.
- El asistente NO debe utilizar conocimiento general.
- El asistente SOLO puede usar la información contenida en este archivo.
- Si una respuesta no se encuentra explícitamente aquí, debe indicarlo claramente.

---

## Información de arquitectura

- El proyecto sigue principios de Programación Orientada a Objetos.
- Se busca respetar principios SOLID.
- La lógica de negocio no debe estar acoplada a los controladores.
- La arquitectura está pensada para evolucionar a un sistema RAG más avanzado en el futuro.

---

Fin del documento.