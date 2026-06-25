const fs = require('fs');

const applyReplacements = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
};

applyReplacements('src/components/views/settings/AdvancedSettings.tsx', [
  ['title: \'Developer Mode Enabled\'', 'title: t(\'settings.devModeEnabled\') || \'Developer Mode Enabled\''],
  ['message: \'Warning: This mode is for development and diagnostics ONLY! It enables debug overlays and logs that may impact performance. Do not enable this unless you know what you are doing!\'', 'message: t(\'settings.devModeWarning\') || \'Warning: This mode is for development and diagnostics ONLY! It enables debug overlays and logs that may impact performance. Do not enable this unless you know what you are doing!\''],
  ['Enable advanced performance tracking and socket debugging logs. Use <strong>Alt+Shift+X</strong> to toggle the live diagnostic panel.', '{t(\'settings.devModeDesc\') || "Enable advanced performance tracking and socket debugging logs."} <strong>Alt+Shift+X</strong>'],
  ['Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience.', '{t(\'settings.dangerZoneDesc\') || "Wiping the database will completely erase all custom layouts, preferences, lifetimes stats, and session data. It will simulate a fresh installation of the extension, allowing you to replay the full onboarding experience."}'],
  ['"Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone."', 't(\'settings.confirmHardReset\') || "Are you sure you want to permanently erase all ROEDEX database files? This cannot be undone."'],
  ['HARD RESET DATABASE', '{t(\'settings.hardResetBtn\') || "HARD RESET DATABASE"}']
]);

applyReplacements('src/components/views/settings/AboutSettings.tsx', [
  ['ROEDEX is a high-performance tracking suite built exclusively for the community. Designed from the ground up to be seamless, beautiful, and completely free. Our mission is to provide you with the most advanced set of tools to optimize your runs, track rare drops, and conquer your adventures.', '{t(\'settings.aboutRoedexDesc\') || "ROEDEX is a high-performance tracking suite built exclusively for the community. Designed from the ground up to be seamless, beautiful, and completely free. Our mission is to provide you with the most advanced set of tools to optimize your runs, track rare drops, and conquer your adventures."}'],
  ['View Project Changelogs', '{t(\'settings.viewChangelog\') || "View Project Changelogs"}'],
  ['Read More ➔', '{t(\'settings.readMore\') || "Read More ➔"}'],
  ['Support Development', '{t(\'settings.supportDevelopment\') || "Support Development"}'],
  ['ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.', '{t(\'settings.donationDesc\') || "ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated."}'],
  ['(Note: Please verify the network before sending any crypto)', '{t(\'settings.verifyNetwork\') || "(Note: Please verify the network before sending any crypto)"}'],
  ['Credits & Acknowledgements', '{t(\'settings.credits\') || "Credits & Acknowledgements"}'],
]);

