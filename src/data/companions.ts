export type CompanionId = 'bob' | 'kaya' | 'lia' | 'crash';

export interface CompanionProfile {
  id: CompanionId;
  name: string;
  color: string;
  description: string;
  idleImage: string;
  talkingImage: string;
  realisticImage: string;
  matrixImage: string;
  expressions: string[];
  quotes: {
    idle: string[];
    combat: string[];
    chest: string[];
    rareLoot: string[];
    levelUp: string[];
    tutorial: string[];
  };
  theme: string;
}

export const COMPANIONS: Record<CompanionId, CompanionProfile> = {
  bob: {
    id: 'bob',
    name: 'Bob',
    color: '#ff6b00', // Ruyui Orange
    description: 'The Optimistic Explorer. Loves finding new loot and going on adventures.',
    idleImage: '/assets/companions/bob_idle.png',
    talkingImage: '/assets/companions/bob_talking.png',
    realisticImage: '/assets/companions/bob_realistic.png',
    matrixImage: '/assets/companions/bob_matrix.png',
    expressions: [
      '/assets/companions/bob_talking.png'
    ],
    quotes: {
      idle: [
        "So... what's our next move?",
        "Embervault sure is big today.",
        "I hope we find something shiny soon!",
        "Do you think there are secret areas around here?"
      ],
      combat: [
        "Take that!",
        "Watch out for their attacks!",
        "We've got this!",
        "Phew, that was a close one."
      ],
      chest: [
        "A chest! Let's see what's inside!",
        "Ooh, maybe it's something rare?",
        "I love the sound of a chest opening.",
        "Fingers crossed for good loot!"
      ],
      rareLoot: [
        "Whoa! That looks incredibly rare!",
        "I can't believe we found this!",
        "This is exactly what we needed!",
        "We're going to be legends with gear like this!"
      ],
      levelUp: [
        "I feel stronger already!",
        "Level up! Let's go!",
        "We're making great progress."
      ],
      tutorial: [
        "Welcome to Town! Before we leave, make sure your health is topped off. Head inside your house and click the bed if you need healing!",
        "Time to calibrate the ROEDEX with some real data. Run out to the Cave or Forest and defeat 3 monsters!",
        "Great job! The ROEDEX has intercepted their respawn timers. Now return to Town so we can safely review the data.",
        "Behold, the ROEDEX! I'm Bob, your Optimistic Explorer. This tab tracks every monster, tree, and plant. Green is alive, Red is dead, and orange tells you when to go back and farm!",
        "To see the respawn queue in action, walk around Town and pick up the same flower twice!",
        "Hover your mouse over any active timer to see the exact queue of upcoming respawns! (Click Next to continue)",
        "Click the Session Tab up top. This is where we calculate how rich you're getting per hour. Start a run, and I'll track your XP and Runestone efficiency!",
        "Got a messy screen? Click this icon to pop tabs out into their own mini-overlays anywhere on your screen!",
        "Want to close all those popped-out windows at once? Hit this merge button to bring them all back into the main view!",
        "Need to hide the app quickly? Click the minimize button to shrink the window into a tiny floating orb! (You can double-click the orb to bring it back)",
        "Double-tap the orb to reopen the UI, then click the Lock button! When locked, the UI becomes click-through so you can play the game.",
        "Great! Now click the lock button again to UNLOCK the UI. If you don't unlock it, you can't click any tabs!",
        "You can tweak my settings or shut me up in the Settings tab. Click it to finish the tutorial!"
      ]
    },
    theme: 'ruyui'
  },
  kaya: {
    id: 'kaya',
    name: 'Kaya',
    color: '#ef4444', // Demon Girl Crimson
    description: 'The Fiery Oni. Always looking for a fight and massive loot drops!',
    idleImage: '/assets/companions/kaya_idle.png',
    talkingImage: '/assets/companions/kaya_talking.png',
    realisticImage: '/assets/companions/kaya_realistic.png',
    matrixImage: '/assets/companions/kaya_matrix.png',
    expressions: [
      '/assets/companions/kaya_talking.png'
    ],
    quotes: {
      idle: [
        "This waiting around is boring. Let's find something to hit.",
        "Keep your weapon ready. You never know.",
        "Are we exploring or just standing here?",
        "I bet I can defeat more enemies than you today."
      ],
      combat: [
        "Is that all you've got?!",
        "Out of my way!",
        "Hah! Too slow!",
        "Don't hold back, hit them harder!"
      ],
      chest: [
        "Finally, a chest. Give me something good, not junk.",
        "If it's another piece of scrap wood, I'm smashing it.",
        "Let's crack this thing open.",
        "Hurry up and see what's inside."
      ],
      rareLoot: [
        "Now THIS is what I call a weapon!",
        "Hah! The others will be so jealous of this.",
        "Perfect. I can deal so much damage with this.",
        "Finally, something actually worth our time."
      ],
      levelUp: [
        "Ha! My power is growing!",
        "I'm practically unstoppable now.",
        "Next level! Keep it coming!"
      ],
      tutorial: [
        "We're stuck in Town. If you took a beating, go sleep in that bed over there. Once you're healed, we hunt.",
        "The system needs targets. Head into the Cave or Forest and smash 3 monsters. Don't come back until they're dead!",
        "Good kills. Now head back to Town so we don't get ambushed while I explain the UI.",
        "Listen up, rookie. I'm Kaya. This tab tracks all the monsters we're going to crush. Green means alive, Red means dead. When it's orange, get ready to strike!",
        "Now, pick up the same flower in Town twice so we can track its respawn!",
        "Hover over a timer. It shows you exactly who is spawning next so we can set up an ambush. (Click Next)",
        "Hit the Session Tab. I want to see how much damage we're doing and how fast we're getting rich. Start it up!",
        "Screen too cluttered? Pop these tabs out into their own windows so you can see the battlefield clearly.",
        "Merge them all back together with this button when you're done playing around.",
        "Need me out of the way? Click minimize. I'll shrink down, but I'm always watching. Double-click to bring me back.",
        "Double-tap me to open the UI, then hit Lock. When locked, your attacks go right through the UI so we don't miss a swing.",
        "Hah! Now UNLOCK it. If you leave it locked, you'll just be clicking through it like a ghost.",
        "Go to the Settings tab if you want to tweak things. That's it, tutorial over. Let's go fight something!"
      ]
    },
    theme: 'ruyui-demon'
  },
  lia: {
    id: 'lia',
    name: 'Lia',
    color: '#06b6d4', // Witch Girl Cyan
    description: 'The Elf Mage. A mystical companion focused on magic and rare secrets.',
    idleImage: '/assets/companions/lia_exp_1.png',
    talkingImage: '/assets/companions/lia_exp_2.png',
    realisticImage: '/assets/companions/lia_realistic.png',
    matrixImage: '/assets/companions/lia_matrix.png',
    expressions: [
      '/assets/companions/lia_talking.png'
    ],
    quotes: {
      idle: [
        "The magical resonance here is quite peculiar...",
        "Have you read the ancient texts about this area?",
        "Patience is key to uncovering Embervault's secrets.",
        "I sense a disturbance in the mana flow nearby."
      ],
      combat: [
        "Focus your energy.",
        "A tactical approach is best.",
        "Their defense is weakening!",
        "Conserve your strength."
      ],
      chest: [
        "A chest. Let us examine its contents carefully.",
        "The lock mechanism is quite intricate.",
        "I wonder what history this chest holds.",
        "Proceed with caution; some chests are trapped."
      ],
      rareLoot: [
        "Fascinating... the enchantment on this is ancient.",
        "A relic of great power. We must use it wisely.",
        "I have read about this item in the archives!",
        "Such pure magical energy radiating from this."
      ],
      levelUp: [
        "My understanding deepens.",
        "A refinement of my magical abilities.",
        "Knowledge and power, hand in hand."
      ],
      tutorial: [
        "We arrive in Town. Should your vitality be low, I suggest resting in the bed within the house. Once restored, we shall proceed.",
        "The grimoire requires live data to attune. Travel to the Cave or Forest and vanquish 3 monsters.",
        "Excellent. Their life forces have been recorded. Please return to Town so we may safely review the codex.",
        "Greetings, traveler. I am Lia. This codex monitors the vital energies of flora and fauna. Green signifies life, Red signifies depletion, and Orange is a premonition of rebirth.",
        "To observe the flow of rebirth, please gather the identical flora twice within this Town.",
        "Gaze upon an active timer to foresee the exact sequence of upcoming respawns. (Click Next to proceed)",
        "Observe the Session Tab. Here we channel our focus to measure your hourly progression in experience and wealth.",
        "If the interface disrupts your focus, use this rune to extract tabs into ethereal floating windows.",
        "Activate this seal to recall all floating windows back into the central grimoire.",
        "Should you need an unobstructed view, minimize the window into a dormant orb. A simple double-tap will awaken me.",
        "Awaken me, then cast the Lock spell. Once bound, the interface becomes intangible, allowing your physical actions to pass through.",
        "Excellent. Now break the seal to UNLOCK it. A locked grimoire cannot be read or interacted with.",
        "You may attune my settings to your liking in the final tab. Our preparations are complete. Let us seek knowledge."
      ]
    },
    theme: 'ruyui-witch'
  },
  crash: {
    id: 'crash',
    name: 'Crash',
    color: '#84cc16', // Orc Warrior Green
    description: 'The Orc Warrior. Brutal and loud, he loves smashing rocks and enemies alike!',
    idleImage: '/assets/companions/crash_idle.png',
    talkingImage: '/assets/companions/crash_talking.png',
    realisticImage: '/assets/companions/crash_realistic.png',
    matrixImage: '/assets/companions/crash_matrix.png',
    expressions: [
      '/assets/companions/crash_talking.png'
    ],
    quotes: {
      idle: [
        "Crash hungry. When we eat?",
        "Crash protect you.",
        "This place big.",
        "Crash want to smash something."
      ],
      combat: [
        "CRASH SMASH!",
        "You hurt friend, Crash hurt YOU!",
        "RAAARGH!",
        "Puny enemies!"
      ],
      chest: [
        "Box! Crash open box now!",
        "Hope there is meat inside...",
        "Crash can break lock if you want.",
        "Ooh, shiny box."
      ],
      rareLoot: [
        "Big shiny! Crash like!",
        "This heavy. Good for smashing.",
        "Crash use this to protect friends!",
        "Very strong item!"
      ],
      levelUp: [
        "CRASH STRONGER NOW!",
        "Crash muscles get bigger!",
        "More power for Crash!"
      ],
      tutorial: [
        "CRASH IN TOWN! If you hurt, go sleep in bed! Sleep make strong!",
        "CRASH WANT TO FIGHT! Go to Cave or Forest and SMASH 3 monsters! SMASH NOW!",
        "PUNY MONSTERS DEAD! Walk back to Town now so Crash can show you the box without getting hit!",
        "CRASH HERE! This list show things Crash can smash! Green mean alive, Red mean smashed! Orange mean ALMOST ready to smash again!",
        "CRASH WANT FLOWERS! Pick up same flower two times so Crash can time it!",
        "Put finger on timer to see what we smash next! (Click Next)",
        "Click Session Tab! It count how much shiny rocks and strong points we get! Make numbers go UP!",
        "Too much reading? Click this to throw windows all over the screen!",
        "Click this to smash windows back together into one big box!",
        "Click minimize! Crash hide in tiny ball. Tap Crash two times to make big again!",
        "Make Crash big, then click LOCK! Lock make box ghosts so Crash can hit things behind it!",
        "Now UNLOCK! If lock stay on, Crash cannot touch the buttons!",
        "Go to Settings to change Crash. Crash done talking now. CRASH WANT TO FIGHT!"
      ]
    },
    theme: 'ruyui-orc'
  }
};
