import sys
import re

# 1. Update npcs.ts
with open('src/data/npcs.ts', 'r', encoding='utf-8') as f:
    npc_data = f.read()

replacements = {
    "'Outside cave/mine'": "'Outside the cave/mine'",
    "'Marketplace center'": "'Center of Marketplace'",
    "'Outside of Marketplace'": "'Outside the Marketplace'",
    "'Front of entrance playing guitar'": "'At the entrance, playing guitar'",
    "'Bottom right watching arm wrestling'": "'Bottom right, watching arm wrestling'",
    "'Bottom right doing arm wrestling'": "'Bottom right, arm wrestling'",
    "'At the bar drinking'": "'Drinking at the bar'",
    "'Top left side sleeping on the table'": "'Top left, sleeping on a table'",
    "'Top left side on the table'": "'Top left, sitting at a table'",
    "'On the bench'": "'Sitting on the bench'",
    "'Inside Alchemist'": "'Inside Alchemist shop'",
    "'Outside Alchemist house'": "'Outside Alchemist shop'",
    "'Outside Blacksmith house'": "'Outside Blacksmith shop'",
    "'East town'": "'East Town area'",
}

for old, new in replacements.items():
    npc_data = npc_data.replace(old, new)

with open('src/data/npcs.ts', 'w', encoding='utf-8') as f:
    f.write(npc_data)


# 2. Update NPCView.tsx
with open('src/components/views/NPCView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the broken stopImmediatePropagation React handlers
content = content.replace('onKeyDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}', '')
content = content.replace('onKeyUp={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}', '')
content = content.replace('onKeyPress={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}', '')

# Change handleSearchChange to not have e.stopPropagation
content = content.replace("""  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };""", """  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };""")

# Add useRef and useEffect for isolation
if 'const inputRef = React.useRef' not in content:
    import_idx = content.find('const { pinnedEntities')
    isolation_code = """
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const stopKeys = (e: KeyboardEvent) => e.stopPropagation();
    // Use capture phase to stop propagation before the game sees it, but allow default typing
    el.addEventListener('keydown', stopKeys, true);
    el.addEventListener('keyup', stopKeys, true);
    el.addEventListener('keypress', stopKeys, true);
    return () => {
      el.removeEventListener('keydown', stopKeys, true);
      el.removeEventListener('keyup', stopKeys, true);
      el.removeEventListener('keypress', stopKeys, true);
    };
  }, []);
"""
    content = content[:import_idx] + isolation_code + content[import_idx:]

# Attach ref to input
content = content.replace('onChange={handleSearchChange}', 'onChange={handleSearchChange}\n          ref={inputRef}')

# Fix Grid Columns to 65px
content = content.replace('grid-cols-[85px_1fr_30px]', 'grid-cols-[65px_1fr_30px]')

# Fix Sidebar Sidebar Width and Alignment
# Find w-[140px]
content = content.replace('w-[140px]', 'w-[160px]')

# Find the sidebar button classes
old_button_class = 'className={`flex items-center justify-between text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest px-2 py-1.5 border-b border-[var(--border-subtle)] mb-0.5'
new_button_class = 'className={`flex items-center justify-between text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest px-2 py-1.5 border-b border-[var(--border-subtle)] mb-0.5 text-left leading-tight whitespace-normal'
content = content.replace(old_button_class, new_button_class)

with open('src/components/views/NPCView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
