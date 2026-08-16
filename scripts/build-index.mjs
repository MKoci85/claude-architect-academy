// Genera DOS artefactos por idioma a partir de content.json y las colecciones
// completas:
//
//   index.json        → solo metadata (collections -> sections -> articles con
//                       id/title/summary/sourceFile/articleIndex y los títulos
//                       de subsección). Es lo único que se descarga al cargar
//                       la app: alcanza para pintar el home y navegar.
//   search-index.json → el texto plano precalculado de cada subsección, que es
//                       el 90% del peso. Se pide en lazy recién cuando el
//                       usuario tipea en el buscador por primera vez.
//
// La separación existe porque el texto de búsqueda pesa ~380KB crudos contra
// ~40KB de metadata: mandarlo todo junto en la carga inicial hacía que el
// "índice liviano" pesara más del doble que el bundle JS entero.
//
// Cada artículo lleva `sourceFile` para que el cliente sepa qué archivo
// completo pedir cuando el usuario efectivamente abre ese artículo.
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
    })),
  }));
}

function searchEntries(articles, sourceFile, startIndex = 0, out = []) {
  (articles || []).forEach((a, i) => {
    out.push({
      key: `${sourceFile}#${startIndex + i}`,
      texts: (a.subsections || []).map((sub) => subsectionText(sub)),
    });
  });
  return out;
}

function buildLang(lang) {
  const langDir = path.join(DATA_ROOT, lang);
  const index = readJson(path.join(langDir, 'content.json'));
  if (!index || !Array.isArray(index.collections)) return;

  const searchDocs = [];

  const collections = index.collections
    .map((entry) => {
      if (Array.isArray(entry.items)) {
        const sections = entry.items
          .map((item) => {
            const data = readJson(path.join(langDir, item.file));
            if (!data) return null; // sin traducción disponible en este idioma
            const articles = data.sections?.flatMap((s) => s.articles) || [];
            searchEntries(articles, item.file, 0, searchDocs);
            return {
              title: item.title || data.title,
              description: item.description,
              sourceFile: item.file,
              articles: liteArticles(articles, item.file),
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
          searchEntries(s.articles || [], entry.file, runningIndex, searchDocs);
          runningIndex += (s.articles || []).length;
          return { title: s.title, sourceFile: entry.file, articles: arts };
        });
        return {
          id: data.id,
          title: data.title || entry.title,
          summary: data.summary || data.description || entry.summary || entry.description,
          isSuper: false,
          sections,
        };
      }

      return null;
    })
    .filter(Boolean);

  const indexFile = path.join(langDir, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify({ collections }));

  const searchFile = path.join(langDir, 'search-index.json');
  fs.writeFileSync(searchFile, JSON.stringify({ docs: searchDocs }));

  return [indexFile, searchFile];
}

export function buildIndexes() {
  const written = [];
  for (const lang of LANGS) {
    const out = buildLang(lang);
    if (out) written.push(...out);
  }
  return written;
}

// Permite ejecutarlo directo: `node scripts/build-index.mjs`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const written = buildIndexes();
  written.forEach((f) => console.log(`✓ ${path.relative(process.cwd(), f)}`));
}
