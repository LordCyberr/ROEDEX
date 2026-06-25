import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the end of renderContent()
content = content.replace('''        </motion.div>
      </AnimatePresence>
      </motion.div>
    );
  };''', '''        </motion.div>
      </AnimatePresence>
      </div>
      </motion.div>
    );
  };''')

# Fix the very end of the file where I accidentally added a </div>
content = content.replace('''  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
      </div>
  );
};''', '''  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
};''')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
