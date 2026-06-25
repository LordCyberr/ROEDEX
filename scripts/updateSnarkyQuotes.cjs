const fs = require('fs');

const snarkyCompanions = {
  en: {
    bob: {
      name: "BOB",
      description: "The Optimistic Explorer. Loves finding new loot and going on adventures.",
      quote: "Try not to die this time, okay? I can only carry so much of your dropped loot."
    },
    kaya: {
      name: "KAYA",
      description: "The Fiery Oni. Always looking for a fight and massive loot drops!",
      quote: "You could have dodged that, noob, but nah... you just want to get hit, huh?"
    },
    lia: {
      name: "LIA",
      description: "The Elf Mage. A mystical companion focused on magic and rare secrets.",
      quote: "My magic is flawless. Your dodging skills, however... leave much to be desired."
    },
    crash: {
      name: "CRASH",
      description: "The Orc Warrior. Brutal and loud, he loves smashing rocks and enemies alike!",
      quote: "You smash bad! Enemy smash you good! Crash laugh at you!"
    }
  },
  es: {
    bob: {
      name: "BOB",
      description: "El Explorador Optimista. Le encanta encontrar nuevos botines e ir de aventuras.",
      quote: "Intenta no morir esta vez, ¿vale? No puedo cargar con todo tu botín tirado."
    },
    kaya: {
      name: "KAYA",
      description: "La Oni Ardiente. ¡Siempre buscando pelea y grandes botines!",
      quote: "Podrías haberlo esquivado, novato, pero nah... querías que te golpearan, ¿eh?"
    },
    lia: {
      name: "LIA",
      description: "La Maga Elfa. Una compañera mística centrada en la magia y los secretos raros.",
      quote: "Mi magia es impecable. Tus habilidades para esquivar, sin embargo... dejan mucho que desear."
    },
    crash: {
      name: "CRASH",
      description: "El Guerrero Orco. ¡Brutal y ruidoso, le encanta romper rocas y enemigos por igual!",
      quote: "¡Tú aplastar mal! ¡Enemigo aplastar bien! ¡Crash reír de ti!"
    }
  },
  ru: {
    bob: {
      name: "БОБ",
      description: "Оптимистичный Исследователь. Любит находить новый лут и отправляться в приключения.",
      quote: "Постарайся не умереть в этот раз, ладно? Я не смогу унести весь твой выпавший лут."
    },
    kaya: {
      name: "КАЙЯ",
      description: "Огненная Они. Всегда ищет драку и огромные кучи лута!",
      quote: "Ты мог бы и уклониться, нуб, но не-е-ет... тебе же нравится получать по лицу, да?"
    },
    lia: {
      name: "ЛИЯ",
      description: "Эльф-Маг. Мистический компаньон, сосредоточенный на магии и редких секретах.",
      quote: "Моя магия безупречна. А вот твои навыки уклонения... оставляют желать лучшего."
    },
    crash: {
      name: "КРАШ",
      description: "Орк-Воин. Жестокий и громкий, он любит крушить как камни, так и врагов!",
      quote: "Ты бить плохо! Враг бить тебя хорошо! Краш смеяться над тобой!"
    }
  },
  ko: {
    bob: {
      name: "밥",
      description: "낙관적인 탐험가. 새로운 전리품을 찾고 모험을 떠나는 것을 좋아합니다.",
      quote: "이번에는 제발 죽지 마, 알았지? 네가 떨어뜨린 짐을 다 들기엔 무겁다고."
    },
    kaya: {
      name: "카야",
      description: "불같은 오니. 항상 싸움과 엄청난 전리품 드롭을 찾고 있습니다!",
      quote: "피할 수 있었잖아, 뉴비야. 아냐, 넌 그냥 맞고 싶었던 거겠지, 어?"
    },
    lia: {
      name: "리아",
      description: "엘프 마법사. 마법과 희귀한 비밀에 초점을 맞춘 신비로운 동반자입니다.",
      quote: "내 마법은 완벽해요. 하지만 당신의 회피 실력은... 좀 많이 부족하네요."
    },
    crash: {
      name: "크래시",
      description: "오크 전사. 잔인하고 시끄러우며, 바위와 적을 부수는 것을 좋아합니다!",
      quote: "너 때리는 거 구려! 적이 널 아주 잘 때려! 크래시가 널 비웃는다!"
    }
  }
};

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of Object.keys(snarkyCompanions)) {
  const data = snarkyCompanions[lang];
  // Replace the entire companions block for each language
  const regex = new RegExp(`(${lang}: \\{[\\s\\S]*?)companions: \\{[\\s\\S]*?\\},(\\s*tutorial:)`);
  content = content.replace(regex, (match, p1, p2) => {
    let toInject = `companions: ${JSON.stringify(data, null, 6)},`;
    // Fix indentation
    toInject = toInject.replace(/\"([a-zA-Z0-9_]+)\":/g, "$1:");
    toInject = toInject.replace(/\n}/g, "\n    }");
    return p1 + toInject + p2;
  });
}

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
console.log('Successfully updated snarky companion quotes.');
