// ═══ Look „Backstube bei Nacht“ (Version 179) ═══
// Dunkles Espresso, Pergament, goldbraune Kruste. Die Farb-Umrechnung steht in farben.ts,
// hier steht alles, was neu dazukommt: Schriften, Körnung, Glas-Karten, Lichtschein, Bühne, Glanzlicht.
const KORN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .86 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
/** Kopf „Goldene Ähren“ (im Menü wählbar, Version 187): nur ohne gekaufte Sorte und ohne gekaufte Markise wird der Kopf zur dunklen Bühne */
const B = 'html:not([class*="lt-pt_mk"]) .lt-kopf-aehren:not([class*="lt-th-"])';
/** Kopf „Markise mit Ähren“: gelbe Markise mit Wetter bleibt, die Ähren wachsen unten herein */
const M = 'html:not([class*="lt-pt_mk"]) .lt-kopf-mitaehren:not([class*="lt-th-"])';

export const ARTISAN_CSS = `
*{--tc:initial;--tb:initial}
.lt-hell{--auf-hell: }
.lt-tief{--auf-hell:initial}
:root{--gold:#EAB308;--kruste:#D9822B;--espresso:#14100C;--roest:#1E1812;--pergament:#FBF7F0;--salbei:#8FBF9A}
html.lt-nacht,html.lt-nacht body{background:#14100C}
.lt-root.lt-dark{background-image:${KORN},radial-gradient(110% 520px at 50% 0,rgba(217,130,43,.2),rgba(20,16,12,0) 70%);background-attachment:scroll;color:#FBF7F0;font-family:'Plus Jakarta Sans','Atkinson Hyperlegible',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.lt-dark h1,.lt-dark h2,.lt-dark h3,.lt-dark.lt-themed h2,.lt-dark .lt-themed h2,.lt-dark .lt-themed h3,.lt-dark .lt-themed h4{font-family:'Fraunces','Plus Jakarta Sans',Georgia,serif !important;font-optical-sizing:auto;letter-spacing:-.015em !important}
.lt-dark .lt-frage{font-family:'Plus Jakarta Sans',system-ui,sans-serif !important;font-weight:700;letter-spacing:-.01em !important}
.lt-dark .lt-h1{font-weight:700;background:linear-gradient(180deg,#FFF8E7 20%,#FDE68A 60%,#D9822B 115%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none !important;filter:drop-shadow(0 10px 26px rgba(234,179,8,.28))}
/* Fehler aus Version 179: Zeichen und Name in der goldenen Begrüßung wurden durchsichtig (leerer Kreis) */
.lt-dark .lt-h1 :where(.lt-frame-bronze,.lt-frame-silver,.lt-frame-gold,[class*="lt-emo"],[class*="lt-fx-"]){-webkit-text-fill-color:initial}
/* Papier (Version 189): Kassenbons, Lern-Bon, Bestenliste und Tageskarte bleiben auch nachts helles Papier mit dunkler Schrift */
.lt-nacht .lt-papier{--papier: ;--auf-hell: }
.lt-nacht .lt-papier *{--auf-hell: }
.lt-nacht .lt-papier,.lt-nacht .lt-papier .lt-rc-mono{color:#2A1A0E}
.lt-nacht .lt-menu.lt-papier{background:#FFFDF6 !important;box-shadow:0 0 0 1px rgba(253,230,138,.25),0 20px 40px -20px #000 !important}
.lt-nacht .lt-papier .lt-menu-row{color:#2A1A0E}
.lt-nacht .lt-papier .lt-menu-row+.lt-menu-row{border-top-color:rgba(75,42,20,.1)}
.lt-dark .lt-card.lt-tief.lt-papier{-webkit-backdrop-filter:none;backdrop-filter:none}
.lt-nacht .lt-heute-balken{background-color:#FDE68A !important;box-shadow:0 0 14px rgba(234,179,8,.5) !important}
.lt-dark ::selection{background:#EAB308;color:#14100C}

/* Glas-Karten mit feinem Goldrand und warmem Lichtschein */
.lt-dark .lt-card.lt-tief{background:linear-gradient(155deg,rgba(255,240,214,.085),rgba(255,240,214,.028) 60%) !important;border:1px solid rgba(253,230,138,.15) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 28px 50px -30px rgba(0,0,0,.95),0 0 0 rgba(234,179,8,0) !important;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .35s,border-color .35s}
@media (hover:hover){
  .lt-dark .lt-card.lt-tief{-webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2)}
  .lt-dark .lt-card.lt-tief:hover{border-color:rgba(253,230,138,.4) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 34px 60px -30px #000,0 0 46px -14px rgba(234,179,8,.5) !important}
}
.lt-dark .lt-dialog{box-shadow:0 0 0 1px rgba(253,230,138,.16),0 40px 90px -20px #000,0 0 80px -30px rgba(234,179,8,.35) !important}
.lt-dark .lt-overlay{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}

/* Knöpfe zum Anfassen */
.lt-dark button{transition:transform .14s cubic-bezier(.2,.8,.2,1),box-shadow .25s,filter .25s,border-color .25s}
.lt-dark button:not(:disabled):active{transform:scale(.95)}
.lt-dark:not([class*="lt-th-"]) button[style*="background-color: rgb(255, 199, 44)"]{background-image:linear-gradient(180deg,#FFDD6B 0,#F2BC1B 48%,#DFA008 100%);text-shadow:0 1px 0 rgba(255,255,255,.35)}
@media (hover:hover){
  .lt-dark button[style*="background-color: rgb(255, 199, 44)"]:not(:disabled):hover{filter:brightness(1.06) drop-shadow(0 10px 22px rgba(234,179,8,.4));transform:translateY(-2px)}
  .lt-dark button.lt-tief:not(:disabled):hover{filter:brightness(1.18)}
}
.lt-dark .lt-pill,.lt-dark .lt-kasse{background:rgba(20,16,12,.62) !important;color:#FDE68A !important;border:1px solid rgba(253,230,138,.35) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 10px 24px -12px #000,0 0 22px -8px rgba(234,179,8,.55) !important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.lt-dark input:not([type=checkbox]):not([type=radio]):not([type=range]),.lt-dark select,.lt-dark textarea{background-color:#241C14 !important;color:#FBF7F0 !important;border-color:rgba(253,230,138,.22) !important}
.lt-dark input::placeholder,.lt-dark textarea::placeholder{color:#A8957C}
.lt-dark input:focus,.lt-dark select:focus,.lt-dark textarea:focus{border-color:#EAB308 !important;box-shadow:0 0 0 3px rgba(234,179,8,.25) !important}

/* Fortschritt: flüssiger Goldfluss */
.lt-dark .lt-bar[style*="rgb(255, 199, 44)"],.lt-dark .lt-fill[style*="rgb(255, 199, 44)"],.lt-dark .lt-bar-grow[style*="rgb(255, 199, 44)"]{background-image:linear-gradient(90deg,#D9822B,#EAB308 30%,#FDE68A 50%,#EAB308 70%,#D9822B);background-size:220% 100%;animation:ltGoldfluss 2.6s linear infinite;box-shadow:0 0 14px rgba(234,179,8,.6)}
@keyframes ltGoldfluss{from{background-position:110% 0}to{background-position:-110% 0}}

/* Menü: dunkles Glas */
.lt-dark .lt-bottomnav{background:rgba(27,21,15,.78) !important;border:1px solid rgba(253,230,138,.18);-webkit-backdrop-filter:blur(22px) saturate(1.4);backdrop-filter:blur(22px) saturate(1.4);box-shadow:0 22px 44px -16px #000,0 0 40px -18px rgba(234,179,8,.5) !important}
/* Goldener Knopf unten: in beiden Designs (Wunsch des Nutzers, Version 189) */
.lt-root:not([class*="lt-th-"]) .lt-nav-ind{background-image:linear-gradient(180deg,#FFDD6B,#DFA008);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 0 22px -4px rgba(234,179,8,.8)}

/* Glanzlicht beim Kippen (PC) */
.lt-dark .lt-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:3;opacity:0;transition:opacity .3s;background:radial-gradient(520px circle at var(--gx,50%) var(--gy,0%),rgba(255,236,190,.2),rgba(255,236,190,.05) 35%,transparent 60%)}
.lt-dark .lt-tilting>.lt-glare{opacity:1}
.lt-dark .lt-tilting{transition:transform .08s linear !important;will-change:transform}

/* Kopf wird zur Bühne */
.lt-buehne{display:none}
${B} .lt-awning{background-color:#0F0B08 !important;background-image:radial-gradient(70% 150% at 50% 125%,rgba(234,179,8,.42),rgba(217,130,43,.14) 46%,rgba(15,11,8,0) 72%),linear-gradient(180deg,#0C0906,#1E1812) !important;box-shadow:0 1px 0 rgba(253,230,138,.28),0 34px 70px -34px rgba(234,179,8,.5);perspective:900px}
${B} .lt-awning-edge,${B} .lt-login-rand{display:none}
${B} .lt-awning{position:relative;overflow:hidden}
${B} .lt-awning>.lt-logo{position:relative;z-index:1;box-sizing:content-box;padding:9px 20px;border-radius:26px;background:radial-gradient(120% 120% at 30% 12%,#FFF0B3,#FFC72C 42%,#D9972B 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -5px 0 rgba(140,84,10,.4),0 16px 34px -12px #000,0 0 54px -6px rgba(234,179,8,.75);filter:none !important}
.lt-dark .lt-fact{border-radius:20px}
.lt-dark .lt-rc-barcode{background:repeating-linear-gradient(90deg,#E5D6BF 0 2px,transparent 2px 4px,#E5D6BF 4px 7px,transparent 7px 8px,#E5D6BF 8px 9px,transparent 9px 12px)}
.lt-awning-sm .lt-b-t3{opacity:.5}.lt-awning-sm .lt-b-t2{opacity:.3}.lt-awning-sm .lt-b-t1{opacity:.18}
${B} .lt-buehne,${M} .lt-buehne{display:block;position:absolute;inset:0;pointer-events:none;overflow:hidden}
${M} .lt-awning{perspective:900px}
${M} .lt-b-licht{display:none}
${M} .lt-b-ebene{bottom:-34px}
${M} .lt-b-aehre{filter:brightness(.62) saturate(1.25)}
${M} .lt-b-t3{filter:drop-shadow(0 2px 3px rgba(75,42,20,.35))}
${M} .lt-b-staub{background:#FFF8E1;box-shadow:0 0 6px 1px rgba(255,255,255,.9)}
.lt-b-licht{position:absolute;left:50%;bottom:-70%;width:min(760px,150%);aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,rgba(253,230,138,.3),rgba(234,179,8,.1) 55%,transparent);transform:translate3d(calc(-50% + var(--px,0) * 26px),calc(var(--py,0) * 12px),0);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.lt-b-ebene{position:absolute;bottom:-26px;display:block;transition:transform .45s cubic-bezier(.2,.8,.2,1);will-change:transform}
.lt-b-t1{transform:translate3d(calc(var(--px,0) * -6px),calc(var(--py,0) * -4px),0);opacity:.32;filter:blur(1.6px)}
.lt-b-t2{transform:translate3d(calc(var(--px,0) * -16px),calc(var(--py,0) * -9px),0);opacity:.62;filter:blur(.5px)}
.lt-b-t3{transform:translate3d(calc(var(--px,0) * -34px),calc(var(--py,0) * -18px),0);opacity:1;filter:drop-shadow(0 0 14px rgba(234,179,8,.45))}
.lt-b-aehre{display:block;height:100%;width:100%;transform-origin:50% 100%;animation:ltAehre 5.5s ease-in-out infinite}
@keyframes ltAehre{0%,100%{transform:rotate(-2.6deg)}50%{transform:rotate(3.2deg)}}
.lt-b-staub{position:absolute;border-radius:50%;background:#FFF3D0;box-shadow:0 0 8px 1px rgba(253,230,138,.8);animation:ltStaub 8s ease-in-out infinite;bottom:auto}
.lt-b-staub.lt-b-t1{filter:blur(1px)}
.lt-b-staub.lt-b-t3{filter:none}
@keyframes ltStaub{0%,100%{margin-top:0;margin-left:0;opacity:0}20%{opacity:.9}50%{margin-top:-26px;margin-left:10px;opacity:.55}80%{opacity:.85}}
${B} .lt-hdr-logo{transform:rotateY(calc(var(--px,0) * 10deg)) rotateX(calc(var(--py,0) * -7deg));transition:transform .45s cubic-bezier(.2,.8,.2,1)}
/* Logo dreht sich beim Antippen: ohne preserve-3d, sonst schneidet der goldene Rahmen das Logo in der Mitte ab */
${B} .lt-hdr-logo{isolation:isolate}
${B} .lt-hdr-logo::before{content:"";position:absolute;inset:-9px -20px;z-index:-1;border-radius:26px;background:radial-gradient(120% 120% at 30% 12%,#FFF0B3,#FFC72C 42%,#D9972B 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -5px 0 rgba(140,84,10,.4),0 16px 34px -12px #000,0 0 54px -6px rgba(234,179,8,.75)}
/* v190: weicher Schatten ohne Versatz (vorher stand die kleine Schrift doppelt, etwas tiefer) */
${B} .lt-logo{filter:drop-shadow(0 1px 2px rgba(75,42,20,.28)) !important}
/* v191: Tablet und PC: Ähren-Kopf groß, damit man die Ähren und das Licht richtig sieht */
@media (min-width:561px){${B} .lt-awning:not(.lt-awning-sm),${M} .lt-awning:not(.lt-awning-sm){height:300px}${B} .lt-awning:not(.lt-awning-sm) .lt-logo,${M} .lt-awning:not(.lt-awning-sm) .lt-logo{height:150px}${B} .lt-awning.lt-awning-sm,${M} .lt-awning.lt-awning-sm{height:150px}${B} .lt-awning-sm .lt-logo,${M} .lt-awning-sm .lt-logo{height:86px}${B} .lt-b-ebene,${M} .lt-b-ebene{zoom:1.45}}
/* v191: Menüleiste links am PC etwas tiefer, damit sie nicht in den großen Kopf ragt */
@media (min-width:1051px) and (min-height:640px){html:not([class*="lt-pt_mk"]) .lt-shell.lt-kopf-aehren:not([class*="lt-th-"])>.lt-bottomnav,html:not([class*="lt-pt_mk"]) .lt-shell.lt-kopf-mitaehren:not([class*="lt-th-"])>.lt-bottomnav{top:calc(50% + 90px);max-height:calc(100% - 200px)}}
/* v190: goldener Logo-Knopf am Handy kleiner */
@media (max-width:560px){${B} .lt-awning:not(.lt-awning-sm) .lt-logo{height:100px}${B} .lt-hdr-logo::before{inset:-7px -14px;border-radius:20px}}
html.lt-noanim .lt-b-aehre,html.lt-noanim .lt-b-staub{animation:none}
html.lt-noanim .lt-b-staub{opacity:.5}
@media (prefers-reduced-motion:reduce){.lt-b-aehre,.lt-b-staub,.lt-dark .lt-bar,.lt-dark .lt-fill{animation:none !important}.lt-b-staub{opacity:.5}}
`;
