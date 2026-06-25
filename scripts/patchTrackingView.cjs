const fs = require('fs');

let tv = fs.readFileSync('src/components/views/TrackingView.tsx', 'utf8');

// Import useTranslation
if (!tv.includes('useTranslation')) {
  tv = tv.replace("import { useSettingsStore } from '../../store/settingsStore';", "import { useSettingsStore } from '../../store/settingsStore';\nimport { useTranslation } from '../../hooks/useTranslation';");
}

// Add hook
if (!tv.includes('const { t } = useTranslation()')) {
  tv = tv.replace('const { currentZone } = useTrackerStore(useShallow((state) => ({', 'const { t } = useTranslation();\n  const { currentZone } = useTrackerStore(useShallow((state) => ({');
}

// Patch getCategoryName
// const category = getCategoryName(typeRaw, isResource);
// to
// const categoryKey = getCategoryName(typeRaw, isResource).toLowerCase();
// const category = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);
tv = tv.replace(
  'const category = getCategoryName(typeRaw, isResource);',
  'const categoryKey = getCategoryName(typeRaw, isResource).toLowerCase();\n      const category = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);'
);

fs.writeFileSync('src/components/views/TrackingView.tsx', tv, 'utf8');
console.log('Patched TrackingView.tsx');
