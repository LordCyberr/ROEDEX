import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

quotes_en = {
    'bob': 'Did you hear about the mathematician who\\'s afraid of negative numbers? He\\'ll stop at nothing to avoid them.',
    'kaya': 'This waiting around is boring. Let\\'s find something to hit.',
    'lia': 'The wind tells me there are secrets hidden nearby.',
    'crash': 'CRASH SMASH ROCK! BIG ROCK GOOD!'
}
quotes_es = {
    'bob': '¿Escuchaste sobre el matemático que le teme a los números negativos? No se detendrá ante nada para evitarlos.',
    'kaya': 'Esperar es aburrido. Encontremos algo a qué golpear.',
    'lia': 'El viento me dice que hay secretos ocultos cerca.',
    'crash': '¡CRASH APLASTAR ROCA! ¡ROCA GRANDE BUENA!'
}
quotes_ru = {
    'bob': 'Слышал о математике, который боится отрицательных чисел? Он ни перед чем не остановится, чтобы их избежать.',
    'kaya': 'Ждать скучно. Давай найдем кого-нибудь для битья.',
    'lia': 'Ветер говорит мне, что рядом скрыты секреты.',
    'crash': 'КРЭШ ЛОМАТЬ КАМЕНЬ! БОЛЬШОЙ КАМЕНЬ ХОРОШИЙ!'
}
quotes_ko = {
    'bob': '음수를 두려워하는 수학자 이야기 들어봤어? 그는 그것들을 피하기 위해 멈추지 않을 거야.',
    'kaya': '기다리는 건 지루해. 칠 만한 걸 찾아보자.',
    'lia': '바람이 근처에 숨겨진 비밀이 있다고 말해줘.',
    'crash': '크래쉬 바위 부순다! 큰 바위 좋다!'
}

def inject_quotes(content, quotes_dict):
    for comp, q in quotes_dict.items():
        # Match the specific language block by matching the localized strings which are unique
        # Actually since the loop applies 4 quotes 4 times, re.sub with count=1 will hit them in order
        content = re.sub(rf'({comp}: \{{ name: \'.*?\', description: \'.*?\'(?:, quote: \'.*?\')?)(\s*\}})', lambda m: m.group(1).split(', quote:')[0] + f', quote: \\'{q}\'' + m.group(2), content, count=1)
    return content

content = inject_quotes(content, quotes_en)
content = inject_quotes(content, quotes_es)
content = inject_quotes(content, quotes_ru)
content = inject_quotes(content, quotes_ko)

with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Quotes added.")
