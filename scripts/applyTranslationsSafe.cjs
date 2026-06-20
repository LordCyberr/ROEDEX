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

const NEW_ARRAYS = {
  kaya: {
    en: {
      zoneGuild: ["I don't play well with others. Why are we at the guild?", "Guilds are just an excuse for weaklings to group up.", "Hmph. I can solo everything they post on that board."],
      zoneAlchemist: ["Potions? I prefer not getting hit in the first place.", "It smells like crushed dreams and weird herbs in here.", "Buy some healing potions, {name}. You'll need them, I won't."],
      zoneSmith: ["Finally, a place that appreciates a sharp edge.", "The heat of the forge... reminds me of battle.", "Is my sword sharp enough? Only one way to find out."],
      zonePhilbert: ["Philbert's shop. Don't spend all your Runes on junk, {name}.", "What kind of name is Philbert? Sounds weak.", "Let's grab what we need and get back to smashing."],
      zoneBank: ["Stashing your loot? Cowardly, but smart.", "The bank is safe, but boring.", "Don't lock away my weapons, {name}!"],
      monsterSlime: ["A slime? I'll cut it into a hundred smaller slimes!", "Ugh, slimes are so messy to clean off my blade.", "Don't let it touch my boots!"],
      monsterGolem: ["Golems! Now THIS is a real fight!", "Rock against steel. Let's see who breaks first.", "I'll shatter it into pebbles!"],
      monsterWoodenGolem: ["Wooden golem? It's just walking firewood.", "I'll chop it down faster than you can say 'timber'.", "Let's turn this wooden golem into toothpicks, {name}!"],
      monsterShadowWolf: ["A shadow wolf. Fast, but I'm faster.", "Nice doggy. Time to put you down.", "Shadow wolves drop good loot. Don't let it escape!"]
    },
    es: {
      zoneGuild: ["No me llevo bien con los demás. ¿Por qué estamos en el gremio?", "Los gremios son solo una excusa para que los debiluchos se agrupen.", "Hmph. Puedo hacer en solitario todo lo que publican en ese tablón."],
      zoneAlchemist: ["¿Pociones? Prefiero no recibir golpes en primer lugar.", "Huele a sueños aplastados y hierbas raras aquí.", "Compra algunas pociones de curación, {name}. Tú las necesitarás, yo no."],
      zoneSmith: ["Por fin, un lugar que aprecia un borde afilado.", "El calor de la forja... me recuerda a la batalla.", "¿Está mi espada lo suficientemente afilada? Solo hay una forma de saberlo."],
      zonePhilbert: ["La tienda de Philbert. No gastes todas tus Runas en chatarra, {name}.", "¿Qué clase de nombre es Philbert? Suena débil.", "Agarremos lo que necesitamos y volvamos a aplastar."],
      zoneBank: ["¿Escondiendo tu botín? Cobarde, pero inteligente.", "El banco es seguro, pero aburrido.", "¡No encierres mis armas, {name}!"],
      monsterSlime: ["¿Un limo? ¡Lo cortaré en cien limos más pequeños!", "Ugh, los limos son muy difíciles de limpiar de mi espada.", "¡No dejes que toque mis botas!"],
      monsterGolem: ["¡Golems! ¡ESTA es una pelea real!", "Roca contra acero. Veamos quién se rompe primero.", "¡Lo haré añicos!"],
      monsterWoodenGolem: ["¿Golem de madera? Es solo leña que camina.", "Lo talaré más rápido de lo que puedes decir 'árbol'.", "¡Convirtamos a este golem de madera en palillos, {name}!"],
      monsterShadowWolf: ["Un lobo de las sombras. Rápido, pero yo soy más rápida.", "Lindo perrito. Hora de sacrificarte.", "Los lobos de las sombras dejan buen botín. ¡No dejes que escape!"]
    },
    ru: {
      zoneGuild: ["Я плохо лажу с другими. Почему мы в гильдии?", "Гильдии — это просто повод для слабаков сбиться в кучу.", "Хмф. Я могу пройти в соло все, что они вешают на эту доску."],
      zoneAlchemist: ["Зелья? Я предпочитаю вообще не получать урон.", "Здесь пахнет растоптанными мечтами и странными травами.", "Купи зелий лечения, {name}. Они тебе понадобятся, мне — нет."],
      zoneSmith: ["Наконец-то место, где ценят острый клинок.", "Жар кузницы... напоминает мне о битве.", "Достаточно ли остр мой меч? Есть только один способ узнать."],
      zonePhilbert: ["Магазин Филберта. Не трать все свои Руны на хлам, {name}.", "Что за имя такое, Филберт? Звучит слабо.", "Давай возьмем то, что нужно, и вернемся к дракам."],
      zoneBank: ["Прячешь свой лут? Трусливо, но умно.", "В банке безопасно, но скучно.", "Не запирай мое оружие, {name}!"],
      monsterSlime: ["Слайм? Я разрежу его на сотню маленьких слаймов!", "Уф, слаймы так тяжело оттирать от моего клинка.", "Не дай ему коснуться моих сапог!"],
      monsterGolem: ["Големы! Вот ЭТО настоящий бой!", "Камень против стали. Посмотрим, кто сломается первым.", "Я разобью его в гальку!"],
      monsterWoodenGolem: ["Деревянный голем? Это просто ходячие дрова.", "Я срублю его быстрее, чем ты успеешь сказать 'берегись'.", "Давай пустим этого деревянного голема на зубочистки, {name}!"],
      monsterShadowWolf: ["Теневой волк. Быстрый, но я быстрее.", "Хорошая собачка. Пора тебя усыпить.", "С теневых волков падает хороший лут. Не дай ему сбежать!"]
    },
    ko: {
      zoneGuild: ["난 다른 사람들이랑 잘 안 맞아. 왜 길드에 온 거야?", "길드는 약골들이 모이기 위한 변명일 뿐이야.", "흥. 저 게시판에 있는 건 나 혼자 다 깰 수 있어."],
      zoneAlchemist: ["포션? 난 애초에 안 맞는 걸 선호해.", "여기선 짓밟힌 꿈과 이상한 허브 냄새가 나.", "치료 포션 좀 사둬, {name}. 넌 필요할 테니까, 난 안 쓰지만."],
      zoneSmith: ["드디어 날카로운 칼날을 알아주는 곳이네.", "대장간의 열기... 전투가 생각나게 해.", "내 검이 충분히 날카로운가? 알아볼 방법은 하나뿐이지."],
      zonePhilbert: ["필버트의 상점. 쓰레기에 룬스톤을 다 쓰지 마, {name}.", "필버트가 무슨 이름이야? 약골 같네.", "필요한 것만 사고 다시 부수러 가자."],
      zoneBank: ["전리품을 숨기는 거야? 겁쟁이 같지만 현명하네.", "은행은 안전하지만 지루해.", "내 무기를 가둬두지 마, {name}!"],
      monsterSlime: ["슬라임? 백 개의 작은 슬라임으로 베어버리겠어!", "으, 슬라임은 내 검에서 닦아내기 너무 힘들어.", "내 부츠에 닿게 하지 마!"],
      monsterGolem: ["골렘! 이제야 진짜 싸움이네!", "바위 대 강철. 누가 먼저 부서질지 보자고.", "조약돌로 부숴버리겠어!"],
      monsterWoodenGolem: ["나무 골렘? 그냥 걸어다니는 장작이네.", "네가 '나무 쓰러진다'라고 말하기도 전에 베어주지.", "이 나무 골렘을 이쑤시개로 만들어버리자, {name}!"],
      monsterShadowWolf: ["그림자 늑대. 빠르네, 하지만 내가 더 빨라.", "착한 멍멍이. 이제 잠들 시간이야.", "그림자 늑대는 좋은 전리품을 줘. 놓치지 마!"]
    }
  },
  lia: {
    en: {
      zoneGuild: ["The guild is a wonderful place to share knowledge.", "So many adventurers, so many stories to document.", "I wonder if they have a library here?"],
      zoneAlchemist: ["Fascinating concoctions! The alchemical formulas here are intricate.", "I must take notes on these potion recipes.", "Always good to stock up on mana and health potions, {name}."],
      zoneSmith: ["The craftsmanship of these weapons is quite impressive.", "Even a grimoire needs a sturdy binding. The smith understands durability.", "Make sure your equipment is fully repaired, {name}."],
      zonePhilbert: ["Philbert has an eclectic collection of items.", "One person's trash is another's magical component.", "Let's see if Philbert has any rare tomes today."],
      zoneBank: ["A prudent decision to store your valuables.", "The bank's magical wards are quite strong.", "Safety first. We wouldn't want to lose our hard-earned loot."],
      monsterSlime: ["A slime. Its cellular structure is quite peculiar.", "Avoid its acidic residue, {name}.", "Slimes are highly resilient to physical attacks, use magic!"],
      monsterGolem: ["An elemental construct of stone. Aim for the joints!", "The golem's core is its weak point. Find it, {name}!", "Fascinating golemancy at work here."],
      monsterWoodenGolem: ["A wooden golem. It's susceptible to fire magic.", "Animated timber. Watch out for its heavy swings.", "It moves clumsily, but carries immense force."],
      monsterShadowWolf: ["A shadow wolf. It uses the darkness to mask its approach.", "Stay close to the light, {name}. The wolf relies on stealth.", "A beautiful, yet dangerous creature of the night."]
    },
    es: {
      zoneGuild: ["El gremio es un lugar maravilloso para compartir conocimientos.", "Tantos aventureros, tantas historias para documentar.", "¿Me pregunto si tendrán una biblioteca aquí?"],
      zoneAlchemist: ["¡Brebajes fascinantes! Las fórmulas alquímicas aquí son intrincadas.", "Debo tomar notas de estas recetas de pociones.", "Siempre es bueno abastecerse de pociones de salud y maná, {name}."],
      zoneSmith: ["La artesanía de estas armas es bastante impresionante.", "Incluso un grimorio necesita una encuadernación robusta. El herrero entiende de durabilidad.", "Asegúrate de que tu equipo esté completamente reparado, {name}."],
      zonePhilbert: ["Philbert tiene una colección ecléctica de artículos.", "La basura de una persona es el componente mágico de otra.", "Veamos si Philbert tiene algún tomo raro hoy."],
      zoneBank: ["Una decisión prudente guardar tus objetos de valor.", "Las barreras mágicas del banco son bastante fuertes.", "La seguridad es lo primero. No querríamos perder nuestro preciado botín."],
      monsterSlime: ["Un limo. Su estructura celular es bastante peculiar.", "Evita su residuo ácido, {name}.", "¡Los limos son muy resistentes a los ataques físicos, usa magia!"],
      monsterGolem: ["Un constructo elemental de piedra. ¡Apunta a las articulaciones!", "El núcleo del golem es su punto débil. ¡Encuéntralo, {name}!", "Fascinante golemancia en acción aquí."],
      monsterWoodenGolem: ["Un golem de madera. Es susceptible a la magia de fuego.", "Madera animada. Cuidado con sus golpes pesados.", "Se mueve torpemente, pero tiene una fuerza inmensa."],
      monsterShadowWolf: ["Un lobo de las sombras. Usa la oscuridad para ocultar su acercamiento.", "Mantente cerca de la luz, {name}. El lobo se basa en el sigilo.", "Una hermosa pero peligrosa criatura de la noche."]
    },
    ru: {
      zoneGuild: ["Гильдия — прекрасное место для обмена знаниями.", "Так много искателей приключений, так много историй для записи.", "Интересно, у них тут есть библиотека?"],
      zoneAlchemist: ["Очаровательные смеси! Здешние алхимические формулы весьма сложны.", "Я должна записать эти рецепты зелий.", "Всегда полезно запастись зельями маны и здоровья, {name}."],
      zoneSmith: ["Мастерство этих оружейников весьма впечатляет.", "Даже гримуару нужен крепкий переплет. Кузнец понимает толк в прочности.", "Убедись, что твое снаряжение полностью починено, {name}."],
      zonePhilbert: ["У Филберта весьма эклектичная коллекция предметов.", "Мусор одного — это магический компонент другого.", "Посмотрим, есть ли сегодня у Филберта редкие фолианты."],
      zoneBank: ["Благоразумное решение спрятать свои ценности.", "Магические защиты банка довольно сильны.", "Безопасность прежде всего. Мы бы не хотели потерять наш с трудом добытый лут."],
      monsterSlime: ["Слайм. Его клеточная структура весьма специфична.", "Избегай его кислотных остатков, {name}.", "Слаймы очень устойчивы к физическим атакам, используй магию!"],
      monsterGolem: ["Элементальный конструкт из камня. Целься в суставы!", "Ядро голема — его слабое место. Найди его, {name}!", "Поразительная големантия."],
      monsterWoodenGolem: ["Деревянный голем. Он уязвим к магии огня.", "Оживленная древесина. Остерегайся его тяжелых ударов.", "Он движется неуклюже, но обладает огромной силой."],
      monsterShadowWolf: ["Теневой волк. Он использует тьму, чтобы скрыть свое приближение.", "Держись поближе к свету, {name}. Волк полагается на скрытность.", "Прекрасное, но опасное создание ночи."]
    },
    ko: {
      zoneGuild: ["길드는 지식을 공유하기에 아주 훌륭한 곳이에요.", "정말 많은 모험가들, 기록할 이야기가 아주 많네요.", "여기도 도서관이 있을까요?"],
      zoneAlchemist: ["매혹적인 혼합물이네요! 이곳의 연금술 공식은 아주 복잡해요.", "이 포션 레시피들을 기록해 둬야겠어요.", "마나와 체력 포션을 비축해두는 건 항상 좋은 선택이에요, {name}."],
      zoneSmith: ["이 무기들의 솜씨가 꽤 인상적이네요.", "마도서에도 튼튼한 제본이 필요하죠. 대장장이는 내구성을 잘 알아요.", "장비가 완전히 수리되었는지 확인하세요, {name}."],
      zonePhilbert: ["필버트는 꽤 독특한 물건들을 모아두네요.", "누군가의 쓰레기는 다른 누군가의 마법 재료가 되기도 하죠.", "오늘 필버트에게 희귀한 고서가 있는지 볼까요."],
      zoneBank: ["귀중품을 보관하는 건 신중한 결정이에요.", "은행의 마법 결계는 꽤 강력하네요.", "안전이 최우선이죠. 힘들게 얻은 전리품을 잃고 싶진 않으니까요."],
      monsterSlime: ["슬라임이네요. 세포 구조가 아주 특이해요.", "산성 잔여물에 닿지 않게 조심하세요, {name}.", "슬라임은 물리 공격에 저항력이 강해요, 마법을 쓰세요!"],
      monsterGolem: ["돌로 된 정령 구조물이네요. 관절을 노리세요!", "골렘의 핵이 약점이에요. 핵을 찾으세요, {name}!", "흥미로운 골렘술이 쓰였네요."],
      monsterWoodenGolem: ["나무 골렘이네요. 불 마법에 약해요.", "움직이는 목재. 무거운 공격을 조심하세요.", "움직임은 둔하지만 엄청난 힘을 가지고 있어요."],
      monsterShadowWolf: ["그림자 늑대. 어둠을 이용해 접근을 숨기고 있어요.", "빛 가까이에 머무세요, {name}. 늑대는 은신을 주로 사용해요.", "아름답지만 위험한 밤의 생물이죠."]
    }
  },
  crash: {
    en: {
      zoneGuild: ["TOO MANY PEOPLE! CRASH NOT LIKE CROWDS!", "WHAT IS GUILD? CAN CRASH SMASH IT?", "PEOPLE LOOK AT CRASH FUNNY. CRASH STARE BACK!"],
      zoneAlchemist: ["SMELLS LIKE WEIRD WATER! CRASH NO DRINK!", "SHINY BOTTLES! CRASH WANT TO BREAK THEM!", "WHY BUY POTION? JUST EAT MEAT!"],
      zoneSmith: ["METAL MAN MAKE BIG HAMMERS! CRASH RESPECT!", "FIRE HOT! CRASH LIKE FIRE!", "CRASH WANT BIGGER AXE! MAKE IT HEAVIER!"],
      zonePhilbert: ["PHILBERT LOOK WEAK. CRASH COULD SNAP HIM!", "TOO MUCH JUNK! CRASH ONLY WANT SHINY ROCKS!", "WHY WE HERE, {name}? CRASH BORED!"],
      zoneBank: ["CRASH HIDE ROCKS HERE! NOBODY STEAL!", "BANK STRONG. CRASH TRY TO PUNCH WALL. WALL WON.", "PUT LOOT IN BOX. GET LOOT LATER!"],
      monsterSlime: ["SQUISHY MONSTER! CRASH SQUISH MORE!", "EWW! SLIME TASTE BAD!", "CRASH HAMMER BOUNCE OFF! STUPID JELLY!"],
      monsterGolem: ["BIG ROCK MONSTER! CRASH LOVE ROCKS!", "CRASH SMASH GOLEM! CRASH STRONGER!", "GOLEM HIT HARD. CRASH HIT HARDER!"],
      monsterWoodenGolem: ["WALKING TREE! CRASH CHOP DOWN!", "WOOD MONSTER MAKE GOOD FIRE!", "CRASH BREAK STICKS! CRASH WIN!"],
      monsterShadowWolf: ["DARK DOGGY! CRASH BITE BACK!", "WOLF MOVE FAST! CRASH SMASH GROUND TO CATCH!", "CRASH WEAR WOLF FUR FOR WINTER!"]
    },
    es: {
      zoneGuild: ["¡DEMASIADA GENTE! ¡A CRASH NO GUSTAR MULTITUDES!", "¿QUÉ ES GREMIO? ¿CRASH PUEDE APLASTARLO?", "GENTE MIRAR RARO A CRASH. ¡CRASH DEVOLVER MIRADA!"],
      zoneAlchemist: ["¡HUELE A AGUA RARA! ¡CRASH NO BEBER!", "¡BOTELLAS BRILLANTES! ¡CRASH QUERER ROMPERLAS!", "¿POR QUÉ COMPRAR POCIÓN? ¡SOLO COME CARNE!"],
      zoneSmith: ["¡HOMBRE DE METAL HACE MARTILLOS GRANDES! ¡CRASH RESPETA!", "¡FUEGO CALIENTE! ¡A CRASH LE GUSTA EL FUEGO!", "¡CRASH QUERER HACHA MÁS GRANDE! ¡HAZLA MÁS PESADA!"],
      zonePhilbert: ["PHILBERT PARECE DÉBIL. ¡CRASH PODRÍA PARTIRLO!", "¡DEMASIADA BASURA! ¡CRASH SOLO QUIERE ROCAS BRILLANTES!", "¿POR QUÉ ESTAMOS AQUÍ, {name}? ¡CRASH ABURRIDO!"],
      zoneBank: ["¡CRASH ESCONDER ROCAS AQUÍ! ¡NADIE ROBAR!", "BANCO FUERTE. CRASH INTENTAR GOLPEAR PARED. PARED GANÓ.", "PONER BOTÍN EN CAJA. ¡RECOGER BOTÍN LUEGO!"],
      monsterSlime: ["¡MONSTRUO BLANDO! ¡CRASH APLASTAR MÁS!", "¡EWW! ¡EL LIMO SABE MAL!", "¡EL MARTILLO DE CRASH REBOTA! ¡GELATINA ESTÚPIDA!"],
      monsterGolem: ["¡MONSTRUO DE ROCA GRANDE! ¡CRASH AMA LAS ROCAS!", "¡CRASH APLASTAR GOLEM! ¡CRASH MÁS FUERTE!", "GOLEM GOLPEA FUERTE. ¡CRASH GOLPEA MÁS FUERTE!"],
      monsterWoodenGolem: ["¡ÁRBOL QUE CAMINA! ¡CRASH TALAR!", "¡MONSTRUO DE MADERA HACE BUEN FUEGO!", "¡CRASH ROMPER PALOS! ¡CRASH GANA!"],
      monsterShadowWolf: ["¡PERRITO OSCURO! ¡CRASH MORDER TAMBIÉN!", "¡LOBO SE MUEVE RÁPIDO! ¡CRASH APLASTAR SUELO PARA ATRAPAR!", "¡CRASH USAR PIEL DE LOBO PARA EL INVIERNO!"]
    },
    ru: {
      zoneGuild: ["СЛИШКОМ МНОГО ЛЮДЕЙ! КРЭШ НЕ ЛЮБИТ ТОЛПУ!", "ЧТО ТАКОЕ ГИЛЬДИЯ? КРЭШ МОЖЕТ ЭТО СЛОМАТЬ?", "ЛЮДИ СМОТРЯТ НА КРЭША СТРАННО. КРЭШ СМОТРИТ В ОТВЕТ!"],
      zoneAlchemist: ["ПАХНЕТ СТРАННОЙ ВОДОЙ! КРЭШ НЕ БУДЕТ ПИТЬ!", "БЛЕСТЯЩИЕ БУТЫЛКИ! КРЭШ ХОЧЕТ ИХ РАЗБИТЬ!", "ЗАЧЕМ ПОКУПАТЬ ЗЕЛЬЕ? ПРОСТО ЕШЬ МЯСО!"],
      zoneSmith: ["ЖЕЛЕЗНЫЙ ЧЕЛОВЕК ДЕЛАЕТ БОЛЬШИЕ МОЛОТЫ! КРЭШ УВАЖАЕТ!", "ОГОНЬ ГОРЯЧИЙ! КРЭШ ЛЮБИТ ОГОНЬ!", "КРЭШ ХОЧЕТ ТОПОР ПОБОЛЬШЕ! СДЕЛАЙТЕ ЕГО ТЯЖЕЛЕЕ!"],
      zonePhilbert: ["ФИЛБЕРТ ВЫГЛЯДИТ СЛАБЫМ. КРЭШ МОГ БЫ ЕГО СЛОМАТЬ!", "СЛИШКОМ МНОГО ХЛАМА! КРЭШ ХОЧЕТ ТОЛЬКО БЛЕСТЯЩИЕ КАМНИ!", "ПОЧЕМУ МЫ ЗДЕСЬ, {name}? КРЭШУ СКУЧНО!"],
      zoneBank: ["КРЭШ СПРЯТАТЬ КАМНИ ЗДЕСЬ! НИКТО НЕ УКРАДЕТ!", "БАНК КРЕПКИЙ. КРЭШ ПОПЫТАТЬСЯ УДАРИТЬ СТЕНУ. СТЕНА ПОБЕДИЛА.", "ПОЛОЖИТЬ ЛУТ В КОРОБКУ. ВЗЯТЬ ЛУТ ПОТОМ!"],
      monsterSlime: ["МЯГКИЙ МОНСТР! КРЭШ РАЗДАВИТ ЕЩЕ БОЛЬШЕ!", "ФУ! СЛАЙМ НЕВКУСНЫЙ!", "МОЛОТ КРЭША ОТСКАКИВАЕТ! ГЛУПОЕ ЖЕЛЕ!"],
      monsterGolem: ["БОЛЬШОЙ КАМЕННЫЙ МОНСТР! КРЭШ ЛЮБИТ КАМНИ!", "КРЭШ СЛОМАТЬ ГОЛЕМА! КРЭШ СИЛЬНЕЕ!", "ГОЛЕМ БЬЕТ СИЛЬНО. КРЭШ БЬЕТ СИЛЬНЕЕ!"],
      monsterWoodenGolem: ["ХОДЯЧЕЕ ДЕРЕВО! КРЭШ СРУБИТЬ!", "ДЕРЕВЯННЫЙ МОНСТР — ЭТО ХОРОШИЙ ОГОНЬ!", "КРЭШ ЛОМАЕТ ПАЛКИ! КРЭШ ПОБЕДИЛ!"],
      monsterShadowWolf: ["ТЕМНАЯ СОБАЧКА! КРЭШ УКУСИТ В ОТВЕТ!", "ВОЛК ДВИГАЕТСЯ БЫСТРО! КРЭШ УДАРИТЬ ПО ЗЕМЛЕ ЧТОБЫ ПОЙМАТЬ!", "КРЭШ БУДЕТ НОСИТЬ ВОЛЧЬЮ ШКУРУ ЗИМОЙ!"]
    },
    ko: {
      zoneGuild: ["사람 너무 많다! 크래쉬 사람 많은 거 싫다!", "길드가 뭐냐? 크래쉬가 부숴도 되냐?", "사람들이 크래쉬 이상하게 본다. 크래쉬도 노려본다!"],
      zoneAlchemist: ["이상한 물 냄새 난다! 크래쉬 안 마실 거다!", "반짝이는 병들! 크래쉬 깨버리고 싶다!", "왜 포션 사냐? 그냥 고기 먹어라!"],
      zoneSmith: ["금속 인간이 큰 망치 만든다! 크래쉬 존경한다!", "불 뜨겁다! 크래쉬 불 좋아한다!", "크래쉬 더 큰 도끼 원한다! 더 무겁게 만들어라!"],
      zonePhilbert: ["필버트 약해 보인다. 크래쉬가 부러뜨릴 수 있다!", "쓰레기 너무 많다! 크래쉬는 반짝이는 돌만 원한다!", "우리 여기 왜 있냐, {name}? 크래쉬 지루하다!"],
      zoneBank: ["크래쉬 돌 여기 숨긴다! 아무도 못 훔친다!", "은행 튼튼하다. 크래쉬 벽 쳐봤다. 벽이 이겼다.", "전리품 상자에 넣는다. 나중에 전리품 가져간다!"],
      monsterSlime: ["물컹물컹한 몬스터! 크래쉬가 더 짓밟을 거다!", "우웩! 슬라임 맛없다!", "크래쉬 망치가 튕겨 나온다! 멍청한 젤리!"],
      monsterGolem: ["큰 바위 몬스터! 크래쉬 바위 좋아한다!", "크래쉬 골렘 부순다! 크래쉬가 더 세다!", "골렘 세게 친다. 크래쉬가 더 세게 친다!"],
      monsterWoodenGolem: ["걸어다니는 나무! 크래쉬가 벤다!", "나무 몬스터 좋은 불 쏘시개가 될 거다!", "크래쉬 막대기 부순다! 크래쉬가 이겼다!"],
      monsterShadowWolf: ["어두운 강아지! 크래쉬도 물 거다!", "늑대 너무 빠르다! 크래쉬 땅 쳐서 잡을 거다!", "크래쉬 겨울에 늑대 가죽 입을 거다!"]
    }
  }
};

let content = fs.readFileSync(FILE_PATH, 'utf8');

// We split by language to make it safe
const languages = ['en', 'es', 'ru', 'ko'];
const companions = ['kaya', 'lia', 'crash'];

for (const lang of languages) {
  // Find the language block
  const langRegex = new RegExp(`^\\s*${lang}:\\s*\\{`, 'm');
  const langMatch = content.match(langRegex);
  if (!langMatch) continue;
  
  const langIndex = langMatch.index;
  
  for (const comp of companions) {
    const compRegex = new RegExp(`^\\s*${comp}:\\s*\\{`, 'm');
    compRegex.lastIndex = langIndex;
    
    // To only find the companion inside this language block, we just search after langIndex
    const searchArea = content.slice(langIndex);
    const localCompMatch = searchArea.match(compRegex);
    if (!localCompMatch) continue;
    
    const compIndex = langIndex + localCompMatch.index;
    
    // Find the end of idle array
    const idleRegex = /^\s*idle:\s*\[([\s\S]*?)\]/m;
    const localIdleMatch = content.slice(compIndex).match(idleRegex);
    if (localIdleMatch) {
       const idleEndIndex = compIndex + localIdleMatch.index + localIdleMatch[0].length - 1; // pointing to ']'
       let newIdleStrings = '';
       for (const str of NEW_IDLE_QUOTES[comp][lang]) {
         newIdleStrings += `,\n        ${JSON.stringify(str)}`;
       }
       content = content.slice(0, idleEndIndex) + newIdleStrings + '\n      ' + content.slice(idleEndIndex);
    }
    
    // Find the zoneCave property to inject after it
    const caveRegex = /^\s*zoneCave:\s*\[([\s\S]*?)\]/m;
    const localCaveMatch = content.slice(compIndex).match(caveRegex);
    if (localCaveMatch) {
       const caveEndIndex = compIndex + localCaveMatch.index + localCaveMatch[0].length; // pointing after ']'
       
       let newProps = '';
       const props = NEW_ARRAYS[comp][lang];
       for (const key of Object.keys(props)) {
         newProps += `,\n      ${key}: ${JSON.stringify(props[key], null, 2).replace(/\\n/g, '').replace(/\[\n\s*/g, '[\n        ').replace(/\n\s*\]/g, '\n      ]')}`;
       }
       
       content = content.slice(0, caveEndIndex) + newProps + content.slice(caveEndIndex);
    }
  }
}

fs.writeFileSync(FILE_PATH, content);
console.log("Successfully safely applied translations.");
