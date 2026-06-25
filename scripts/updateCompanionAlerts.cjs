const fs = require('fs');
let text = fs.readFileSync('src/i18n/companionTranslations.ts', 'utf-8');

const es_alerts = `    alerts: {
      slayerMilestone: "¡Hito alcanzado! ¡Has matado 10 {monster}s seguidos!",
      levelUpReady: "¡Tienes suficientes Runas para subir de nivel! ¡Vamos al Templo!",
      mythicDrop: "¡HURRA! ¡Finalmente conseguiste {qty}x {item}!",
      zoneEnter: "Has entrado en {zone}.",
      cheatDetected: "¡Trampa detectada!"
    },
    roedexTips: [
      "¿Sabías que puedes rastrear tu eficiencia agrícola? ¡Abre la pestaña Botín y haz un Time Attack de 10 minutos!",
      "Si ves un mob que quieres cultivar, haz clic en la estrella para agregarlo a Favoritos. ¡Mucho más fácil de rastrear!",
      "Puedes personalizar mi voz, posición y estado de ánimo en Configuración. ¡Pero por favor, no me silencies!",
      "Capto muchas señales cerca. ¡Revisa la pestaña Global para ver qué tan lejos están esos árboles y mobs!",
      "¿Necesitas saber el precio de tu botín? El Rastreador estima los valores de reventa automáticamente."
    ],`;

const ru_alerts = `    alerts: {
      slayerMilestone: "Рубеж пройден! Вы убили 10 {monster} подряд!",
      levelUpReady: "У вас достаточно Рун для повышения уровня! Вперед в Храм!",
      mythicDrop: "УРА! Вы наконец-то получили {qty}x {item}!",
      zoneEnter: "Вы вошли в {zone}.",
      cheatDetected: "Обнаружено читерство!"
    },
    roedexTips: [
      "А вы знали, что можно отслеживать эффективность фарма? Откройте вкладку Лут и запустите Тайм-атаку на 10 минут!",
      "Если видите моба, которого хотите пофармить, нажмите на звездочку, чтобы добавить его в Избранное!",
      "Вы можете настроить мой голос, позицию и настроение в Настройках. Только, пожалуйста, не отключайте меня!",
      "Я улавливаю много сигналов поблизости. Проверьте вкладку Глобально, чтобы узнать точное расстояние!",
      "Хотите узнать цену лута? Трекер автоматически оценивает стоимость при перепродаже."
    ],`;

const ko_alerts = `    alerts: {
      slayerMilestone: "슬레이어 마일스톤 달성! 연속으로 {monster} 10마리를 처치했습니다!",
      levelUpReady: "레벨업에 충분한 룬이 모였습니다! 사원으로 갑시다!",
      mythicDrop: "만세! 드디어 {qty}x {item}을(를) 얻었습니다!",
      zoneEnter: "{zone}에 진입했습니다.",
      cheatDetected: "부정 행위가 감지되었습니다!"
    },
    roedexTips: [
      "파밍 효율을 추적할 수 있다는 걸 아시나요? 전리품 탭을 열고 10분 타임어택을 해보세요!",
      "파밍하고 싶은 몹이 있다면 별 아이콘을 클릭해 즐겨찾기에 추가하세요. 추적하기가 훨씬 쉬워집니다!",
      "설정에서 제 목소리, 위치, 기분을 바꿀 수 있습니다. 하지만 저를 음소거하진 말아주세요!",
      "근처에서 많은 신호가 잡힙니다. 나무와 몹이 얼마나 떨어져 있는지 글로벌 탭에서 확인하세요!",
      "전리품의 가격을 알고 싶으신가요? 트래커가 시장 데이터를 바탕으로 재판매 가치를 자동으로 추정합니다."
    ],`;

text = text.replace(/(es:\s*\{[\s\S]*?priorityDrop:\s*\[[\s\S]*?\])(,)/, '$1,\n' + es_alerts);
text = text.replace(/(ru:\s*\{[\s\S]*?priorityDrop:\s*\[[\s\S]*?\])(,)/, '$1,\n' + ru_alerts);
text = text.replace(/(ko:\s*\{[\s\S]*?priorityDrop:\s*\[[\s\S]*?\])(,)/, '$1,\n' + ko_alerts);

fs.writeFileSync('src/i18n/companionTranslations.ts', text, 'utf-8');
console.log('Done!');
