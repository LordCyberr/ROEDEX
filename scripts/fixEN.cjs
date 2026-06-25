const fs = require('fs');
let data = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Restore English
data = data.replace(
  "bob: { name: 'Bob', description: 'El Explorador Optimista. Le encanta encontrar nuevo botín y vivir aventuras.' }",
  "bob: { name: 'Bob', description: 'The Optimistic Explorer. Loves finding new loot and going on adventures.' }"
).replace(
  "kaya: { name: 'Kaya', description: 'La Oni Ardiente. ¡Siempre buscando pelea y enormes botines!' }",
  "kaya: { name: 'Kaya', description: 'The Fiery Oni. Always looking for a fight and massive boss drops!' }"
).replace(
  "lia: { name: 'Lia', description: 'La IA Analítica. Se centra puramente en datos, eficiencia y perfección.' }",
  "lia: { name: 'Lia', description: 'The Analytical AI. Focuses purely on data, efficiency, and perfection.' }"
).replace(
  "crash: { name: 'Crash', description: 'El Fallo Caótico. Error 404: Lógica no encontrada. Altamente impredecible.' }",
  "crash: { name: 'Crash', description: 'The Chaotic Glitch. Error 404: Logic not found. Highly unpredictable.' }"
);

fs.writeFileSync('src/i18n/translations.ts', data);
console.log("English translations fixed!");
