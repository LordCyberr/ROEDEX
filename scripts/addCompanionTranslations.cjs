const fs = require('fs');

let content = fs.readFileSync('src/i18n/companionTranslations.ts', 'utf-8');

const injection = `
    bob: {
      lowDurability: [
        "Ah! My explorer gear is falling apart! We need to fix this!",
        "Wait! The durability is critical! We can't fight like this!",
        "My sword is chipping! It's going to break!",
        "We're doomed if that breaks right now! Retreat!"
      ],
      zoneLore: {
        forest: [
          "I heard the forest was planted by the first explorers!",
          "There are so many hidden paths here... I love it!",
          "Watch out for the overgrown roots!"
        ],
        cave: [
          "It's spooky in here, but the loot is worth it!",
          "I brought an extra torch just in case!",
          "Do you think there's a hidden treasure room down here?"
        ],
        town: [
          "It's so lively today! Let's check the quest board!",
          "I always get my gear fixed at that blacksmith.",
          "Can we buy a snack? Exploring makes me hungry!"
        ],
        guild: [
          "Whoa! The Guild Hall! Only elite explorers get to come here!",
          "The bounties here pay out huge rewards!",
          "I want to join a top guild someday!"
        ]
      }
    },
    kaya: {
      lowDurability: [
        "WHAT?! My weapon is breaking! Unacceptable!",
        "Are you kidding me?! Fix this junk before it shatters!",
        "I can't smash things if my gear is broken! Fix it now!",
        "Grrr... if this breaks, I'm using my fists!"
      ],
      zoneLore: {
        forest: [
          "Too many trees in the way. Let's burn some down.",
          "I'm tired of swatting bugs. Where are the real monsters?",
          "Forests are boring. I want a real challenge!"
        ],
        cave: [
          "Now we're talking! The dark is where the tough guys hide!",
          "I smell a boss fight nearby... let's go crush it!",
          "Echoes... I love hearing the screams of my enemies bounce off these walls."
        ],
        town: [
          "Too crowded. People keep bumping into me.",
          "If one more person asks me for a side quest, I'm punching them.",
          "Let's repair and get back out there. I hate standing around."
        ],
        guild: [
          "Finally, a place for strong fighters!",
          "Let's check the leaderboards. I bet I'm number one.",
          "These guys look tough... I want to fight them all!"
        ]
      }
    },
    lia: {
      lowDurability: [
        "The mana binding on our equipment is failing!",
        "Warning: Structural integrity critically low! Retreat!",
        "The enchantment is shattering! We must repair immediately!",
        "I cannot sustain the spell! The weapon is breaking!"
      ],
      zoneLore: {
        forest: [
          "The mana density in these woods is fascinating.",
          "I can feel the ancient magic pulsating through the roots.",
          "Tread carefully. The spirits here are restless."
        ],
        cave: [
          "The crystals here resonate with an unusual frequency.",
          "There is dark magic lingering in these depths.",
          "I sense a powerful artifact nearby... or a powerful trap."
        ],
        town: [
          "The magical leylines converge at this settlement.",
          "A place of gathering. The collective energy is quite high.",
          "I should visit the arcane merchant while we are here."
        ],
        guild: [
          "The Guild Hall. A nexus of powerful individuals.",
          "The enchantments protecting this place are incredibly complex.",
          "A fine place to exchange knowledge and rare components."
        ]
      }
    },
    crash: {
      lowDurability: [
        "PUNY WEAPON BREAKING! CRASH ANGRY!",
        "SMASH STICK BROKEN! FIX NOW!",
        "NO SMASH WITHOUT STICK! FIX IT!",
        "CRASH HATE BROKEN TOYS! GO TO BLACKSMITH!"
      ],
      zoneLore: {
        forest: [
          "CRASH SMASH TREES! HAHAHA!",
          "TOO MUCH GREEN! CRASH WANT RED!",
          "LITTLE BUGS BITE CRASH! CRASH SQUASH BUGS!"
        ],
        cave: [
          "DARK CAVE! GOOD FOR SNEAKY SMASH!",
          "CRASH HEAR BIG MONSTER! CRASH WANT FIGHT BIG MONSTER!",
          "ROCKS HARD! CRASH HEAD HARDER!"
        ],
        town: [
          "TOWN BORING! NO SMASHING ALLOWED!",
          "PUNY HUMANS EVERYWHERE!",
          "CRASH WANT MEAT! WHERE IS MEAT VENDOR?!"
        ],
        guild: [
          "BIG HOUSE FOR STRONG PEOPLE! CRASH STRONGEST!",
          "CRASH WANT TO FIGHT GUILD MASTER!",
          "SHINY BANNERS! CRASH WANT TO TEAR THEM DOWN!"
        ]
      }
    },
`;

content = content.replace('es: {', injection + '  es: {');
fs.writeFileSync('src/i18n/companionTranslations.ts', content, 'utf-8');
console.log('updated');
