const fs = require('fs');
const path = require('path');

// 1. Fix translations
const translationsPath = path.join(__dirname, '../src/i18n/translations.ts');
let translations = fs.readFileSync(translationsPath, 'utf8');

// Replace the translated names with the English names
translations = translations.replace(/"lordCyberr":\s*"[^"]+"/g, '"lordCyberr": "Lord Cyberr"');
translations = translations.replace(/"mrSnorch":\s*"[^"]+"/g, '"mrSnorch": "Mr. Snorch"');

fs.writeFileSync(translationsPath, translations, 'utf8');
console.log('Fixed translations.ts');

// 2. Fix CompanionGuideOverlay.tsx
const overlayPath = path.join(__dirname, '../src/components/overlay/CompanionGuideOverlay.tsx');
let overlay = fs.readFileSync(overlayPath, 'utf8');

// Replace the store from which we get companionPosition
overlay = overlay.replace(
  /const { companionPosition } = useTrackerStore\(useShallow\(\(state: any\) => \(\{\s*companionPosition: state\.companionPosition\s*\}\)\)\);/g,
  `const { companionPosition, notificationSettings } = useSettingsStore(useShallow((state: any) => ({
    companionPosition: state.companionPosition,
    notificationSettings: state.notificationSettings
  })));`
);

// We need to inject `getBubblePosition` into the render body
const bubblePosLogic = `
  let bobX = companionPosition?.x ?? 800;
  let bobY = companionPosition?.y ?? 220;

  const getBubblePosition = (bx: number, by: number): 'left' | 'right' | 'top' | 'bottom' => {
    if (typeof window === 'undefined') return 'right';
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (by > winH * 0.8) return 'top';
    if (by < winH * 0.15 && bx > winW * 0.33 && bx < winW * 0.66) return 'bottom';
    if (bx > winW / 2) return 'left';
    return 'right';
  };

  const bubblePosition = getBubblePosition(bobX, bobY);
`;

// Replace the overlap logic
const overlapRegex = /let bobX = companionPosition\?\.x \?\? 800;[\s\S]*?if \(isOverlapping\) \{[\s\S]*?\}[\s\S]*?\}/;
overlay = overlay.replace(overlapRegex, bubblePosLogic);

// Replace the inline style of the bubble to match CompanionOverlay.tsx
const styleRegex = /style=\{\{\s*left: bubbleOrigin === 'right' \? bobX - 370 : bobX \+ 80,\s*top: bobY,\s*\}\}/;
const newStyle = `style={{
            left: bobX + 32,
            top: bobY + 32,
            transform: bubblePosition === 'left' ? \`translate(calc(20px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\` 
                     : bubblePosition === 'right' ? \`translate(calc(-20px + \${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\`
                     : bubblePosition === 'top' ? \`translate(calc(-50%), calc(20px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px))\`
                     : \`translate(calc(-50%), calc(-20px + \${notificationSettings?.companionBubbleDistance ?? 16}px))\`
          }}`;
overlay = overlay.replace(styleRegex, newStyle);

// Also need to adjust the animation x origin
const initialAnimateRegex = /initial=\{\{ opacity: 0, scale: 0\.8, x: bubbleOrigin === 'right' \? 20 : -20 \}\}[\s\S]*?exit=\{\{ opacity: 0, scale: 0\.8, x: bubbleOrigin === 'right' \? 20 : -20 \}\}/;
const newAnimate = `initial={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}`;
overlay = overlay.replace(initialAnimateRegex, newAnimate);

// We need to also add clipPath logic to match the tail of the bubble!
// CompanionOverlay uses clipPath to cut out the side of the bubble where the tail is... Wait, no! The tail is rendered using a background gradient or something? No, it uses `clipPath` to inset the borders so the solid dark core looks like a tail?
// Wait, CompanionOverlay uses:
// clipPath: currentMessage ? 'inset(0% 0% 0% 0%)' : bubblePosition === 'left' ? 'inset(0% 56px 0% calc(100% - 56px))' ...
// Actually `inset(0% 0% 0% 0%)` means no clipping.

// Also, the position of the bubble must be anchored differently depending on `bubblePosition`.
// If `bubblePosition === 'right'`, left is auto?
// Wait, if I set left and top to `bobX + 32` and `bobY + 32` (the center of the orb), then the `transform` needs to move it to the correct side.
// But `left: bobX + 32` means the left edge of the bubble is at the center of the orb.
// If it's on the right side (`bubblePosition === 'right'`), this is fine! We just translate X by distance.
// If it's on the left side (`bubblePosition === 'left'`), `left: bobX + 32` means its left edge is at the center. To move it to the left side, we need to translate X by `-100%`!
// CompanionOverlay uses `left: auto, right: 100%` inside a container.

const transformFix = `style={{
            position: 'absolute',
            left: bubblePosition === 'right' ? bobX + 64 : bubblePosition === 'left' ? 'auto' : bobX + 32,
            right: bubblePosition === 'left' ? window.innerWidth - bobX : 'auto',
            top: bubblePosition === 'bottom' ? bobY + 64 : bubblePosition === 'top' ? 'auto' : bobY + 32,
            bottom: bubblePosition === 'top' ? window.innerHeight - bobY : 'auto',
            transform: bubblePosition === 'left' ? \`translate(calc(15px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\` 
                     : bubblePosition === 'right' ? \`translate(calc(-15px + \${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\`
                     : bubblePosition === 'top' ? \`translate(calc(-50%), calc(15px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px))\`
                     : \`translate(calc(-50%), calc(-15px + \${notificationSettings?.companionBubbleDistance ?? 16}px))\`
          }}`;

overlay = overlay.replace(/style=\{\{[\s\S]*?transform: bubblePosition[\s\S]*?\}\}/, transformFix);

fs.writeFileSync(overlayPath, overlay, 'utf8');
console.log('Fixed CompanionGuideOverlay.tsx');
