// Ícones planos do Estilo Explicando Direito (viewBox 0 0 64 64, traço escuro, detalhe amarelo).
// Uso: ICON("calendario") → string <svg>. Ícone novo: desenhar com formas simples que dizem o que são
// e conferir na folha da prévia; o nome vai na lista do docs/explicando-direito/visual.md.
const ICON_INK = "#16191c", ICON_GOLD = "#d4a21f", ICON_RED = "#8e1b1b";
const ICONS = {
  calendario: `<rect x="8" y="12" width="48" height="44" rx="5" fill="none" stroke="${ICON_INK}" stroke-width="5"/><path d="M8 26h48" stroke="${ICON_INK}" stroke-width="5"/><path d="M20 6v12M44 6v12" stroke="${ICON_INK}" stroke-width="5" stroke-linecap="round"/><rect x="17" y="33" width="8" height="7" fill="${ICON_INK}"/><rect x="29" y="33" width="8" height="7" fill="${ICON_INK}"/><rect x="41" y="33" width="8" height="7" fill="${ICON_GOLD}"/>`,
  ampulheta: `<path d="M16 6h32M16 58h32" stroke="${ICON_INK}" stroke-width="5" stroke-linecap="round"/><path d="M20 8c0 14 24 14 24 24S20 42 20 56M44 8c0 14-24 14-24 24s24 10 24 24" fill="none" stroke="${ICON_INK}" stroke-width="4.5"/><path d="M26 50c3-4 9-4 12 0z" fill="${ICON_GOLD}"/>`,
  relogio: `<circle cx="32" cy="32" r="24" fill="none" stroke="${ICON_INK}" stroke-width="5"/><path d="M32 18v15l10 7" fill="none" stroke="${ICON_INK}" stroke-width="5" stroke-linecap="round"/>`,
  "seta-baixo": `<path d="M32 8v42M16 36l16 16 16-16" fill="none" stroke="${ICON_INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "seta-cima": `<path d="M32 56V14M16 28l16-16 16 16" fill="none" stroke="${ICON_INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "seta-direita": `<path d="M8 32h44M38 18l14 14-14 14" fill="none" stroke="${ICON_INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  cadeado: `<path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="${ICON_GOLD}" stroke-width="6"/><rect x="12" y="28" width="40" height="30" rx="5" fill="${ICON_GOLD}"/><circle cx="32" cy="40" r="4.5" fill="${ICON_INK}"/><path d="M32 42v8" stroke="${ICON_INK}" stroke-width="4"/>`,
  check: `<path d="M14 33l12 12 24-26" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  x: `<path d="M18 18l28 28M46 18L18 46" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
  urna: `<rect x="6" y="18" width="52" height="38" rx="4" fill="#efebe2" stroke="${ICON_INK}" stroke-width="4"/><rect x="11" y="24" width="22" height="16" fill="#cfe2ea" stroke="${ICON_INK}" stroke-width="3"/><g fill="${ICON_INK}"><rect x="38" y="24" width="5" height="5"/><rect x="45" y="24" width="5" height="5"/><rect x="38" y="31" width="5" height="5"/><rect x="45" y="31" width="5" height="5"/><rect x="38" y="38" width="5" height="5"/><rect x="45" y="38" width="5" height="5"/></g><rect x="40" y="46" width="10" height="5" fill="${ICON_GOLD}"/>`,
  martelo: `<rect x="22" y="8" width="30" height="16" rx="3" transform="rotate(35 37 16)" fill="${ICON_INK}"/><path d="M30 24L12 50" stroke="${ICON_INK}" stroke-width="7" stroke-linecap="round"/><rect x="34" y="50" width="24" height="7" rx="2" fill="${ICON_GOLD}"/>`,
  balanca: `<path d="M32 10v42M18 56h28M12 18h40" stroke="${ICON_INK}" stroke-width="5" stroke-linecap="round"/><path d="M12 18L5 36h14zM52 18l-7 18h14z" fill="none" stroke="${ICON_INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M4 36a8 6 0 0 0 16 0zM44 36a8 6 0 0 0 16 0z" fill="${ICON_GOLD}"/><circle cx="32" cy="10" r="4" fill="${ICON_GOLD}"/>`,
  documento: `<path d="M14 6h26l12 12v40H14z" fill="#f4f0e7" stroke="${ICON_INK}" stroke-width="4" stroke-linejoin="round"/><path d="M40 6v12h12" fill="none" stroke="${ICON_INK}" stroke-width="4"/><path d="M21 28h22M21 36h22M21 44h14" stroke="${ICON_INK}" stroke-width="4" stroke-linecap="round"/>`,
  passaporte: `<rect x="13" y="6" width="38" height="52" rx="4" fill="#1d2a4a"/><circle cx="32" cy="28" r="9" fill="none" stroke="${ICON_GOLD}" stroke-width="3"/><path d="M22 44h20" stroke="${ICON_GOLD}" stroke-width="3"/>`,
  celular: `<rect x="16" y="4" width="32" height="56" rx="6" fill="${ICON_INK}"/><rect x="20" y="11" width="24" height="40" rx="2" fill="#f4f0e7"/><path d="M24 18h12M24 25h16M24 32h10" stroke="${ICON_INK}" stroke-width="3"/>`,
  predio: `<path d="M6 54h52" stroke="${ICON_INK}" stroke-width="4"/><path d="M8 46a12 7 0 0 1 22 0zM34 40a12 9 0 0 0 22 0z" fill="#e8e3d8" stroke="${ICON_INK}" stroke-width="3"/><rect x="27" y="8" width="4" height="40" fill="${ICON_INK}"/><rect x="33" y="8" width="4" height="40" fill="${ICON_INK}"/>`,
  pessoa: `<circle cx="32" cy="20" r="11" fill="#3a4148"/><path d="M12 58c0-14 9-22 20-22s20 8 20 22z" fill="#3a4148"/>`,
  dinheiro: `<rect x="6" y="16" width="52" height="32" rx="4" fill="#cfe3c8" stroke="${ICON_INK}" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="none" stroke="${ICON_INK}" stroke-width="4"/><path d="M14 24v16M50 24v16" stroke="${ICON_INK}" stroke-width="3"/>`,
  grade: `<rect x="8" y="8" width="48" height="48" rx="3" fill="none" stroke="${ICON_INK}" stroke-width="5"/><path d="M8 24h48M8 40h48M24 8v48M40 8v48" stroke="${ICON_INK}" stroke-width="4"/>`,
  alerta: `<path d="M32 6L60 56H4z" fill="${ICON_GOLD}" stroke="${ICON_INK}" stroke-width="4" stroke-linejoin="round"/><path d="M32 22v18" stroke="${ICON_INK}" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.5" fill="${ICON_INK}"/>`,
  lupa: `<circle cx="27" cy="27" r="17" fill="none" stroke="${ICON_INK}" stroke-width="6"/><path d="M40 40l16 16" stroke="${ICON_INK}" stroke-width="8" stroke-linecap="round"/>`,
  algemas: `<circle cx="18" cy="40" r="12" fill="none" stroke="${ICON_INK}" stroke-width="5"/><circle cx="46" cy="40" r="12" fill="none" stroke="${ICON_INK}" stroke-width="5"/><path d="M26 22h12" stroke="${ICON_INK}" stroke-width="5"/><path d="M22 30l4-8M42 30l-4-8" stroke="${ICON_INK}" stroke-width="5"/>`,
  microfone: `<rect x="23" y="6" width="18" height="30" rx="9" fill="${ICON_INK}"/><path d="M15 30a17 17 0 0 0 34 0M32 47v10M22 58h20" fill="none" stroke="${ICON_INK}" stroke-width="5" stroke-linecap="round"/>`,
  predio_stf: `<path d="M6 56h52M10 50h44" stroke="${ICON_INK}" stroke-width="4"/><path d="M8 20L32 8l24 12z" fill="${ICON_INK}"/><g fill="${ICON_INK}"><rect x="13" y="24" width="6" height="24"/><rect x="25" y="24" width="6" height="24"/><rect x="37" y="24" width="6" height="24"/><rect x="49" y="24" width="6" height="24"/></g>`,
};
function ICON(name, cls) {
  const body = ICONS[name];
  if (!body) throw new Error(`ícone '${name}' não existe (engine2d/icones.js): ${Object.keys(ICONS).join(", ")}`);
  return `<svg ${cls ? `class="${cls}"` : ""} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
