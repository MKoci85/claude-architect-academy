// Genera public/data/{lang}/index-lite.json a partir de content.json y las
// colecciones completas. El índice liviano tiene la misma forma de árbol que
// consumía App.jsx antes (collections -> sections -> articles), pero cada
// subsection pierde sus `blocks` (código, cards, tablas, etc.) y en su lugar
// lleva `text` (texto plano precalculado, para el buscador). Cada artículo
// lleva `sourceFile` para que el cliente sepa qué archivo completo pedir
// cuando el usuario efectivamente abre ese artículo.
//
// Se ejecuta automáticamente al arrancar `npm run dev` / `npm run build`
// (ver vite.config.js) y también puede correrse a mano:
//   node scripts/build-index.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { subsectionText } from '../src/searchEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.resolve(__dirname, '../public/data');
const LANGS = ['es', 'en'];

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

// `articleIndex` es la posición del artículo dentro de la lista aplanada
// sections.flatMap(s => s.articles) del archivo fuente. Es lo que usa
// App.jsx para ubicar el artículo completo al pedirlo bajo demanda — no se
// puede usar `id` para eso porque muchos artículos no lo tienen (quedarían
// todos con id undefined y matchearía siempre el primero).
function liteArticles(articles, sourceFile, startIndex = 0) {
  return (articles || []).map((a, i) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    sourceFile,
    articleIndex: startIndex + i,
    subsections: (a.subsections || []).map((sub) => ({
      title: sub.title || null,
      text: subsectionText(sub),
    })),
  }));
}

function buildLang(lang) {
  const langDir = path.join(DATA_ROOT, lang);
  const index = readJson(path.join(langDir, 'content.json'));
  if (!index || !Array.isArray(index.collections)) return;

  const collections = index.collections
    .map((entry) => {
      if (Array.isArray(entry.items)) {
        const sections = entry.items
          .map((item) => {
            const data = readJson(path.join(langDir, item.file));
            if (!data) return null; // sin traducción disponible en este idioma
            return {
              title: item.title || data.title,
              description: item.description,
              sourceFile: item.file,
              articles: liteArticles(data.sections?.flatMap((s) => s.articles) || [], item.file),
            };
          })
          .filter(Boolean);
        if (sections.length === 0) return null;
        return {
          id: entry.title?.toLowerCase().replace(/\s+/g, '-'),
          title: entry.title,
          summary: entry.description,
          isSuper: entry.isSuper || false,
          sections,
        };
      }

      if (entry.file) {
        const data = readJson(path.join(langDir, entry.file));
        if (!data) return null;
        // El índice de cada artículo debe correr sobre TODO el archivo (no
        // reiniciar por sección), porque en runtime se ubica el artículo
        // completo con sections.flatMap(s => s.articles)[articleIndex].
        let runningIndex = 0;
        const sections = (data.sections || []).map((s) => {
          const arts = liteArticles(s.articles || [], entry.file, runningIndex);
          runningIndex += (s.articles || []).length;
          return { title: s.title, sourceFile: entry.file, articles: arts };
        });
        return {
          ...data,
          title: data.title || entry.title,
          summary: data.summary || data.description || entry.summary || entry.description,
          sections,
        };
      }

      return null;
    })
    .filter(Boolean);

  const outFile = path.join(langDir, 'index-lite.json');
  // Sin indentación: es el único archivo que se descarga siempre al cargar
  // la app, así que se prioriza tamaño sobre legibilidad. No se edita a mano.
  fs.writeFileSync(outFile, JSON.stringify({ collections }));
  return outFile;
}

export function buildIndexes() {
  const written = [];
  for (const lang of LANGS) {
    const out = buildLang(lang);
    if (out) written.push(out);
  }
  return written;
}

// Permite ejecutarlo directo: `node scripts/build-index.mjs`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const written = buildIndexes();
  written.forEach((f) => console.log(`✓ ${path.relative(process.cwd(), f)}`));
}
