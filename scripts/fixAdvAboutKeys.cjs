const fs = require('fs');

const advancedKeys = {
  enableDevMode: { en: 'Enable Developer Mode', es: 'Habilitar Modo Desarrollador', ru: 'Включить режим разработчика', ko: '개발자 모드 활성화' },
  devModeEnabled: { en: 'Developer Mode Enabled', es: 'Modo Desarrollador Habilitado', ru: 'Режим разработчика включен', ko: '개발자 모드 활성화 됨' },
  devModeWarning: { en: 'Warning: This mode is for development and diagnostics ONLY!', es: 'Advertencia: ¡Este modo es SOLO para desarrollo!', ru: 'Внимание: Этот режим ТОЛЬКО для разработки!', ko: '경고: 이 모드는 개발 및 진단 전용입니다!' },
  devModeDesc: { en: 'Enable advanced performance tracking and socket debugging logs.', es: 'Habilita el seguimiento avanzado de rendimiento.', ru: 'Включить расширенное отслеживание производительности.', ko: '고급 성능 추적 및 소켓 디버깅 로그를 활성화합니다.' },
  dangerZone: { en: 'Danger Zone', es: 'Zona de Peligro', ru: 'Опасная зона', ko: '위험 구역' },
  dangerZoneDesc: { en: 'Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data.', es: 'Borrar la base de datos borrará por completo todos los diseños personalizados...', ru: 'Очистка базы данных полностью удалит все пользовательские макеты...', ko: '데이터베이스를 지우면 모든 사용자 지정 레이아웃, 환경 설정, 수명 통계 및 세션 데이터가 완전히 지워집니다.' },
  confirmHardReset: { en: 'Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone.', es: '¿Estás seguro de que quieres borrar permanentemente todos los archivos de la base de datos de ROEDEX?', ru: 'Вы уверены, что хотите навсегда удалить все файлы базы данных ROEDEX?', ko: 'ROEDEX 데이터베이스의 모든 파일을 영구적으로 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.' },
  hardResetBtn: { en: 'HARD RESET DATABASE', es: 'REINICIO COMPLETO DE BASE DE DATOS', ru: 'ПОЛНЫЙ СБРОС БАЗЫ ДАННЫХ', ko: '데이터베이스 하드 리셋' },
  
  aboutRoedexDesc: { en: 'ROEDEX is a high-performance tracking suite built exclusively for the community.', es: 'ROEDEX es un conjunto de seguimiento de alto rendimiento construido exclusivamente para la comunidad.', ru: 'ROEDEX — это высокопроизводительный набор инструментов для отслеживания...', ko: 'ROEDEX는 커뮤니티를 위해 독점적으로 구축된 고성능 추적 제품군입니다.' },
  viewChangelog: { en: 'View Project Changelogs', es: 'Ver Registros de Cambios', ru: 'Смотреть журнал изменений', ko: '프로젝트 변경 로그 보기' },
  readMore: { en: 'Read More ➔', es: 'Leer Más ➔', ru: 'Читать далее ➔', ko: '더 읽기 ➔' },
  supportDevelopment: { en: 'Support Development', es: 'Apoyar el Desarrollo', ru: 'Поддержать разработку', ko: '개발 지원' },
  donationDesc: { en: 'ROEDEX is an open-source project maintained by the community.', es: 'ROEDEX es un proyecto de código abierto...', ru: 'ROEDEX — это проект с открытым исходным кодом...', ko: 'ROEDEX는 커뮤니티에서 유지 관리하는 오픈 소스 프로젝트입니다.' },
  verifyNetwork: { en: '(Note: Please verify the network before sending any crypto)', es: '(Nota: Por favor, verifica la red antes de enviar crypto)', ru: '(Примечание: пожалуйста, проверьте сеть перед отправкой)', ko: '(참고: 암호화폐를 보내기 전에 네트워크를 확인하십시오)' },
  credits: { en: 'Credits & Acknowledgements', es: 'Créditos y Agradecimientos', ru: 'Благодарности', ko: '크레딧 및 감사' },
  leadDeveloper: { en: 'Lead Developer & Creator', es: 'Desarrollador Principal y Creador', ru: 'Ведущий разработчик и создатель', ko: '수석 개발자 및 제작자' },
  guidanceContributions: { en: 'Guidance & Contributions', es: 'Orientación y Contribuciones', ru: 'Руководство и Вклад', ko: '지도 및 기여' },
};

let fileContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of ['en', 'es', 'ru', 'ko']) {
  const langRegex = new RegExp(`^\\s*${lang}:\\s*\\{[\\s\\S]*?^\\s*settings:\\s*\\{`, 'm');
  const match = fileContent.match(langRegex);
  
  if (match) {
    const insertPos = match.index + match[0].length;
    let injection = '\n';
    for (const [key, transObj] of Object.entries(advancedKeys)) {
      if (!fileContent.slice(insertPos, insertPos + 2000).includes(`${key}:`)) {
        injection += `      ${key}: '${transObj[lang].replace(/'/g, "\\'")}',\n`;
      }
    }
    fileContent = fileContent.slice(0, insertPos) + injection + fileContent.slice(insertPos);
  }
}

fs.writeFileSync('src/i18n/translations.ts', fileContent);
console.log('Injected advanced and about keys into translations.ts');
