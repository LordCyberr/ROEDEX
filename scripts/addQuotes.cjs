const fs = require('fs');

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const quotes_en = {
    'bob': "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
    'kaya': "This waiting around is boring. Let's find something to hit.",
    'lia': "The wind tells me there are secrets hidden nearby.",
    'crash': "CRASH SMASH ROCK! BIG ROCK GOOD!"
};
const quotes_es = {
    'bob': "¿Escuchaste sobre el matemático que le teme a los números negativos? No se detendrá ante nada para evitarlos.",
    'kaya': "Esperar es aburrido. Encontremos algo a qué golpear.",
    'lia': "El viento me dice que hay secretos ocultos cerca.",
    'crash': "¡CRASH APLASTAR ROCA! ¡ROCA GRANDE BUENA!"
};
const quotes_ru = {
    'bob': "Слышал о математике, который боится отрицательных чисел? Он ни перед чем не остановится, чтобы их избежать.",
    'kaya': "Ждать скучно. Давай найдем кого-нибудь для битья.",
    'lia': "Ветер говорит мне, что рядом скрыты секреты.",
    'crash': "КРЭШ ЛОМАТЬ КАМЕНЬ! БОЛЬШОЙ КАМЕНЬ ХОРОШИЙ!"
};
const quotes_ko = {
    'bob': "음수를 두려워하는 수학자 이야기 들어봤어? 그는 그것들을 피하기 위해 멈추지 않을 거야.",
    'kaya': "기다리는 건 지루해. 칠 만한 걸 찾아보자.",
    'lia': "바람이 근처에 숨겨진 비밀이 있다고 말해줘.",
    'crash': "크래쉬 바위 부순다! 큰 바위 좋다!"
};

function injectQuotes(dict) {
    for (const [comp, q] of Object.entries(dict)) {
        const escapedQ = q.replace(/'/g, "\\'"); // escape single quotes for the TS file
        const regex = new RegExp(`(${comp}: \\{ name: '[^']+', description: '[^']+')(\\s*\\})`);
        content = content.replace(regex, `$1, quote: '${escapedQ}'$2`);
    }
}

injectQuotes(quotes_en);
injectQuotes(quotes_es);
injectQuotes(quotes_ru);
injectQuotes(quotes_ko);

fs.writeFileSync('src/i18n/translations.ts', content, 'utf8');
console.log('Quotes added successfully.');
