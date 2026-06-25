const fs = require('fs');
let data = fs.readFileSync('src/i18n/translations.ts', 'utf8');

data = data.replace(
  /bob: \{ name: 'Bob' \}/g, 
  "bob: { name: 'Bob', description: 'El Explorador Optimista. Le encanta encontrar nuevo botín y vivir aventuras.' }"
).replace(
  /kaya: \{ name: 'Kaya' \}/g, 
  "kaya: { name: 'Kaya', description: 'La Oni Ardiente. ¡Siempre buscando pelea y enormes botines!' }"
).replace(
  /lia: \{ name: 'Lia' \}/g, 
  "lia: { name: 'Lia', description: 'La IA Analítica. Se centra puramente en datos, eficiencia y perfección.' }"
).replace(
  /crash: \{ name: 'Crash' \}/g, 
  "crash: { name: 'Crash', description: 'El Fallo Caótico. Error 404: Lógica no encontrada. Altamente impredecible.' }"
);

fs.writeFileSync('src/i18n/translations.ts', data);
console.log("Translations updated!");
