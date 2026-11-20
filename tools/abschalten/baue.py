# Baut public/abschalten/index.html aus den Dateien in diesem Ordner (Version 266, ergänzt 268).
# Aufruf aus dem Hauptordner: python3 tools/abschalten/baue.py
import os
d = os.path.dirname(os.path.abspath(__file__))
spiele = ['lauf', 'chaos', 'tour', 'schutz', 'schleuder', 'stapler']
teile = [open(f'{d}/teigi.js').read(), open(f'{d}/core.js').read()]
teile += [open(f'{d}/spiele/{s}.js').read() for s in spiele]
teile.append(open(f'{d}/einbettung.js').read())
html = open(f'{d}/rahmen.html').read().replace('<!--SKRIPTE-->', '<script>\n' + '\n'.join(teile) + '\n</script>')
ziel = os.path.join(d, '..', '..', 'public', 'abschalten', 'index.html')
os.makedirs(os.path.dirname(ziel), exist_ok=True)
open(ziel, 'w').write(html)
print('gebaut:', os.path.relpath(ziel), len(html), 'Zeichen')
