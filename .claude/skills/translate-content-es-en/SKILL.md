---
name: translate-content-es-en
description: Traduce contenido de public/data/es/ a public/data/en/ en el proyecto claude-wiki, siguiendo el patrón exacto que ya usa el repo (nombres de archivo en inglés, mismos ids, mismo esquema, registro en en/content.json). Usar siempre que el usuario pida "traducir X al inglés", "seguir con la traducción", "agregar la versión en inglés de este artículo/colección", o cuando esté agregando contenido nuevo en es/ y pregunte si conviene traducirlo ya. También aplica si el usuario reporta que un artículo "no aparece en modo inglés" — normalmente falta el archivo en/ o su entrada en en/content.json.
---

# Traducir contenido es/ → en/ en claude-wiki

`public/data/en/` es parcial por diseño: no hay fallback a español. Si falta el archivo o su
registro en `en/content.json`, la colección simplemente no aparece en modo inglés — sin error.
Por eso conviene seguir siempre los mismos pasos, en orden.

## 1. Verificar antes de traducir
Buscá si ya existe equivalente en `en/` (por `id`, no por nombre de archivo — el nombre cambia
entre idiomas). Si existe, es una actualización, no una traducción nueva. Verificá también que
el tema no esté ya cubierto por otro archivo `en/` (mismo criterio de "extender, no duplicar"
que aplica en `es/`).

## 2. Nombre de archivo en inglés, id sin tocar
El archivo se renombra al inglés real (`introduccion.json` → `introduction.json`,
`sistema-de-memoria.json` → `memory-system.json`; si ya es un nombre en inglés como
`api-vertex.json`, se mantiene). Los `id` internos (colección, artículos, etc.) quedan
**idénticos** a los del `es/` — son claves estructurales, no texto.

## 3. Qué traducir y qué nunca tocar
Traducir solo texto: `title`, `summary`, `description`, contenido de bloques `text`, labels,
callouts, steps. Nunca traducir: código (`type: "code"`), ids de modelos, flags de CLI, nombres
de hooks/métodos/parámetros técnicos. Si no estás seguro de un término técnico en inglés, no lo
adivines — verificalo con el agente `claude-code-guide` o el skill `claude-api`.

## 4. Copiar la estructura exacta
Mismo orden y mismos `id` en `sections` → `articles` → `subsections` → `blocks`. Para bloques con
variantes, replicá la que usa el `es/` original sin mezclar:
- `compare`: `{"left": {"head","rows"}}` o `{"left": {"label","items"}}` — copiá la que ya usa el archivo.
- `callout`: el campo de variante puede ser `"style"`, `"variant"`, `"kind"`, o ninguno — mirá el original.
- `stats`: siempre `{"value","label"}`, nunca `{"number","label"}`.

En la duda, copiá el bloque entero y solo reemplazá el texto.

## 5. Registrar en en/content.json
`es/content.json` y `en/content.json` son índices independientes. Agregá la entrada espejo:
mismo tipo (`file` simple o `isSuper` con `items`), `"file"` apuntando al nombre en inglés,
título/descripción traducidos, mismo orden relativo. Si es `isSuper`, cada item necesita su
propia entrada.

## Caso especial: ejercicios.json
`es/ejercicios.json` no se registra en `content.json` — el botón "Ejercicios"/"Exercises"
(`goExercises` en `App.jsx`) lo fetchea por path directo, no vía el índice de colecciones. Si se
traduce, el archivo va en `public/data/en/exercises.json` (mismo nombre traducido al inglés que
cualquier otro archivo), pero **no se registra en `en/content.json`** — no lleva entrada de
colección, igual que el original en `es/`. `goExercises` ya intenta `en/exercises.json` primero en
modo inglés y cae a `es/ejercicios.json` si no existe, así que no hace falta tocar código para
traducirlo, solo crear el archivo con la misma estructura de ejercicios que el original.

## Verificación final
JSON válido en ambos archivos, ids coinciden nivel por nivel con el `es/` original, nada técnico
quedó traducido por error, y la colección se ve bien en modo inglés corriendo `npm run dev`
(un id mal copiado puede dar página en blanco sin error de build).
