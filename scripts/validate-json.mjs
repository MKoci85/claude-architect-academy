// Valida sintaxis JSON. Dos modos de uso:
//
// 1) Manual, con rutas como argumentos:
//      node scripts/validate-json.mjs public/data/es/claude-101.json ...
//
// 2) Como hook PostToolUse de Claude Code (sin argumentos): lee por stdin el
//    JSON de hook (tool_input.file_path / tool_response.filePath), y si el
//    archivo cae bajo public/data/**/*.json lo valida. Si es inválido,
//    imprime un JSON de salida de hook con decision:"block" para que el
//    error vuelva al modelo.
import fs from 'fs';

function validate(file) {
  if (!fs.existsSync(file)) return null;
  try {
    JSON.parse(fs.readFileSync(file, 'utf-8'));
    return null;
  } catch (err) {
    return err.message;
  }
}

const argFiles = process.argv.slice(2).filter((f) => f.toLowerCase().endsWith('.json'));

if (argFiles.length > 0) {
  let hasError = false;
  for (const file of argFiles) {
    const err = validate(file);
    if (err) {
      hasError = true;
      console.error(`JSON inválido en ${file}: ${err}`);
    }
  }
  process.exit(hasError ? 1 : 0);
}

// Modo hook: leer stdin.
let raw = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // no hay nada parseable en stdin, no bloquear
  }

  const file = payload?.tool_input?.file_path || payload?.tool_response?.filePath;
  if (!file) process.exit(0);

  const normalized = file.replace(/\\/g, '/');
  if (!/public\/data\/.*\.json$/i.test(normalized)) process.exit(0);

  const err = validate(file);
  if (err) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `JSON inválido en ${file}: ${err}`,
    }));
    process.exit(0);
  }

  process.exit(0);
});
