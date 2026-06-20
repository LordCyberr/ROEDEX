const fs = require('fs');

const FILE_PATH = 'c:\\Users\\Administrator\\Desktop\\ROEDEX\\src\\i18n\\companionTranslations.ts';

const NEW_TAVERN_QUOTES = {
  kaya: {
    en: [
      "A tavern. Stay alert, {name}. Drunks can be unpredictable.",
      "Smells like cheap ale and trouble. Let's make this quick.",
      "Don't get distracted by the drinks, {name}. We have a mission."
    ],
    ko: [
      "선술집. 정신 바짝 차려, {name}. 취객들은 예측할 수 없으니까.",
      "싸구려 에일과 문제 냄새가 나네. 빨리 끝내자.",
      "술에 정신 팔리지 마, {name}. 우린 임무가 있다고."
    ],
    es: [
      "Una taberna. Mantente alerta, {name}. Los borrachos pueden ser impredecibles.",
      "Huele a cerveza barata y problemas. Hagamos esto rápido.",
      "No te distraigas con las bebidas, {name}. Tenemos una misión."
    ],
    ru: [
      "Таверна. Будь начеку, {name}. Пьяницы непредсказуемы.",
      "Пахнет дешевым элем и неприятностями. Давай побыстрее.",
      "Не отвлекайся на выпивку, {name}. У нас миссия."
    ]
  },
  lia: {
    en: [
      "A tavern! The music is so lively, {name}!",
      "I wonder if they have any sweet drinks here?",
      "It's so crowded in here. Stay close, {name}!"
    ],
    ko: [
      "선술집이네요! 음악이 너무 신나요, {name}님!",
      "여기에 단 음료도 있을까요?",
      "여기 너무 붐벼요. 내 곁에 꼭 붙어있어요, {name}님!"
    ],
    es: [
      "¡Una taberna! ¡La música es muy alegre, {name}!",
      "Me pregunto si tendrán bebidas dulces aquí.",
      "Está muy lleno aquí. ¡Mantente cerca, {name}!"
    ],
    ru: [
      "Таверна! Музыка такая живая, {name}!",
      "Интересно, у них есть сладкие напитки?",
      "Здесь так людно. Держись поближе, {name}!"
    ]
  },
  crash: {
    en: [
      "TAVERN! CRASH WANT BIG MEAT!",
      "NOISY PLACE! CRASH LIKE NOISE! {name}, CAN CRASH SMASH TABLE?",
      "CRASH DRINK BARREL OF JUICE NOW!"
    ],
    ko: [
      "선술집! 크래쉬 큰 고기 원한다!",
      "시끄러운 곳! 크래쉬 시끄러운 거 좋다! {name}, 크래쉬 탁자 부숴도 돼?",
      "크래쉬 지금 주스 한 통 다 마실 거다!"
    ],
    es: [
      "¡TABERNA! ¡CRASH QUERER CARNE GRANDE!",
      "¡LUGAR RUIDOSO! ¡A CRASH GUSTAR RUIDO! {name}, ¿CRASH PODER ROMPER MESA?",
      "¡CRASH BEBER BARRIL DE JUGO AHORA!"
    ],
    ru: [
      "ТАВЕРНА! КРЭШ ХОЧЕТ БОЛЬШОЕ МЯСО!",
      "ШУМНОЕ МЕСТО! КРЭШ ЛЮБИТ ШУМ! {name}, КРЭШ МОЖЕТ СЛОМАТЬ СТОЛ?",
      "КРЭШ ВЫПЬЕТ БОЧКУ СОКА СЕЙЧАС!"
    ]
  }
};

let content = fs.readFileSync(FILE_PATH, 'utf-8');

const COMPANIONS = ['kaya', 'lia', 'crash'];
const LANGUAGES = ['en', 'ko', 'es', 'ru'];

// Create an array of blocks representing the language/companion
// We'll just split the content by lines and insert it carefully.
let lines = content.split('\n');

// we'll find lines that have `zoneBank:` and we'll insert `zoneTavern:` after it.
// To ensure we get the right companion and language, we'll track the current language and companion parsing.

let currentLang = null;
let currentCompanion = null;

let newLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  newLines.push(line);

  if (line.match(/^\s*(en|ko|es|ru):\s*\{\s*$/)) {
    currentLang = line.match(/^\s*(en|ko|es|ru):\s*\{\s*$/)[1];
  }
  
  if (line.match(/^\s*(kaya|lia|crash):\s*\{\s*$/)) {
    currentCompanion = line.match(/^\s*(kaya|lia|crash):\s*\{\s*$/)[1];
  }

  if (line.match(/^\s*zoneBank:/) && currentLang && currentCompanion) {
    // we found a zoneBank! Let's insert zoneTavern right after this array closes.
    // wait, zoneBank is a single line because it's like `zoneBank: ["...", "..."],`
    // wait, no, my grep_search earlier showed some zoneBank spanning multiple lines maybe?
    // Let's assume it's one line. If there's a bracket closing on the same line, insert after.
    if (line.includes('],')) {
        const quotes = NEW_TAVERN_QUOTES[currentCompanion][currentLang];
        const quotesStr = `      zoneTavern: ${JSON.stringify(quotes)},`;
        newLines.push(quotesStr);
    } else {
        // it spans multiple lines. Find the closing bracket.
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('],')) {
            newLines.push(lines[j]);
            j++;
        }
        if (j < lines.length) {
            newLines.push(lines[j]); // the `],` line
            const quotes = NEW_TAVERN_QUOTES[currentCompanion][currentLang];
            const quotesStr = `      zoneTavern: ${JSON.stringify(quotes)},`;
            newLines.push(quotesStr);
            i = j;
        }
    }
  }
}

// Ensure the interface is updated!
const finalContent = newLines.join('\n');
fs.writeFileSync(FILE_PATH, finalContent, 'utf-8');
console.log('Tavern quotes added successfully.');
