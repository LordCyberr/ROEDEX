const fs = require('fs');

const advancedKeys = {
  en: {
    advanced: {
      developerMode: "Developer Mode",
      developerWarning: "Warning: This mode is for development and diagnostics ONLY! It enables debug overlays and logs that may impact performance. Do not enable this unless you know what you are doing!",
      developerDesc: "Enable advanced performance tracking and socket debugging logs. Use <strong>Alt+Shift+X</strong> to toggle the live diagnostic panel.",
      dataManagement: "Data Management",
      dataManagementDesc: "Backup your custom overlays, lifetime statistics, and preferences to a local JSON file. You can restore this backup on a different device or browser.",
      exportBackup: "Export Backup",
      importBackup: "Import Backup",
      exportSuccess: "Profile backed up to file.",
      importSuccess: "Profile restored! Reload recommended.",
      importFailed: "Invalid backup file.",
      dangerZone: "Danger Zone",
      dangerDesc: "Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience.",
      hardReset: "HARD RESET DATABASE",
      hardResetConfirm: "Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone."
    }
  },
  es: {
    advanced: {
      developerMode: "Modo Desarrollador",
      developerWarning: "Advertencia: ¡Este modo es SOLO para desarrollo y diagnóstico! Habilita superposiciones de depuración y registros que pueden afectar el rendimiento. ¡No habilites esto a menos que sepas lo que haces!",
      developerDesc: "Habilita el seguimiento avanzado de rendimiento y registros de sockets. Usa <strong>Alt+Shift+X</strong> para alternar el panel de diagnóstico en vivo.",
      dataManagement: "Gestión de Datos",
      dataManagementDesc: "Realiza una copia de seguridad de tus preferencias a un archivo JSON local. Puedes restaurar esta copia en otro dispositivo.",
      exportBackup: "Exportar Copia",
      importBackup: "Importar Copia",
      exportSuccess: "Perfil exportado al archivo.",
      importSuccess: "¡Perfil restaurado! Se recomienda recargar.",
      importFailed: "Archivo de copia de seguridad no válido.",
      dangerZone: "Zona de Peligro",
      dangerDesc: "Borrar la base de datos eliminará completamente todos los diseños personalizados, preferencias y datos de sesión. Simulará una instalación limpia.",
      hardReset: "RESTABLECIMIENTO COMPLETO",
      hardResetConfirm: "¿Estás seguro de que deseas borrar permanentemente todos los archivos de ROEDEX? Esto no se puede deshacer."
    }
  },
  ru: {
    advanced: {
      developerMode: "Режим разработчика",
      developerWarning: "Внимание: этот режим ТОЛЬКО для разработки! Он включает оверлеи отладки и логи, что может снизить производительность. Не включайте, если не уверены!",
      developerDesc: "Включить продвинутое отслеживание производительности и логи сокетов. Используйте <strong>Alt+Shift+X</strong> для панели диагностики.",
      dataManagement: "Управление данными",
      dataManagementDesc: "Сделайте резервную копию ваших настроек в локальный JSON файл. Вы можете восстановить эту копию на другом устройстве.",
      exportBackup: "Экспорт копии",
      importBackup: "Импорт копии",
      exportSuccess: "Профиль сохранен в файл.",
      importSuccess: "Профиль восстановлен! Рекомендуется перезагрузка.",
      importFailed: "Неверный файл резервной копии.",
      dangerZone: "Опасная зона",
      dangerDesc: "Очистка базы данных полностью удалит все пользовательские макеты, предпочтения и данные сеанса. Это имитирует чистую установку.",
      hardReset: "ЖЕСТКИЙ СБРОС БАЗЫ ДАННЫХ",
      hardResetConfirm: "Вы уверены, что хотите навсегда удалить все файлы базы данных ROEDEX? Это действие нельзя отменить."
    }
  },
  ko: {
    advanced: {
      developerMode: "개발자 모드",
      developerWarning: "경고: 이 모드는 개발 및 진단 전용입니다! 성능에 영향을 줄 수 있는 디버그 오버레이와 로그를 활성화합니다. 확실하지 않으면 활성화하지 마세요!",
      developerDesc: "고급 성능 추적 및 소켓 디버깅 로그를 활성화합니다. <strong>Alt+Shift+X</strong>를 사용하여 진단 패널을 전환하세요.",
      dataManagement: "데이터 관리",
      dataManagementDesc: "사용자 지정 오버레이, 통계 및 기본 설정을 로컬 JSON 파일로 백업합니다. 다른 장치에서 이 백업을 복원할 수 있습니다.",
      exportBackup: "백업 내보내기",
      importBackup: "백업 가져오기",
      exportSuccess: "프로필이 파일로 백업되었습니다.",
      importSuccess: "프로필이 복원되었습니다! 새로 고침 권장.",
      importFailed: "잘못된 백업 파일입니다.",
      dangerZone: "위험 구역",
      dangerDesc: "데이터베이스를 삭제하면 모든 설정 및 세션 데이터가 완전히 지워집니다. 새로 설치된 상태를 시뮬레이션합니다.",
      hardReset: "데이터베이스 초기화",
      hardResetConfirm: "ROEDEX 데이터베이스 파일을 영구적으로 삭제하시겠습니까? 이 작업은 실행 취소할 수 없습니다."
    }
  }
};

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

for (const lang of Object.keys(advancedKeys)) {
  const data = advancedKeys[lang];
  // Inject into the root of each language
  const regex = new RegExp(`(${lang}: \\{[\\s\\S]*?)(settingsUI: \\{)`);
  content = content.replace(regex, (match, p1, p2) => {
    let toInject = `advanced: ${JSON.stringify(data.advanced, null, 6)},\n    `;
    toInject = toInject.replace(/\"([a-zA-Z0-9_]+)\":/g, "$1:");
    toInject = toInject.replace(/\n}/g, "\n    }");
    return p1 + toInject + p2;
  });
}

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
console.log('Successfully injected advanced settings keys.');
