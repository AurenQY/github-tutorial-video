// Octicons (GitHub's official icon set) rendered as inline SVG strings.
let DATA = null;

export async function loadIcons() {
  const res = await fetch('/node_modules/@primer/octicons/build/data.json');
  DATA = await res.json();
}

export function oc(name, size = 16, cls = '', style = '') {
  const icon = DATA[name];
  if (!icon) throw new Error(`Unknown octicon: ${name}`);
  const heights = Object.keys(icon.heights).map(Number);
  const h = size >= 24 && heights.includes(24) ? 24 : 16;
  const { width, path } = icon.heights[h];
  const w = (width * size) / h;
  return `<svg class="octicon octicon-${name} ${cls}" style="${style}" width="${w}" height="${size}" viewBox="0 0 ${width} ${h}" fill="currentColor" aria-hidden="true">${path}</svg>`;
}
