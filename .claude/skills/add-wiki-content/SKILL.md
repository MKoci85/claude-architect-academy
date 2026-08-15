---
name: add-wiki-content
description: >
  How to add, extend, or edit content in this claude-web knowledge hub — new
  topics, articles, sections, cards, callouts, or CCAR-F exam questions under
  public/data/*.json. Use this whenever asked to write a new collection or
  article, extend an existing one with new material, turn a source (course,
  PDF, docs page, user notes) into site content, or decide whether something
  needs an English translation. Covers the Spanish-first workflow, the
  es/en translation decision, and the voice and fact-verification rules this
  content has to follow — not the JSON schema or block-type mechanics, which
  live in this repo's CLAUDE.md and are only referenced here, not repeated.
---

# Agregar contenido a la wiki

Esta skill cubre el *proceso* de agregar contenido nuevo a `public/data/`: en
qué orden trabajar, cómo decidir si se traduce, y con qué voz y nivel de
verificación escribir. Para el schema JSON, los tipos de bloque, las
convenciones de `compare`/`callout` por archivo, y la regla de nunca inventar
sintaxis de CLI/SDK/MCP, leé la sección **"Adding content"** de `CLAUDE.md` en
la raíz del repo — esa parte es estructural y no se repite acá.

## Paso 0 — Antes de escribir una sola línea

Grepeá las colecciones `es/api-*.json`, `permisos.json`, `mcp.json`,
`ejercicios.json` existentes para el mismo tema. Si ya está cubierto, extendé
ese archivo (una subsección o bloque nuevo) en lugar de escribir una colección
paralela — incluso si quedaría prolija. `CLAUDE.md` explica cuándo sí se
justifica una card nueva en `content.json`.

## Paso 1 — Español primero, siempre

`public/data/es/` es la fuente de verdad de este proyecto. Todo contenido
nuevo se escribe ahí primero, siguiendo el schema de colección/artículo/bloque
documentado en `CLAUDE.md`, y se registra en `es/content.json`.

No escribas directamente en `en/` sin que exista ya el equivalente en `es/` —
la carpeta inglesa es una traducción derivada, nunca un original.

## Paso 2 — Decidí si corresponde traducir al inglés

`public/data/en/` es **parcial por diseño**: solo existen ahí los archivos que
alguien efectivamente tradujo, más un `en/content.json` que lista únicamente
esas entradas. No hay fallback a español ni placeholder — una colección sin
archivo en inglés simplemente no aparece cuando el sitio está en modo inglés.
Eso es el comportamiento esperado, no un bug a evitar.

Por eso, cada vez que agregues o edites contenido en `es/`, evaluá
explícitamente si conviene traducirlo — no lo saltees por default, pero
tampoco lo conviertas en un paso obligatorio si el contenido es efímero o de
bajo valor para un lector en inglés. Si decidís traducir:

- Creá el archivo en `public/data/en/<nombre-en-inglés>.json` — **traducí
  también el nombre de archivo**, nunca arrastres el nombre en español
  (`es/api-vertex.json` → sigue siendo `api-vertex.json` porque ya es un
  nombre en inglés; `es/introduccion.json` → `en/introduction.json`).
- Mantené el mismo schema y estructura: mismos `id`s, mismos tipos de bloque,
  mismo orden de secciones/artículos. Solo se traducen los campos de texto —
  nunca código, IDs de modelo, ni flags de CLI.
- Registralo en `en/content.json`, reflejando la entrada de `es/content.json`
  pero apuntando al archivo en inglés.
- Si el archivo editado ya tenía traducción existente, aplicá el mismo cambio
  ahí para no dejar las dos versiones desincronizadas estructuralmente.

## Paso 3 — Cómo escribir el contenido

Estas reglas de voz aplican a ambos idiomas y vienen de haber tenido que
desarmar contenido ya publicado que las rompía (una card sobre un curso de
Vertex AI resultó ~60-100% redundante con contenido de API existente y usaba
un framing de "curso"/"lección" que no encaja en el resto del sitio).

1. **Escribí como referencia directa y autocontenida — nunca como comentario
   sobre una fuente externa.** Nunca escribas "la lección", "esta lección",
   "el curso enseña que...", ni callouts tipo "ya cubierto en [otra
   sección]" como relleno dentro del contenido publicado. El sitio reemplaza
   al material externo, no lo acompaña. Si el dato de una fuente necesita
   corrección o cita, nombrala una vez de forma directa ("Anthropic documenta
   X como...") en lugar de estructurar el artículo entero alrededor de "lo
   que decía la fuente".

2. **Enriquecé con concisión, no transcribas.** Al convertir material fuente
   en artículo, sumá detalle preciso de la documentación oficial solo donde
   aclare algo que la fuente da por sentado o pasa por alto — como callouts
   cortos, no relleno. No incluyas instrucciones paso a paso de
   instalación/setup: este proyecto es una referencia conceptual, no un
   tutorial.

3. **Verificá cualquier afirmación heredada antes de propagarla.** No repitas
   como verdad un dato que ya está en el JSON del repo sin chequearlo,
   especialmente si es load-bearing (precisión de examen CCAR-F) o si el
   usuario lo pone en duda. Usá WebSearch/WebFetch contra documentación
   oficial (platform.claude.com), o el agente `claude-code-guide` / la skill
   `claude-api`, para confirmar — y corregí el dato en su archivo de origen
   también, no solo en la copia nueva. Esto aplica también a código que el
   usuario pega como punto de partida: un interceptor casero haciendo de
   proxy de un hook real del Claude Agent SDK, o una taxonomía de errores de
   3 categorías cuando la guía del examen define 4 — verificá y corregí en
   vez de transcribir tal cual.

4. **Si una técnica quedó oficialmente superada pero el material fuente
   todavía la enseña, mantenela reconocible — no la reduzcas a una mención al
   pasar.** Este sitio también es prep para el examen CCAR-F (ver `CLAUDE.md`),
   y el examen se apoya en el contenido del curso oficial de Partner Academy
   de Anthropic. Si una fuente enseña un patrón (p. ej. el workaround
   `batch_tool` pre-Claude-4 para llamadas paralelas a herramientas) que ya
   fue reemplazado por un default mejor, no lo bajes a una nota al pie: incluí
   suficiente detalle concreto (la forma del schema, el mecanismo) para que
   un lector lo reconozca si una pregunta de examen lo describe, dejando
   igual de claro cuál es el enfoque moderno/correcto y por qué el anterior ya
   no hace falta. Corregir la precisión y preservar el reconocimiento para el
   examen son requisitos simultáneos, no un trade-off.

## Cuándo aplicar esto

Cada vez que te pidan agregar una colección, card, artículo o pregunta de
examen nueva a `public/data/`, sea la fuente un curso, documentación oficial,
un PDF que pegó el usuario (p. ej. la guía del examen CCAR-F), o un gap
detectado en el sitio. Empezá por el Paso 0 de esta skill y la sección
"Adding content" de `CLAUDE.md` para las reglas estructurales; usá esta skill
para el orden de trabajo, la decisión de traducción, y la voz.
