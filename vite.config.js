import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { buildIndexes } from './scripts/build-index.mjs';

// Regenera public/data/{lang}/index-lite.json (índice liviano para carga
// inicial + búsqueda, ver scripts/build-index.mjs) al arrancar el dev server
// o al hacer build, y en dev cada vez que cambia algún JSON de contenido —
// así los autores de contenido nunca tienen que correrlo a mano.
function dataIndexPlugin() {
  const dataDir = path.resolve(__dirname, 'public/data');
  return {
    name: 'data-index',
    buildStart() {
      buildIndexes();
    },
    configureServer(server) {
      buildIndexes();
      server.watcher.add(dataDir);
      server.watcher.on('change', (file) => {
        const normalized = file.split(path.sep).join('/');
        if (normalized.startsWith(dataDir.split(path.sep).join('/')) &&
            normalized.endsWith('.json') &&
            !normalized.endsWith('index-lite.json')) {
          buildIndexes();
        }
      });
    },
  };
}

function practiceRoutePlugin() {
  return {
    name: 'practice-route',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/practice' || req.url === '/practice/') {
          const file = path.resolve(__dirname, 'public/practice/index.html');
          res.setHeader('Content-Type', 'text/html');
          res.end(fs.readFileSync(file));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [dataIndexPlugin(), react(), practiceRoutePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
