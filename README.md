# Claude Web — Hub de Conocimiento CCAR-F

> Documentación en español sobre **Claude Code** y la **API de Claude**, con búsqueda full-text, ejercicios prácticos resueltos y examen de práctica para la certificación **CCAR-F** (Claude Certified Architect – Foundations).

---

## ¿Qué es esto?

Un hub editorial estático — sin backend, sin base de datos — que centraliza la documentación técnica de Claude en español, la complementa con ejercicios de arquitectura resueltos paso a paso, y la combina con un simulador de examen fiel al formato real de la certificación **Claude Certified Architect — Foundations**.

---

## Características principales

| Módulo | Descripción |
|---|---|
| **Colecciones curadas** | 15 colecciones / 27 archivos de contenido — Claude Code y API de Claude — con secciones, artículos y bloques enriquecidos (texto, código, callouts, tablas, steps, stats, comparativas) |
| **Búsqueda full-text** | Puntuación por relevancia en títulos, resúmenes y cuerpo — con debounce de 280 ms |
| **Tema claro / oscuro** | Detección automática de preferencia del sistema, alternancia persistente |
| **Ejercicios prácticos** | 4 ejercicios extensos resueltos paso a paso como los abordaría un arquitecto de soluciones senior, con código completo y una sección dedicada de errores comunes y anti-patrones por ejercicio |
| **Examen de práctica** | Pool de 265 preguntas (opción múltiple y multi-respuesta) con pesos oficiales por dominio, temporizador de 120 min e informe de resultados |

---

## Contenido cubierto

### Claude Code

Introducción, Reglas, Permisos, sistema de Hooks (más sus fundamentos de stdio), Skills, Sistema de Memoria, Subagentes, MCP y Patrones Glob.

### API de Claude

14 subsecciones: primeros pasos, modelos y versiones, tool use, RAG y búsqueda agéntica, MCP en profundidad, prefill y alternativas, referencia completa de la API, conceptos clave, guías prácticas, prompt engineering, evaluación de prompts, agentes y workflows, capacidades avanzadas (Extended Thinking, Files API, Managed Agents) y Claude en Vertex AI.

### AI Fluency

El framework 4D (*Delegation, Description, Discernment, Diligence*) del curso gratuito de Anthropic Academy, recomendado como preparación para el examen.

---

## Inicio rápido

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # previsualiza el build local
```

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

Disponible en `/practice`. Simula las condiciones reales del examen:

- **60 preguntas** aleatorias extraídas de un pool de 265, categorizado por dominio
- **Distribución ponderada** que respeta los pesos oficiales de cada área
- **Opción múltiple y multi-respuesta**, con un piso garantizado de ~22% de preguntas multi-respuesta por dominio en cada intento
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
> - **Remove the fixed iteration cap and terminate the loop exactly when `stop_reason` is "end_turn".** ✓
> - Replace the iteration cap with a token budget cap, since tokens are a more precise unit than turns.
> - Keep the text-content check but raise the iteration cap to 20 to reduce premature termination.

---

## Estructura del proyecto

```
public/
  data/                   → Archivos JSON con todo el contenido (cargados en runtime)
    content.json          → Índice maestro de colecciones
    ejercicios.json       → Los 4 ejercicios prácticos resueltos
    *.json                → Una colección por archivo
  practice/
    index.html            → Página standalone del examen (sin dependencia del bundle principal)
    examen_cca_f_en.json  → Pool de 265 preguntas del examen, agrupadas por dominio

src/
  App.jsx           → Toda la UI, ruteo, estado y renderizadores de bloques (~1060 líneas)
  searchEngine.js   → Motor de búsqueda full-text con sistema de puntuación
  styles.css        → Directivas Tailwind + propiedades CSS para tema claro/oscuro
```

---

## Stack

- **React 18** — UI
- **Vite 8** — Build tool y servidor de desarrollo
- **Tailwind CSS** — Estilos utilitarios
- **highlight.js** — Resaltado de sintaxis en bloques de código

---

## Agregar contenido

1. Crear o editar un archivo JSON en `public/data/` siguiendo el esquema de colecciones.
2. Registrarlo en `public/data/content.json`.
3. No se requiere rebuild — los archivos se cargan en runtime.

---

## Licencia

[MIT](LICENSE) — libre para usar, modificar y distribuir.
