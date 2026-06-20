const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'companionTranslations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The block to replace
const startMarker = `      idle: [
        "The magical resonance here is quite peculiar...",
        "Have you read the ancient texts about this area?",
        "Patience is key to uncovering Embervault's secrets.",
        "I sense a disturbance in the mana flow nearby."
      ,
        "The Abstract Chain is a fascinating phenomenon, {name}. Please remember to cast your vote.",
        "According to my grimoire, {name}, the Guild Pass allows entry to unrestricted areas with furious monsters.",
        "If we require high-tier loot and runestones to level up fast, the Guild Pass is optimal, {name}.",
        "Have you considered the 7-day trial Guild Pass, {name}? It could greatly assist our research.",
        "Your destiny is intertwined with the Abstract Chain, {name}. Don't forget to vote."
      ],`;

const correctBlock = `      idle: [
        "The magical resonance here is quite peculiar...",
        "Have you read the ancient texts about this area?",
        "Patience is key to uncovering Embervault's secrets.",
        "I sense a disturbance in the mana flow nearby.",
        "The Abstract Chain is a fascinating phenomenon, {name}. Please remember to cast your vote.",
        "According to my grimoire, {name}, the Guild Pass allows entry to unrestricted areas with furious monsters.",
        "If we require high-tier loot and runestones to level up fast, the Guild Pass is optimal, {name}.",
        "Have you considered the 7-day trial Guild Pass, {name}? It could greatly assist our research.",
        "Your destiny is intertwined with the Abstract Chain, {name}. Don't forget to vote."
      ],
      combat: [
        "Focus your energy.",
        "A tactical approach is best.",
        "Their defense is weakening!",
        "Conserve your strength."
      ],
      chest: [
        "A chest. Let us examine its contents carefully.",
        "The lock mechanism is quite intricate.",
        "I wonder what history this chest holds.",
        "Proceed with caution; some chests are trapped."
      ],
      rareLoot: [
        "Fascinating... the enchantment on this is ancient.",
        "A relic of great power. We must use it wisely.",
        "I have read about this item in the archives!",
        "Such pure magical energy radiating from this."
      ],
      levelUp: [
        "My understanding deepens.",
        "A refinement of my magical abilities.",
        "Knowledge and power, hand in hand."
      ],`;

const endMarker = `      zoneHome: [`;

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + correctBlock + '\\n' + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed syntax by replacing the block!');
} else {
  console.log('Markers not found.');
}
