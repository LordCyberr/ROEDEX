const fs = require('fs');

const tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const typeIndex = tsContent.indexOf('export type TranslationKey');
const typesCode = tsContent.substring(typeIndex);
let objCode = tsContent.substring(0, typeIndex);
objCode = objCode.replace('export const translations =', 'return');
objCode = objCode.replace(/as const;/g, '');
const getObj = new Function(objCode);
const translations = getObj();

const en = translations.en || {};
const es = translations.es || {};
const ko = translations.ko || {};

const tutorialStepsText = [
    "Welcome to ROEDEX! This tutorial will cover all overlay features in one go so you don't have to discover them on your own. Click 'NEXT' below to begin.",
    "This is the Global Tab. The header tracks Name, Distance, Alive & Dead counts, and Respawn Time for the current zone. Click 'NEXT' below to continue.",
    "Hover over the first item's respawn timer to see the respawn queue! Once you've seen it, click 'NEXT' below.",
    "Great! Now, click the category icon (like the sword, leaf, or pickaxe) next to an item in the list to bookmark it.",
    "Click the Favorites Tab (the star icon) at the top of the UI to view your bookmarks.",
    "See your bookmark? Now click the icon again to remove it from your favorites.",
    "Click the Session Tab up top. This tab tracks your Player Profile, Session Stats (record runs and run history), and Chest Loot.",
    "Click the NPC Tab. This shows you the locations of all vendors, quest givers, and important characters.",
    "Click the 'Alchemist' category row to expand it, then hover over the first NPC row.",
    "Click the Settings tab (the gear icon). Everything is customizable here, from layout colors to notification behavior.",
    "Scroll down and click on 'ABOUT ROEDEX' to expand the section. Click 'NEXT' below after expanding.",
    "Now click the 'Project Changelogs' button to read the latest updates.",
    "Great! Now close the changelog window by clicking the X in the top right corner.",
    "Let's go back to the Global Tab. Click the Pop-out icon in the top right of the UI to separate it into its own mini-overlay!",
    "Grab the header of the popped-out window and drag it. You can drag windows anywhere on your screen! Click 'NEXT' below when you're done.",
    "Click the 'Merge' button in the header (down arrow icon) to bring all popped-out windows back into the main view.",
    "Click the Layout button in the top right (panel icons) to switch to Horizontal View! It lets you see multiple pieces of info at a glance.",
    "Great! Now click it again to switch back to Vertical View.",
    "Click the minimize button (dash icon) to shrink the window into a tiny floating orb! (Double-click the orb to bring it back)",
    "Double-tap the orb to reopen the UI, then click the Lock button! When locked, the UI becomes click-through.",
    "Great! Now click the lock button again to UNLOCK the UI, and you're ready to start playing!"
];

const missing = {
  en: {
    tutorial: {
      skipTutorial: "Skip Tutorial",
      step: "Step",
      previous: "Previous",
      skip: "Skip",
      next: "Next",
      awaitingInput: "Awaiting Action...",
    },
    companions: {
      bob: {
        description: "The Optimistic Explorer. Loves finding new loot and going on adventures.",
        quote: "So... what's our next move?"
      },
      kaya: {
        description: "The Fiery Oni. Always looking for a fight and massive loot drops!",
        quote: "This waiting around is boring. Let's find something to hit."
      },
      lia: {
        description: "The Elf Mage. A mystical companion focused on magic and rare secrets.",
        quote: "The magical resonance here is quite peculiar..."
      },
      crash: {
        description: "The Orc Warrior. Brutal and loud, he loves smashing rocks and enemies alike!",
        quote: "Crash hungry. When we eat?"
      }
    }
  },
  es: {
    tutorial: {
      skipTutorial: "Omitir Tutorial",
      step: "Paso",
      previous: "Anterior",
      skip: "Omitir",
      next: "Siguiente",
      awaitingInput: "Esperando Acción...",
    },
    companions: {
      bob: {
        description: "El Explorador Optimista. Le encanta encontrar botines y emprender aventuras.",
        quote: "Entonces... ¿cuál es nuestro próximo movimiento?"
      },
      kaya: {
        description: "La Oni Ardiente. ¡Siempre buscando pelea y botines masivos!",
        quote: "Esta espera es aburrida. Busquemos algo a qué golpear."
      },
      lia: {
        description: "La Maga Elfa. Una compañera mística enfocada en magia y secretos.",
        quote: "La resonancia mágica aquí es bastante peculiar..."
      },
      crash: {
        description: "El Guerrero Orco. Brutal y ruidoso, ¡le encanta romper rocas y enemigos por igual!",
        quote: "Crash tener hambre. ¿Cuándo comer?"
      }
    }
  },
  ko: {
    tutorial: {
      skipTutorial: "튜토리얼 건너뛰기",
      step: "단계",
      previous: "이전",
      skip: "건너뛰기",
      next: "다음",
      awaitingInput: "작업 대기 중...",
    },
    companions: {
      bob: {
        description: "낙관적인 탐험가. 새로운 전리품을 찾고 모험을 떠나는 것을 좋아합니다.",
        quote: "그래서... 다음은 뭐지?"
      },
      kaya: {
        description: "불타는 오니. 항상 싸움과 엄청난 전리품을 찾고 있습니다!",
        quote: "기다리는 건 지루해. 칠 걸 찾자."
      },
      lia: {
        description: "엘프 마법사. 마법과 희귀한 비밀에 집중하는 신비한 동반자입니다.",
        quote: "여기의 마법 공명은 꽤 특이하군..."
      },
      crash: {
        description: "오크 전사. 잔인하고 시끄럽고 바위와 적을 부수는 것을 좋아합니다!",
        quote: "크래쉬 배고파. 언제 밥 먹어?"
      }
    }
  }
};

for (let i = 0; i < tutorialStepsText.length; i++) {
    missing.en.tutorial[`s${i+1}`] = tutorialStepsText[i];
    missing.es.tutorial[`s${i+1}`] = tutorialStepsText[i]; // Keeping EN as fallback for ES/KO since this is a quick fix
    missing.ko.tutorial[`s${i+1}`] = tutorialStepsText[i];
}

function mergeObj(target, source) {
  if (!source) return;
  for (const [key, val] of Object.entries(source)) {
    if (!target[key]) {
      target[key] = {};
    }
    for (const [subKey, subVal] of Object.entries(val)) {
      if (typeof subVal === 'object' && subVal !== null) {
          if (!target[key][subKey]) target[key][subKey] = {};
          mergeObj({ [subKey]: target[key][subKey] }, { [subKey]: subVal });
      } else {
        if (!target[key][subKey]) {
          target[key][subKey] = subVal;
        }
      }
    }
  }
}

mergeObj(en, missing.en);
mergeObj(es, missing.es);
mergeObj(ko, missing.ko);

// We should update the TranslationKey string types as well!
let newTypesCode = typesCode;
if (!newTypesCode.includes('tutorial.')) {
    newTypesCode = newTypesCode.replace('| string;', '| `tutorial.${keyof typeof translations.en.tutorial}`\n  | `companions.${keyof typeof translations.en.companions}`\n  | string;');
}

const newObjCode = `export const translations = ${JSON.stringify({en, es, ko}, null, 2)} as const;\n\n`;

fs.writeFileSync('src/i18n/translations.ts', newObjCode + newTypesCode);

console.log('Successfully patched dynamic tutorial and companion strings!');
