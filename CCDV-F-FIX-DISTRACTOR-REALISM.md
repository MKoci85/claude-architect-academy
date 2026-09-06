# Prompt: subir el realismo de los distractores en el banco CCDV-F

Este archivo es un prompt autocontenido para pasarle a un agente distinto (uno
por dominio), de forma que cada uno trabaje sin el contexto de la conversación
que detectó el problema. Copiá la sección "Contexto y tarea" completa +
la fila de la tabla del dominio que le toque a ese agente.

**Importante sobre concurrencia:** todos los dominios viven en el mismo
archivo JSON. No corras dos agentes en paralelo sobre este archivo — se van
a pisar las ediciones entre sí. Corré los agentes de a uno (podés lanzar el
siguiente apenas termine el anterior), o usá un worktree/checkout aislado por
agente y mergeá manualmente al final.

## Contexto y tarea

Trabajás en el repo `claude-web` (React + Vite, wiki de documentación de
Claude). El archivo `public/practice2/examen_ccdv_f_en.json` contiene el
banco de preguntas de práctica del examen **CCDV-F** (Claude Certified
Developer – Foundations), usado por el simulador en `public/practice2/`.
Ya se corrigió por separado un sesgo de longitud (la opción correcta ya no es
sistemáticamente la más larga) — ese trabajo está hecho, no lo repitas ni lo
deshagas.

Se detectó un problema distinto: aunque el banco tiene buena calidad general
(escenarios realistas, "half-right traps" bien logrados en las preguntas de
selección múltiple), muchos **distractores se pueden descartar por estilo,
sin saber nada de Claude ni del dominio técnico**. Esto contradice la guía de
autoría del propio repo (`CLAUDE.md`, sección CCDV-F / CCAR-F): "wrong
options should be plausible or true in other scenarios, never obviously
absurd" y "no trivia". El examen real usa distractores sofisticados —
correctos en otro contexto, o correctos a medias — nunca frases que se
delatan por su forma.

**Tu tarea:** revisar **todas** las preguntas del dominio que se te asignó y
reescribir las opciones **incorrectas** que caigan en alguno de estos cuatro
patrones. La lista de IDs de la tabla al final es un punto de partida
(detectado por palabras clave), **no es exhaustiva** — los patrones 2 y 3 de
abajo no se pueden detectar por regex, así que tenés que leer cada pregunta
del dominio, no solo las de la lista.

### Patrón 1 — Absolutismo como "tell"

Palabras como `always`, `never`, `guarantees`, `regardless of`, `the only
way`, `permanently`, `entirely`, `no matter what/how`, `whatsoever`, `by
design` en una opción incorrecta funcionan como bandera: un candidato
entrenado en exámenes las descarta por la forma, no por el contenido, porque
sabe que una afirmación absoluta rara vez es la respuesta "correcta pero mal
aplicada a este escenario" que buscan los distractores buenos.

Ejemplo real (`D1-Q20`, ya en la lista del dominio 1):
```
"Always prefer the Agent SDK, since third-party frameworks can never be used
alongside Claude, meaning any graph-orchestration needs would have to be
built entirely from scratch."
```
Esto se descarta solo por el "never" — cualquiera que sepa que Claude tiene
una API HTTP intuye que "nunca se puede usar con nada más" es una
afirmación demasiado fuerte para ser cierta. Reescribí para que la premisa
sea plausible y el error esté en la aplicación al escenario, no en la
gramática:
```
"Prefer the Agent SDK here, since third-party orchestration frameworks add
value mainly when they replace hand-built coordination logic — and this
team hasn't described needing anything beyond what the SDK's own subagent
and hook primitives already provide."
```
(Distractor mejorado: ahora sostiene una postura razonable —"no uses una
herramienta que no necesitás"— que solo falla porque el escenario sí
describe una necesidad genuina de orquestación por grafo con checkpointing,
algo que hay que leer el enunciado para notar.)

**Importante:** no es que la palabra "always"/"never" esté prohibida en
general — a veces un hecho técnico es genuinamente absoluto y por eso forma
parte de una explicación correcta o de un distractor cuyo error es otro
(ej. "PostToolUse corre después de la ejecución y no puede bloquearla" es
cierto y absoluto, eso no hay que tocarlo). El problema es específicamente
cuando el absolutismo es lo único que hace mala a la opción, y con eso basta
para descartarla sin leer el resto.

### Patrón 2 — Justificación autodestructiva

La cláusula "since..."/"because..." de la opción incorrecta no tiene
relación con el síntoma o la restricción que describe el enunciado. Se
puede descartar por lógica de comprensión lectora, sin conocimiento del
dominio.

Ejemplo real (`D2-Q29`, ya en la lista del dominio 2): el enunciado describe
una conversación de varios días que se vuelve lenta, cara, y contradictoria.
Una opción incorrecta dice:
```
"Increase `max_tokens` so responses aren't cut off mid-answer, since a
multi-day ticket naturally needs longer replies to cover everything."
```
El enunciado nunca menciona respuestas cortadas — cualquiera que lea con
atención nota que la justificación no responde al problema planteado, sin
necesitar saber qué es `max_tokens`. Reescribí para que la justificación
*sí* aborde el síntoma descrito, y el distractor falle por una razón técnica
en vez de por desconexión narrativa:
```
"Increase `max_tokens` so each turn's reply can restate the full ticket
history for the customer, since a longer per-turn ceiling gives the model
more room to summarize everything relevant to the case."
```
(Ahora conecta con el enunciado — "restate full history"— y el error real es
más sutil: confunde el límite de tokens de salida con el problema de que el
*input* acumulado está saturado, que es justo la trampa que un distractor
bueno debería tender.)

### Patrón 3 — Mecanismo inventado con demasiado detalle de laboratorio

Un distractor describe un mecanismo interno ficticio con un nivel de
especificidad tan alto (nombres de umbrales, porcentajes, flags internos)
que suena a relleno técnico fabricado — alguien con experiencia real lo
reconoce como "demasiado específico para ser real" sin saber cuál es el
mecanismo verdadero.

Ejemplo real (`D5-Q01`):
```
"Very low temperature values interact with an internal calibration
safeguard that enforces a minimum entropy floor around 0.2, overriding the
requested setting to avoid degenerate output."
```
Reescribí apoyándote en un mecanismo real pero mal aplicado al escenario, en
vez de inventar uno que no existe:
```
"Very low temperature reduces but doesn't eliminate the influence of tied
or near-tied logits, so ties are still broken by whatever deterministic
rule the sampler applies, not by explicit randomness — which is a hardware
detail, not something the application can observe or tune around."
```
(Sigue siendo incorrecto para esta pregunta porque no explica el patrón real
de variación por batching en GPU, pero ya no se detecta por "esto suena
fabricado" — hay que saber la causa real para descartarlo.)

### Patrón 4 — "La respuesta correcta es la que tiene matices, las otras son extremas"

En varias preguntas la correcta reconoce una condición ("depende de X",
"solo si Y", "salvo que Z") mientras las tres incorrectas son afirmaciones
categóricas tipo "siempre A" / "nunca B" / "no importa, C". Un candidato con
experiencia en tests aprende a elegir "la opción con matices" sin leer el
contenido técnico. Esto es distinto del patrón 1 (que es léxico) — acá el
problema es estructural: la pregunta entera está armada como "1 postura
matizada vs. 3 strawmen".

Ejemplo real (`D1-Q22`, selección múltiple): de 5 opciones, las 3
incorrectas son "guarantees... never", "guarantees lower... eliminate", y
"eliminate... entirely" — un patrón demasiado uniforme. Cuando reescribas
para quitar el absolutismo (patrón 1), fijate también que no las tres
incorrectas quedaron con la misma estructura "afirmación categórica vs.
matizada" — variá el tipo de error entre ellas (una por aplicación
incorrecta a este escenario, otra por confundir un mecanismo con otro
similar, otra por invertir causa y efecto), no solo el vocabulario.

## Reglas

1. **No cambies** `correctAnswer` / `correctAnswers` / `selectCount`, ni el
   `text` de la pregunta, ni `id`, `taskStatement`, `concept`, `difficulty`.
   Solo reescribís el array `options` (las incorrectas; la correcta solo si
   hace falta para que las longitudes/nivel de detalle sigan parejos entre
   todas, ya que eso ya se corrigió en una pasada anterior y no hay que
   deshacerlo).
2. **No bajes la dificultad conceptual ni la introduzcas por otro lado.** El
   objetivo es que el distractor solo se pueda descartar sabiendo el
   mecanismo real de Claude/la arquitectura descrita — no que sea más fácil
   ni más difícil por motivos ajenos al contenido (longitud, tono, absurdo).
3. **No inventes mecanismos, flags, nombres de parámetros o comportamientos
   de Claude Code / la Claude API / MCP que no existan.** Si necesitás que
   un distractor suene técnico y plausible, apoyate en un mecanismo real
   (uno mencionado en otra parte del banco, o algo que puedas verificar) y
   aplicalo mal al escenario — no fabriques uno nuevo. Ante la duda sobre si
   algo es real, dejalo más genérico en vez de inventar un detalle
   específico.
4. Si al reescribir una opción el `explanation` existente deja de encajar
   (por ejemplo, porque ya no describe correctamente por qué esa opción es
   la trampa), ajustalo — pero mantené el mismo motivo central y la mención
   de "half-right trap" donde ya exista, solo actualizá la descripción para
   que sea fiel a la nueva redacción.
5. No toques preguntas de otros dominios ni otras partes del archivo.

### Cómo verificar tu trabajo al terminar

Primero, que el JSON siga siendo válido:

```bash
node -e "require('./public/practice2/examen_ccdv_f_en.json'); console.log('OK')"
```

Después, corré esto reemplazando `X` por el `id` numérico del dominio que
trabajaste (1-8), para ver cuánto bajó el conteo de absolutismo léxico
(patrón 1) en las opciones incorrectas de tu dominio:

```bash
node -e "
const data = require('./public/practice2/examen_ccdv_f_en.json');
const re = /\b(always|never|guarantees?|regardless of|the only way|permanently|entirely|no matter what|no matter how|whatsoever|by design)\b/i;
const d = data.exam.domains.find(d => d.id === X);
let flagged=0, total=0;
const ids=[];
for (const q of d.questions) {
  const correctSet = q.correctAnswers ? new Set(q.correctAnswers) : new Set([q.correctAnswer]);
  q.options.forEach((opt, i) => {
    total++;
    if (!correctSet.has(i) && re.test(opt)) { flagged++; ids.push(q.id); }
  });
}
console.log(d.name, flagged+'/'+total, (100*flagged/total).toFixed(0)+'%');
console.log('todavia con la palabra clave:', ids.join(', ') || '(ninguna)');
"
```

**No hace falta llegar a 0%** — algunas de esas palabras van a sobrevivir
legítimamente en distractores cuyo error real es otro, o en explicaciones.
El objetivo es que lo que quede sea porque el absolutismo es un hecho
técnico verdadero (no la razón por la que la opción es incorrecta), no
porque quedó sin revisar. Usá la lista de IDs impresa para chequear caso por
caso, no para forzar el número a cero.

Este script solo detecta el patrón 1 (léxico). Para los patrones 2, 3 y 4
no hay atajo automático — tenés que releer cada pregunta de tu dominio y
usar criterio, apoyándote en los ejemplos de arriba.

---

## Tabla de dominios

Pasale al agente solo la fila de su dominio. La columna "detectadas por
palabra clave" es el resultado del script de arriba corrido *antes* de
reescribir nada — un piso, no el total real de preguntas a revisar (revisá
las 100% de las preguntas del dominio para los patrones 2-4).

| Dominio (`id`) | Nombre | Preguntas totales | Detectadas por palabra clave (patrón 1) |
|---|---|---|---|
| 1 | Agents and Workflows | D1-Q01 a D1-Q24 | D1-Q03, D1-Q06, D1-Q08, D1-Q10, D1-Q13, D1-Q16, D1-Q19, D1-Q20, D1-Q22, D1-Q23, D1-Q24 |
| 2 | Applications and Integration | D2-Q01 a D2-Q40 | D2-Q04, D2-Q06, D2-Q08, D2-Q09, D2-Q10, D2-Q12, D2-Q13, D2-Q14, D2-Q15, D2-Q17, D2-Q18, D2-Q19, D2-Q21, D2-Q24, D2-Q26, D2-Q27, D2-Q28, D2-Q29, D2-Q31, D2-Q34, D2-Q35, D2-Q36, D2-Q37, D2-Q39 |
| 3 | Claude Code | D3-Q01 a D3-Q08 | D3-Q02, D3-Q03, D3-Q06, D3-Q07 |
| 4 | Eval, Testing, and Debugging | D4-Q01 a D4-Q06 | D4-Q01, D4-Q04, D4-Q05, D4-Q06 |
| 5 | Model Selection and Optimization | D5-Q01 a D5-Q24 | D5-Q01, D5-Q02, D5-Q04, D5-Q05, D5-Q06, D5-Q10, D5-Q11, D5-Q12, D5-Q14, D5-Q16, D5-Q17, D5-Q18, D5-Q20, D5-Q21, D5-Q22, D5-Q23 |
| 6 | Prompt and Context Engineering | D6-Q01 a D6-Q18 | D6-Q01, D6-Q04, D6-Q06, D6-Q07, D6-Q08, D6-Q10, D6-Q11, D6-Q12, D6-Q14, D6-Q15, D6-Q17, D6-Q18 |
| 7 | Security and Safety | D7-Q01 a D7-Q14 | D7-Q01, D7-Q03, D7-Q05, D7-Q07, D7-Q09, D7-Q11, D7-Q12, D7-Q13 |
| 8 | Tools and MCPs | D8-Q01 a D8-Q16 | D8-Q01, D8-Q03, D8-Q04, D8-Q06, D8-Q07, D8-Q08, D8-Q10, D8-Q11, D8-Q12, D8-Q13, D8-Q14, D8-Q16 |
