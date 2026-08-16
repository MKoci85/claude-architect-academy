# Claude Architect Academy

> Preparación completa para la certificación **Claude Certified Architect – Foundations (CCAR-F)**: documentación curada de Claude Code y la API de Claude, ejercicios de arquitectura resueltos paso a paso, y un examen de práctica fiel al formato de preguntas y la distribución por dominios publicados por Anthropic.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Idioma](https://img.shields.io/badge/idioma-espa%C3%B1ol%20%2B%20ingl%C3%A9s-brightgreen)](#)
[![Demo](https://img.shields.io/badge/demo-live-success)](https://claude-architect-academy-jet.vercel.app)

🇬🇧 [Read this in English](README.en.md)

**🔗 Sitio publicado:** [claude-architect-academy-jet.vercel.app](https://claude-architect-academy-jet.vercel.app)

---

## Índice

- [¿Qué es esto?](#qué-es-esto)
- [Características principales](#características-principales)
- [Contenido cubierto](#contenido-cubierto)
- [Cursos recomendados por Anthropic](#cursos-recomendados-por-anthropic)
- [Inicio rápido](#inicio-rápido)
- [Ejercicios prácticos](#ejercicios-prácticos)
- [Examen de práctica CCAR-F](#examen-de-práctica-ccar-f)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Stack](#stack)
- [Agregar contenido](#agregar-contenido)
- [Licencia](#licencia)

---

## ¿Qué es esto?

Un hub editorial estático — sin backend, sin base de datos — que centraliza en español la documentación técnica de Claude, la complementa con ejercicios de arquitectura resueltos paso a paso como los abordaría un arquitecto de soluciones senior, y la combina con un simulador de examen basado en el formato de preguntas y los pesos por dominio publicados por Anthropic para la certificación **Claude Certified Architect — Foundations**.

No es una traducción automática de la documentación oficial: es contenido curado, verificado activamente contra la documentación viva de Anthropic (CLI, Agent SDK, API, MCP), pensado específicamente para cerrar la brecha entre "conozco la teoría" y "puedo tomar la decisión de arquitectura correcta bajo presión de examen".

El sitio tiene un selector de idioma (ES/EN) en la barra superior. La traducción al inglés ya cubre la totalidad de las colecciones registradas y los ejercicios prácticos — ver [Estructura del proyecto](#estructura-del-proyecto).

---

## Características principales

| Módulo | Descripción |
|---|---|
| **Colecciones curadas** | 15 colecciones / 27 archivos de contenido — Claude Code y API de Claude — con secciones, artículos y bloques enriquecidos (texto, código, callouts, tablas, steps, stats, comparativas) |
| **Búsqueda full-text** | Puntuación por relevancia en títulos, resúmenes y cuerpo — con debounce de 280 ms; el índice de texto se descarga solo al primer tipeo |
| **URLs compartibles** | Routing por hash: cada artículo, colección y ejercicio tiene su propia URL, con botón atrás funcional |
| **Tema claro / oscuro** | Detección automática de preferencia del sistema, alternancia persistente |
| **Ejercicios prácticos** | 4 ejercicios extensos resueltos paso a paso como los abordaría un arquitecto de soluciones senior, con código completo y una sección dedicada de errores comunes y anti-patrones por ejercicio |
| **Examen de práctica** | Pool de 265 preguntas (opción múltiple y multi-respuesta) con pesos oficiales por dominio, temporizador de 120 min e informe de resultados |

---

## Contenido cubierto

### Claude Code

Introducción, Reglas, Permisos, sistema de Hooks (más sus fundamentos de stdio), Skills, Sistema de Memoria (Auto Memory, Auto Dream, compactación de contexto), Subagentes, MCP y Patrones Glob.

### API de Claude

14 subsecciones: primeros pasos, modelos y versiones, tool use, RAG y búsqueda agéntica, MCP en profundidad, prefill y alternativas, referencia completa de la API, conceptos clave, guías prácticas, prompt engineering, evaluación de prompts, agentes y workflows, capacidades avanzadas (Extended Thinking, Files API, Managed Agents), Claude en Vertex AI y Claude en AWS Bedrock.

### AI Fluency

El framework 4D (*Delegation, Description, Discernment, Diligence*) del curso gratuito de Anthropic Academy, recomendado como preparación para el examen — con ejercicios prácticos y proyecto guía incluidos.

---

## Cursos recomendados por Anthropic

Anthropic recomienda siete cursos gratuitos de Partner Academy como preparación para la certificación CCAR-F. Este repositorio los cubre **en su totalidad, con holgura** — no como una transcripción curso por curso, sino integrando cada tema dentro de la estructura de referencia del sitio: el contenido reemplaza al material del curso en lugar de acompañarlo, así que no vas a encontrar frases como "esta lección explica..." en ninguna parte.

| Curso oficial | Cobertura en este repo |
|---|---|
| **AI Fluency: Framework & Foundations** | Colección dedicada — el framework 4D completo (*Delegation, Description, Discernment, Diligence*) |
| **Building with the Claude API** | Las 14 subsecciones de *API de Claude* — de primeros pasos a capacidades avanzadas |
| **Claude on Google Cloud** | *Claude en Vertex AI* para lo específico de la plataforma (cliente `AnthropicVertex`, formato de IDs de modelo, disponibilidad por región), y el resto del temario — prompting, tool use, RAG, MCP, evals, agentes y workflows — ya vive en las colecciones de *API de Claude*, agnósticas de qué plataforma cloud se use |
| **Claude Code in Action** | Toda la sección *Claude Code*: Introducción, Reglas, Permisos, Hooks (con sus fundamentos de stdio), Skills, Sistema de Memoria, Subagentes, MCP y Patrones Glob |
| **Claude 101** | Colección dedicada — fundamentos de uso cotidiano de Claude |
| **Claude with Amazon Bedrock** | Colección dedicada *Claude en AWS Bedrock* |
| **Introduction to Model Context Protocol** | *MCP* para el uso práctico del protocolo y *API de Claude → MCP en profundidad* para la arquitectura host/cliente/servidor, resources y prompts |

Ningún curso queda sin cobertura. El único caso que no sigue un mapeo 1:1 curso → colección es *Claude on Google Cloud*: sus contenidos genéricos de la API (prompt evaluation, RAG, tool use, MCP, agentes) están distribuidos entre las colecciones de *API de Claude* en lugar de duplicados en una colección propia — es intencional, ya que ese material no depende de la plataforma cloud elegida.

---

## Inicio rápido

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # previsualiza el build local
```

Sin variables de entorno, sin configuración adicional: todo el contenido se sirve como JSON estático en runtime.

---

## Ejercicios prácticos

Disponible desde el botón **Ejercicios** en la navegación principal. Cuatro escenarios end-to-end, cada uno resuelto paso a paso con código completo y la justificación explícita de cada decisión de diseño:

1. **Agente multi-herramienta con lógica de escalamiento** — loop agéntico con herramientas MCP, manejo de errores estructurado (`isError`) y un hook `PreToolUse` que desvía operaciones sensibles a revisión humana de forma determinista.
2. **Configurar Claude Code para un flujo de trabajo de equipo** — jerarquías de `CLAUDE.md`, reglas por ruta en `rules/`, skills aislados con `context: fork`, MCP a nivel proyecto/usuario y cuándo plan mode aporta valor real.
3. **Pipeline de extracción de datos estructurados** — schemas JSON con campos *nullable*, loops de validación-reintento, few-shot prompting, Message Batches API y ruteo a revisión humana por confianza.
4. **Diseñar y depurar un pipeline de investigación multi-agente** — orquestación coordinador-subagentes, ejecución paralela vía `Task`, output estructurado con trazabilidad de procedencia y síntesis de fuentes en conflicto.

Cada ejercicio cierra con una sección de **errores comunes y anti-patrones a evitar** — por ejemplo, validar una regla de negocio contra el input del modelo en vez de una fuente de verdad, confundir un error de permisos con uno de política de negocio, o reimplementar a mano un mecanismo que el SDK ya resuelve de forma nativa.

---

## Examen de práctica CCAR-F

Disponible en `/practice`. Replica la logística y distribución por dominios del examen real (60 preguntas, 120 minutos, pesos oficiales); no reproduce la selección de 4-de-6 escenarios narrativos del formato real, ya que el simulador arma cada intento por dominio ponderado en vez de por escenario:

- **60 preguntas** aleatorias extraídas de un pool de 265, categorizado por dominio
- **Distribución ponderada** que respeta los pesos oficiales de cada área
- **Opción múltiple y multi-respuesta** — el simulador garantiza, como decisión pedagógica propia (no una característica documentada del examen real), un piso de ~22% de preguntas multi-respuesta por dominio en cada intento, para asegurar exposición suficiente a ese formato
- **Temporizador** de 120 minutos (2 min/pregunta)
- **Informe de rendimiento** por dominio al finalizar
- **Mapa de navegación** para saltar entre preguntas

### Dominios del examen

| Dominio | Peso |
|---|---|
| Agentic Architecture & Orchestration | 27% |
| Claude Code Configuration & Workflows | 20% |
| Prompt Engineering & Structured Output | 20% |
| Tool Design & MCP Integration | 18% |
| Context Management & Reliability | 15% |

### Formato real del examen: 6 escenarios, 4 al azar

El examen real de Anthropic no agrupa las preguntas por dominio — las organiza en **6 escenarios de producción**, cada uno con ~10 preguntas integradas que comparten un mismo hilo narrativo y tocan varios dominios a la vez. Cada candidato recibe **4 de los 6 escenarios, elegidos al azar**: cualquier escenario que no se haya repasado carga el riesgo de costar el 25% del examen.

| # | Escenario | Qué cubre |
|---|---|---|
| 1 | Customer Support Resolution Agent | Cuándo escalar vs. resolver, loops agénticos |
| 2 | Code Generation with Claude Code | CLAUDE.md, comandos personalizados, plan mode |
| 3 | Multi-Agent Research System | Coordinador-subagentes, orquestación paralela/secuencial |
| 4 | Developer Productivity with Claude | MCP, herramientas integradas, automatización |
| 5 | Claude Code for CI/CD | Revisiones automatizadas, generación de tests, feedback en PRs |
| 6 | Structured Data Extraction | Procesamiento de documentos con validación JSON |

Por esto el pool de 265 preguntas de este simulador está etiquetado internamente por escenario (campo `scenario` en cada pregunta) además de por dominio — para permitir, a futuro, auditar cobertura por escenario incluso si el simulador arma cada intento por peso de dominio.

### Logística del examen real

- **60 preguntas**, opción múltiple y multi-respuesta, **120 minutos** (2 min/pregunta)
- **Puntaje de aprobación**: 720 sobre una escala de 100–1.000
- **Costo**: USD 125 por intento
- **Plataforma**: Pearson VUE (online supervisado o centro de examen), inscripción vía Anthropic Partner Academy
- **Vigencia**: 12 meses desde que se otorga la credencial, con renovación gratuita no supervisada si se hace a tiempo
- **Períodos de espera tras un intento fallido**: 14 días (1er intento), 30 días (2do), 90 días (3ro) — máximo 4 intentos por período móvil de 12 meses

### Ejemplos de preguntas

El banco de preguntas está en inglés (formato del examen real) y evalúa criterio de decisión, no memorización. Dos ejemplos representativos:

**Opción única** — *Agentic Architecture and Orchestration*
> A multi-agent research system has a document subagent that finds conflicting figures between a government report (GDP growth: 2.1%) and an industry dataset (GDP growth: 3.4%) for the same quarter. The subagent has completed its analysis task. What should it do with this conflict before returning its result?
> - Use the government figure since official sources are generally more rigorous, and continue without flagging it.
> - Average both values to produce a neutral figure (2.75%) and document the methodology.
> - **Explicitly report the conflict to the orchestrator, including both values and their sources, without resolving it.** ✓
> - Omit the conflicting metric and proceed with the remaining analysis.

**Multi-respuesta** — *Context Management and Reliability*
> A team is debugging an agentic loop that sometimes terminates prematurely and sometimes spins through dozens of unproductive tool calls. The current implementation stops as soon as the assistant's response contains any plain text content, and separately hard-caps execution at 5 iterations regardless of `stop_reason`. Which two changes correctly align this loop with the intended pattern? *(select 2)*
> - **Stop checking for text content as a completion signal — a valid `tool_use` turn can legitimately include explanatory text alongside the tool call.** ✓
> - **Make `stop_reason === "end_turn"` the primary termination signal, while keeping a generous iteration cap in place as a safety-net fallback against runaway loops.** ✓
> - Replace the iteration cap with a token budget cap, since tokens are a more precise unit than turns.
> - Keep the text-content check but raise the iteration cap to 20 to reduce premature termination.

---

## Estructura del proyecto

```
public/
  data/
    es/                   → Contenido completo en español (fuente de verdad)
      content.json        → Índice maestro de colecciones (ES)
      index.json          → [generado] metadata para la carga inicial (~21KB gz)
      search-index.json   → [generado] texto para el buscador, se pide en lazy (~135KB gz)
      ejercicios.json     → Los 4 ejercicios prácticos resueltos, en español
      *.json               → Una colección por archivo
    en/                   → Traducción al inglés
      content.json        → Índice maestro (EN) — lista las colecciones/items traducidos
      exercises.json      → Los 4 ejercicios prácticos, en inglés (no registrado en content.json, igual que su par en es/)
      *.json               → Un archivo por cada colección traducida, con nombre en inglés (ej. introduccion.json → introduction.json)
  practice/
    index.html            → Página standalone del examen (sin dependencia del bundle principal, interfaz en inglés)
    examen_cca_f_en.json  → Pool de 265 preguntas del examen, agrupadas por dominio

src/
  App.jsx           → Shell de la app: compone los hooks y rutea entre las vistas principales
  hooks/useHashRoute.js → Routing por hash (URLs compartibles, botón atrás)
  searchEngine.js   → Motor de búsqueda full-text con sistema de puntuación
  styles.css        → Directivas Tailwind + propiedades CSS para tema claro/oscuro
  i18n/, hooks/, constants/, utils/, data/, components/
                    → UI, estado, i18n y renderizadores de bloques, separados por responsabilidad
                      (ver CLAUDE.md para el detalle archivo por archivo)
```

El selector de idioma (botón ES/EN en la barra superior) alterna qué carpeta (`data/es/` o `data/en/`) se usa para el fetch de `content.json` y de cada colección. Si una colección o sub-item no tiene su archivo equivalente en `en/`, **no aparece** en el modo inglés — no hay fallback silencioso al español ni placeholders.

---

## Stack

- **React 18** — UI
- **Vite 7** — Build tool y servidor de desarrollo
- **Tailwind CSS** — Estilos utilitarios
- **highlight.js** — Resaltado de sintaxis en bloques de código

No hay backend ni base de datos: todo se resuelve fetcheando JSON estático, lo que hace que agregar o corregir contenido sea tan simple como editar un archivo y refrescar la página. El contenido se carga en tres niveles — metadata al arrancar (~21KB gz), el texto del buscador solo si el usuario busca, y el cuerpo de cada artículo recién al abrirlo — así la primera carga no arrastra los ~3,7MB de contenido completo.

Los dos índices (`index.json` y `search-index.json`) se generan solos al arrancar el dev server o al hacer build; no se editan a mano ni se versionan.

### Accesibilidad

Jerarquía real de encabezados, landmarks (`<main>`, `<header>`, `<nav>`), skip link, foco visible y `prefers-reduced-motion` respetado.

---

## Agregar contenido

1. Crear o editar un archivo JSON en `public/data/es/` siguiendo el esquema de colecciones (ver [CLAUDE.md](CLAUDE.md) para el schema completo y las convenciones por archivo) — español es la fuente de verdad, se escribe ahí primero.
2. Registrarlo en `public/data/es/content.json`.
3. *(Opcional)* Traducir al inglés: crear `public/data/en/<nombre-en-inglés>.json` (el nombre del archivo también se traduce, no se reutiliza el nombre en español) con idéntico schema y estructura (mismos `id`, mismo orden de bloques), traduciendo solo texto — nunca código, IDs de modelo ni flags de CLI. Registrarlo en `public/data/en/content.json`. Si se omite este paso, esa colección simplemente no aparece en modo inglés — es el comportamiento esperado, no un bug.
4. No se requiere paso manual: los índices (`index.json` y `search-index.json`) se regeneran al arrancar el dev server, al guardar un JSON de contenido con el server andando, o con `npm run build`.

Antes de escribir contenido nuevo sobre CLI de Claude Code, Agent SDK o protocolo MCP, verificá la sintaxis exacta contra documentación viva en vez de recordarla de memoria — ver las convenciones de precisión técnica en `CLAUDE.md`.

---

## Licencia

[MIT](LICENSE) — libre para usar, modificar y distribuir.
