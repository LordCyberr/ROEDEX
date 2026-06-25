import re

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    c = f.read()

c = re.sub(r">\s*Previous\s*</button>", ">{t('tutorial.previous' as any)}</button>", c)
c = re.sub(r">\s*Skip\s*</button>", ">{t('tutorial.skip' as any)}</button>", c)
c = re.sub(r">\s*Next\s*</button>", ">{t('tutorial.next' as any)}</button>", c)
c = re.sub(r">\s*Skip Tutorial\s*</button>", ">{t('tutorial.skipTutorial' as any)}</button>", c)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
