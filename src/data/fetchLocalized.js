export async function fetchLocalized(file, lang) {
  const res = await fetch(`/data/${lang}/${file}`);
  // El dev server (y algunos hostings estáticos) hacen fallback a index.html
  // con 200 para rutas inexistentes — content-type es la señal confiable.
  if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
  return res.json();
}
