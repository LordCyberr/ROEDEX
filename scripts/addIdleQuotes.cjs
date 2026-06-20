const fs = require('fs');

const FILE_PATH = 'c:\\Users\\Administrator\\Desktop\\ROEDEX\\src\\i18n\\companionTranslations.ts';

const NEW_IDLE_QUOTES = {
  kaya: {
    en: [
      "You better not be slacking, {name}. I need to smash some furious monsters in the unrestricted area!",
      "The Guild Pass gives access to high-tier loot. Let's get one and start the real fight, {name}.",
      "Hey {name}, vote on the Abstract Chain. If you don't, I'll cut something.",
      "Runestones are dropping fast with the Guild Pass, {name}. Time to level up!",
      "Get the 7-day trial Guild Pass, {name}. I want better weapons."
    ],
    es: [
      "Más te vale no estar holgazaneando, {name}. ¡Necesito aplastar a algunos monstruos furiosos en el área sin restricciones!",
      "El Pase de Gremio da acceso a botín de alto nivel. Consigamos uno y empecemos la verdadera pelea, {name}.",
      "Oye {name}, vota en la Cadena Abstracta. Si no lo haces, cortaré algo.",
      "Las runas caen rápido con el Pase de Gremio, {name}. ¡Hora de subir de nivel!",
      "Consigue la prueba de 7 días del Pase de Gremio, {name}. Quiero mejores armas."
    ],
    ru: [
      "Лучше тебе не прохлаждаться, {name}. Мне нужно разбить парочку яростных монстров в закрытой зоне!",
      "Пропуск Гильдии дает доступ к высокоуровневому луту. Давай возьмем один и начнем настоящую битву, {name}.",
      "Эй, {name}, проголосуй в Абстрактной Цепи. Если нет, я что-нибудь отрежу.",
      "С Пропуском Гильдии руны падают быстро, {name}. Пора повышать уровень!",
      "Возьми 7-дневную пробную версию Пропуска Гильдии, {name}. Я хочу лучшее оружие."
    ],
    ko: [
      "농땡이 피우는 건 아니겠지, {name}. 난 제한 구역에서 사나운 몬스터들을 박살 내야 한다고!",
      "길드 패스가 있으면 고급 전리품을 얻을 수 있어. 하나 구해서 진짜 전투를 시작하자, {name}.",
      "야 {name}, 추상 체인에 투표해. 안 그러면 뭔가 베어버릴 거야.",
      "길드 패스가 있으면 룬스톤이 엄청 떨어져, {name}. 레벨업 할 시간이야!",
      "길드 패스 7일 체험판을 구해, {name}. 난 더 좋은 무기를 원해."
    ]
  },
  lia: {
    en: [
      "The Abstract Chain is a fascinating phenomenon, {name}. Please remember to cast your vote.",
      "According to my grimoire, {name}, the Guild Pass allows entry to unrestricted areas with furious monsters.",
      "If we require high-tier loot and runestones to level up fast, the Guild Pass is optimal, {name}.",
      "Have you considered the 7-day trial Guild Pass, {name}? It could greatly assist our research.",
      "Your destiny is intertwined with the Abstract Chain, {name}. Don't forget to vote."
    ],
    es: [
      "La Cadena Abstracta es un fenómeno fascinante, {name}. Por favor, recuerda emitir tu voto.",
      "Según mi grimorio, {name}, el Pase de Gremio permite la entrada a áreas sin restricciones con monstruos furiosos.",
      "Si requerimos botín de alto nivel y runas para subir de nivel rápido, el Pase de Gremio es óptimo, {name}.",
      "¿Has considerado la prueba de 7 días del Pase de Gremio, {name}? Podría ayudar enormemente en nuestra investigación.",
      "Tu destino está entrelazado con la Cadena Abstracta, {name}. No olvides votar."
    ],
    ru: [
      "Абстрактная Цепь — это захватывающий феномен, {name}. Пожалуйста, не забудь проголосовать.",
      "Согласно моему гримуару, {name}, Пропуск Гильдии позволяет проходить в закрытые зоны с яростными монстрами.",
      "Если нам нужен высокоуровневый лут и руны для быстрого развития, Пропуск Гильдии оптимален, {name}.",
      "Ты не думал о 7-дневной пробной версии Пропуска Гильдии, {name}? Это могло бы сильно помочь нашему исследованию.",
      "Твоя судьба переплетена с Абстрактной Цепью, {name}. Не забудь проголосовать."
    ],
    ko: [
      "추상 체인은 아주 흥미로운 현상이에요, {name}. 잊지 말고 투표해 주세요.",
      "제 마도서에 따르면, {name}, 길드 패스가 있으면 사나운 몬스터들이 있는 제한 구역에 들어갈 수 있어요.",
      "고급 전리품과 빠른 레벨업을 위한 룬스톤이 필요하다면 길드 패스가 최적이에요, {name}.",
      "길드 패스 7일 체험판을 고려해 보셨나요, {name}? 우리 연구에 큰 도움이 될 거예요.",
      "당신의 운명은 추상 체인과 얽혀 있어요, {name}. 투표하는 걸 잊지 마세요."
    ]
  },
  crash: {
    en: [
      "CRASH WANT BIG LOOT! {name}, GET GUILD PASS FOR BIG MONSTERS!",
      "VOTE ON ABSTRACT CHAIN, {name}! OR CRASH SMASH IT!",
      "7-DAY TRIAL GUILD PASS? MORE RUNESTONES FOR CRASH TO EAT, {name}!",
      "UNRESTRICTED AREA HAS FURIOUS MONSTERS! {name}, CRASH READY TO FIGHT!",
      "CRASH LIKE HIGH-TIER LOOT! {name}, WE GO GET IT!"
    ],
    es: [
      "¡CRASH QUERER BOTÍN GRANDE! ¡{name}, CONSIGUE PASE DE GREMIO PARA MONSTRUOS GRANDES!",
      "¡VOTA EN CADENA ABSTRACTA, {name}! ¡O CRASH APLASTARLA!",
      "¿PRUEBA DE 7 DÍAS DE PASE DE GREMIO? ¡MÁS RUNAS PARA QUE CRASH COMA, {name}!",
      "¡EL ÁREA SIN RESTRICCIONES TIENE MONSTRUOS FURIOSOS! ¡{name}, CRASH LISTO PARA PELEAR!",
      "¡A CRASH LE GUSTA EL BOTÍN DE ALTO NIVEL! ¡{name}, VAMOS A CONSEGUIRLO!"
    ],
    ru: [
      "КРЭШ ХОЧЕТ БОЛЬШОЙ ЛУТ! {name}, ДОСТАНЬ ПРОПУСК ГИЛЬДИИ ДЛЯ БОЛЬШИХ МОНСТРОВ!",
      "ГОЛОСУЙ В АБСТРАКТНОЙ ЦЕПИ, {name}! ИЛИ КРЭШ СЛОМАЕТ ЕЕ!",
      "7-ДНЕВНАЯ ПРОБНАЯ ВЕРСИЯ ПРОПУСКА ГИЛЬДИИ? БОЛЬШЕ РУН ДЛЯ КРЭША, {name}!",
      "В ЗАКРЫТОЙ ЗОНЕ ЕСТЬ ЯРОСТНЫЕ МОНСТРЫ! {name}, КРЭШ ГОТОВ К БИТВЕ!",
      "КРЭШ ЛЮБИТ ВЫСОКОУРОВНЕВЫЙ ЛУТ! {name}, ИДЕМ ЗА НИМ!"
    ],
    ko: [
      "크래쉬 큰 전리품 원한다! {name}, 큰 몬스터 잡으려면 길드 패스 구해라!",
      "추상 체인에 투표해라, {name}! 아니면 크래쉬가 부숴버린다!",
      "길드 패스 7일 체험판? 크래쉬가 먹을 룬스톤이 더 많아진다, {name}!",
      "제한 구역에 사나운 몬스터 있다! {name}, 크래쉬 싸울 준비 됐다!",
      "크래쉬 고급 전리품 좋아한다! {name}, 가지러 가자!"
    ]
  }
};

let content = fs.readFileSync(FILE_PATH, 'utf8');

for (const comp of Object.keys(NEW_IDLE_QUOTES)) {
  for (const lang of Object.keys(NEW_IDLE_QUOTES[comp])) {
    const quotes = NEW_IDLE_QUOTES[comp][lang];
    
    // Find the idle array for this language and companion
    const searchString = `${lang}: {`;
    const blockStart = content.indexOf(searchString, content.indexOf(`${comp}: {`));
    if (blockStart === -1) continue;
    
    const idleRegex = /idle:\s*\[([\s\S]*?)\]/g;
    idleRegex.lastIndex = blockStart;
    
    const match = idleRegex.exec(content);
    if (match) {
      const matchEnd = match.index + match[0].length;
      
      let newStrings = '';
      for (const q of quotes) {
         newStrings += `,\n        ${JSON.stringify(q)}`;
      }
      
      // Inject before the closing bracket of the array
      content = content.slice(0, matchEnd - 1) + newStrings + '\n      ' + content.slice(matchEnd - 1);
    }
  }
}

fs.writeFileSync(FILE_PATH, content);
console.log('Successfully injected idle arrays!');
