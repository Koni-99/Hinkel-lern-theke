// ═══ Design der Lern-Theke ═══
// Vorher als langer Text (LT_CSS) mitten in App.tsx. Der Text ist unverändert übernommen
// und wird wie bisher als <style> eingefügt, damit die App genau gleich aussieht.
import { dc } from './daten/data';

/** Stylesheet für Hover-Effekte und die automatische Handy-Ansicht. kueken = Küken-Bild für Platzhalter. */
export const buildLtCss = (kueken: string): string => `
.lt-root{font-family:'Atkinson Hyperlegible',Verdana,system-ui,sans-serif}
.lt-root button{font-family:inherit}
.lt-card{transition:transform .2s ease,box-shadow .2s ease}
.lt-card:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(75,42,20,.14)}
.lt-desknav{display:none !important}
.lt-bottomnav{display:grid}
.lt-awning{height:120px}
.lt-logo{height:88px}
.lt-root .lt-awning.lt-awning-sm{height:84px}.lt-root .lt-awning-sm .lt-logo{height:62px}.lt-root .lt-awning-sm .lt-sway{display:none}
.lt-h1{font-size:50px}
.lt-only-mobile{display:none}
.lt-maincard{flex-direction:column;align-items:stretch}
.lt-bon{width:420px;font-size:18px}
.lt-themed h2,.lt-themed h3,.lt-themed h4{font-family:'Bricolage Grotesque','Atkinson Hyperlegible',sans-serif !important;font-weight:400 !important;letter-spacing:0 !important}
.lt-themed input:not([type=checkbox]):not([type=radio]),.lt-themed select,.lt-themed textarea{font-size:17px !important;min-height:50px;border-radius:12px !important;box-sizing:border-box;font-family:inherit}
.lt-themed textarea{min-height:100px}
.lt-themed button{min-height:44px;font-family:inherit}
.lt-themed input[type=checkbox],.lt-themed input[type=radio]{width:22px;height:22px;accent-color:${dc('#4B2A14')}}
@keyframes ltFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes ltFade{from{opacity:0}to{opacity:1}}
@keyframes ltBasketIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
.lt-basket-item{animation:ltBasketIn .5s ease both;transform-box:fill-box}
.lt-basket-drop{animation:ltBasketDrop .7s cubic-bezier(.3,0,.6,1) both;transform-box:fill-box;transform-origin:center bottom}
@keyframes ltBasketDrop{0%{transform:translateY(-70px);opacity:0}10%{opacity:1}60%{transform:translateY(0) scale(1.15,.8)}75%{transform:translateY(-6px) scale(.95,1.05)}100%{transform:none}}
@keyframes ltDialog{from{opacity:0;transform:translateY(22px) scale(.96)}to{opacity:1;transform:none}}
@keyframes ltPop{0%{transform:scale(1)}40%{transform:scale(1.035)}100%{transform:scale(1)}}
@keyframes ltShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.lt-page{animation:ltFadeUp .35s cubic-bezier(.2,.8,.2,1)}
.lt-pop-in{animation:ltFadeUp .4s cubic-bezier(.2,.8,.2,1)}
.lt-msg{animation:ltFadeUp .3s cubic-bezier(.2,.8,.2,1)}
.lt-correct{animation:ltPop .45s ease,ltAnsOk .9s ease}
.lt-wrong{animation:ltShake .45s ease}
.lt-ans-ok{animation:ltAnsOk .9s ease}@keyframes ltAnsOk{0%{box-shadow:0 0 0 0 rgba(46,160,67,.0)}25%{box-shadow:0 0 0 6px rgba(46,160,67,.55),0 0 34px rgba(46,160,67,.45)}100%{box-shadow:0 0 0 0 rgba(46,160,67,0)}}
.lt-ans-bad{animation:ltShake .45s ease}
.lt-bag-rare .lt-bag-body{background:linear-gradient(110deg,#B8860B 0,#FFE27A 22%,#FFF6C8 35%,#E8B923 50%,#FFF0A8 65%,#C9971C 100%);background-size:200% 100%;animation:ltRareShine 2.2s linear infinite}
.lt-bag-open.lt-bag-rare .lt-bag-body{animation:ltBagPeel .85s cubic-bezier(.5,0,.7,.4) forwards}
@keyframes ltRareShine{from{background-position:0 0}to{background-position:-200% 0}}
.lt-rare-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:6;padding:4px 12px;border-radius:999px;background:linear-gradient(90deg,#7B2FF7,#C21E8E);color:#fff;font-weight:800;font-size:13px;letter-spacing:1px;white-space:nowrap;box-shadow:0 4px 10px rgba(120,30,160,.4);animation:ltRarePulse 1.2s ease-in-out infinite}
@keyframes ltRarePulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.08)}}

.lt-snowcap{position:absolute;left:0;right:0;top:0;height:7px;background:linear-gradient(#FFFFFF,#F1F5FA);box-shadow:0 1px 0 rgba(150,170,190,.5)}
.lt-drip{position:absolute;top:14px;width:6px;height:10px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:linear-gradient(#CFE6F7,#7DB9F0);opacity:0;animation:ltDrip 2s ease-in infinite;pointer-events:none;z-index:2}
@keyframes ltDrip{0%{transform:translateY(0) scaleY(.4);opacity:0}25%{transform:translateY(0) scaleY(1);opacity:.95}35%{transform:translateY(0) scaleY(1.25)}100%{transform:translateY(46px) scaleY(1.1);opacity:0}}
.lt-glint{position:absolute;color:#FFF7C2;font-size:13px;text-shadow:0 0 6px rgba(255,240,170,.95);pointer-events:none;opacity:0;animation:ltGlint 3s ease-in-out infinite}
@keyframes ltGlint{0%,100%{opacity:0;transform:scale(.4) rotate(0)}45%{opacity:1;transform:scale(1.1) rotate(45deg)}60%{opacity:0;transform:scale(.5) rotate(90deg)}}
@media (prefers-reduced-motion: reduce){.lt-drip,.lt-glint{display:none}}

.lt-pb{position:relative;width:150px;height:190px;margin:0 auto}
.lt-pb-bag{position:absolute;left:50%;bottom:12px;width:64px;height:106px;margin-left:-32px;z-index:2;transform-origin:50% 100%;animation:ltPbMove 3.4s cubic-bezier(.4,0,.3,1) var(--pbd,0s) both}
@keyframes ltPbMove{0%{transform:translateY(-200px) rotate(-6deg);opacity:0}3%{opacity:1}9%{transform:translateY(0) scale(1.06,.9)}14%{transform:translateY(-10px) scale(.97,1.03) rotate(2deg)}19%{transform:translateY(0) scale(1.02,.98) rotate(0)}30%{transform:rotate(-3deg)}36%{transform:rotate(3deg)}42%{transform:rotate(-2deg)}48%{transform:scale(1.04,.95)}54%{transform:scale(.98,1.05)}60%,100%{transform:none;opacity:1}}
.lt-pb-back{animation:ltPbOpen 3.4s ease-out var(--pbd,0s) both;transform-box:fill-box;transform-origin:50% 100%}
@keyframes ltPbOpen{0%,46%{transform:none}56%,100%{transform:translateY(-8px) scaleX(.96)}}
.lt-pb-shadow{position:absolute;left:50%;bottom:6px;width:72px;height:10px;margin-left:-36px;border-radius:50%;background:radial-gradient(ellipse,rgba(60,35,10,.38),rgba(60,35,10,0) 70%)}
.lt-pb-prize{position:absolute;left:50%;bottom:108px;width:60px;margin-left:-30px;text-align:center;font-size:30px;line-height:1;z-index:1;opacity:0;filter:drop-shadow(0 4px 6px rgba(80,40,0,.3));animation:ltPbRise 3.4s cubic-bezier(.16,1,.3,1) var(--pbd,0s) both}
@keyframes ltPbRise{0%,50%{opacity:0;transform:translateY(40px) scale(.8) rotate(-10deg)}54%{opacity:1}74%{transform:translateY(-14px) scale(1.15) rotate(8deg)}86%,100%{opacity:1;transform:translateY(-6px) scale(1) rotate(-4deg)}}
.lt-pb-rays{position:absolute;left:50%;bottom:112px;width:120px;height:120px;margin:0 0 -60px -60px;border-radius:50%;background:repeating-conic-gradient(rgba(255,205,40,.4) 0 9deg,rgba(255,205,40,0) 9deg 22deg);-webkit-mask:radial-gradient(circle,#000 20%,transparent 68%);mask:radial-gradient(circle,#000 20%,transparent 68%);opacity:0;animation:ltPbRays 3.4s ease-out var(--pbd,0s) both,ltPbSpin 8s linear infinite}
@keyframes ltPbRays{0%,58%{opacity:0;transform:scale(.3)}75%,100%{opacity:1;transform:scale(1)}}
@keyframes ltPbSpin{to{rotate:360deg}}
.lt-pb-sp{position:absolute;left:50%;bottom:114px;font-size:12px;opacity:0;z-index:3;animation:ltPbSp 1.3s ease-out both}
@keyframes ltPbSp{0%{opacity:0;transform:translate(0,30px) scale(.2)}40%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(1) rotate(90deg)}}
.lt-pb-text{animation:ltFadeUp .5s ease 2.9s both}
@keyframes ltFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.lt-pb *{animation:none !important;opacity:1 !important}}

body.lt-hot::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:900;box-shadow:inset 0 0 38px 8px rgba(255,120,0,.5),inset 0 0 90px 20px rgba(255,70,0,.18);animation:ltOven 1.6s ease-in-out infinite alternate}
@keyframes ltOven{from{opacity:.65}to{opacity:1}}
.lt-flour{position:fixed;width:6px;height:6px;border-radius:50%;background:#FFFFFF;box-shadow:0 0 3px rgba(120,80,40,.55);pointer-events:none;z-index:6000;animation:ltFlour .75s ease-out forwards}
@keyframes ltFlour{0%{transform:translate(0,0) scale(1);opacity:.95}100%{transform:translate(var(--fx),var(--fy)) scale(.3);opacity:0}}
.lt-chalk{box-sizing:border-box;width:100%;max-width:100%;overflow-wrap:anywhere;background:#262A27 !important;background-image:radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.06),transparent 55%),radial-gradient(ellipse at 75% 70%,rgba(255,255,255,.05),transparent 50%) !important;border:7px solid #8B5A2B !important;border-radius:10px !important;box-shadow:inset 0 0 0 2px #6B4220,0 10px 20px -8px rgba(0,0,0,.4) !important;color:#F4F1E8 !important}
.lt-chalk .lt-chalk-h{font-family:'Caveat',cursive;font-size:24px;line-height:1;color:#FFFFFF}
.lt-chalk .lt-chalk-t{font-family:'Caveat',cursive;font-size:19px;line-height:1.25;color:#F4F1E8;opacity:.95}
.lt-menu{background:#FFFDF6;border:2px solid #E8D5B0;border-radius:22px;padding:8px 6px;box-shadow:0 10px 24px -14px rgba(69,26,3,.3)}
.lt-menu-row{position:relative;display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border:none;background:transparent;text-align:left;cursor:pointer;border-radius:14px;color:inherit;font:inherit}
.lt-menu-row:hover{background:rgba(255,199,44,.14)}
.lt-menu-row+.lt-menu-row{border-top:1px solid rgba(75,42,20,.08)}
.lt-menu-lead{flex:1;min-width:16px;border-bottom:2px dotted rgba(75,42,20,.35);margin:0 4px;transform:translateY(-5px)}
.lt-bag{position:absolute;inset:-6px;z-index:5;border:none;padding:0;background:transparent;cursor:pointer}
.lt-bag-body{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:linear-gradient(90deg,#E9AE00 0,#FFCB12 12%,#FFD83A 45%,#FFCD12 80%,#DDA200 100%);color:#4B2A14;border-radius:16px;box-shadow:inset 0 -10px 18px rgba(0,0,0,.12);clip-path:polygon(0 0,calc(100% - 40px) 0,100% 40px,100% 100%,0 100%);transform-origin:0 100%}
.lt-bag-body::after{content:'';position:absolute;top:0;bottom:0;left:22%;width:16%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.22),rgba(255,255,255,0));pointer-events:none}
.lt-bag-top{position:absolute;right:0;top:0;width:40px;height:40px;background:linear-gradient(225deg,transparent 50%,#C99300 50%,#F5D46A);border-radius:0 0 0 8px;box-shadow:-3px 3px 5px rgba(0,0,0,.18);z-index:1;transform-origin:100% 0;animation:ltEarWiggle 2.4s ease-in-out infinite}
@keyframes ltEarWiggle{0%,80%,100%{transform:none}88%{transform:scale(1.18)}94%{transform:scale(1.05)}}
.lt-bag-open .lt-bag-top{animation:ltEarPeel .35s ease-in forwards}
@keyframes ltEarPeel{to{transform:scale(2.4);opacity:0}}
.lt-bag-open .lt-bag-body{animation:ltBagPeel .85s cubic-bezier(.5,0,.7,.4) forwards}
@keyframes ltBagPeel{0%{transform:none}25%{transform:rotate(-4deg)}100%{transform:translate(-40%,90%) rotate(-28deg);opacity:0}}
@keyframes ltTearTop{0%{transform:none}30%{transform:rotate(-4deg) translateY(-4px)}100%{transform:translate(70px,-90px) rotate(25deg);opacity:0}}
@keyframes ltBagDown{0%,30%{transform:translateY(0)}100%{transform:translateY(130%);opacity:0}}
.lt-stamp{aspect-ratio:1;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.lt-stamp-on{border:2px solid #C0392B;background:rgba(192,57,43,.08);color:#C0392B;font-size:24px}
.lt-stamp-new{animation:ltStampIn .6s cubic-bezier(.16,1,.3,1) both}
@keyframes ltStampIn{0%{transform:scale(2.4) rotate(var(--sr,0deg));opacity:0}60%{opacity:1}100%{transform:scale(1) rotate(var(--sr,0deg))}}
@media (prefers-reduced-motion: reduce){body.lt-hot::after{animation:none}.lt-flour{display:none}}

.lt-receipt{background:#FFFDF8 !important;border:none !important;border-radius:4px 4px 0 0 !important;box-shadow:0 12px 26px -10px rgba(69,26,3,.3) !important;animation:ltPrint 1.1s steps(16,end) both;-webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 12px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/18px 12px repeat-x;mask:linear-gradient(#000 0 0) top/100% calc(100% - 12px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/18px 12px repeat-x}
.lt-receipt{width:100%;max-width:400px;margin:0 auto;align-self:center;background:#FBFAF6 !important;background-image:linear-gradient(90deg,rgba(0,0,0,.025),transparent 8%,transparent 92%,rgba(0,0,0,.025)) !important;color:#2A2A2A !important}
.lt-receipt,.lt-receipt *{font-family:'Courier Prime','Courier New',Courier,ui-monospace,monospace !important;letter-spacing:.02em}
.lt-receipt *{color:#2A2A2A !important;text-transform:uppercase}
.lt-receipt div:not(.lt-rc-barcode),.lt-receipt span{background:transparent !important;box-shadow:none !important;border-radius:0 !important}
.lt-receipt > div:not(.lt-rc-mono){justify-content:center;text-align:center}
.lt-receipt .lt-count{font-size:52px !important;font-weight:700}
.lt-receipt > div:not(.lt-rc-mono){width:100%;border-top:1px dashed rgba(0,0,0,.18);padding-top:8px}
.lt-receipt .lt-star-pop,.lt-receipt .lt-star-pop *{color:inherit !important}
.lt-receipt button{text-transform:none}
@keyframes ltPrint{0%{clip-path:inset(0 0 100% 0)}100%{clip-path:inset(0 0 0 0)}}


.lt-wxpill{order:2;display:inline-flex;align-items:center;gap:4px;min-height:42px;padding:0 12px 0 6px;border-radius:999px;background:rgba(255,255,255,.82);color:#2B170A;font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 6px 14px -8px rgba(31,20,12,.5)}
.lt-cloud{font-size:0 !important;filter:drop-shadow(0 4px 6px rgba(20,30,50,.18)) !important}
.lt-sky{filter:drop-shadow(0 0 10px rgba(255,236,170,.6)) !important}
@media (max-width:400px){.lt-wxpill{padding:0 8px 0 4px;font-size:14px}.lt-wxpill svg{width:22px;height:22px}}

/* v138: Schwerter in 3D, Wetter größer */
.lt-sw3d svg{transform-style:preserve-3d;animation:ltSw3d 3s ease-in-out infinite}
@keyframes ltSw3d{0%,100%{transform:rotateY(-16deg) rotateX(6deg)}50%{transform:rotateY(16deg) rotateX(-4deg)}}
.lt-sw3-l{transform-box:view-box;transform-origin:6px 26px;animation:ltSw3L 2.4s ease-in-out infinite}
.lt-sw3-r{transform-box:view-box;transform-origin:26px 26px;animation:ltSw3R 2.4s ease-in-out infinite}
.lt-spark3{transform-box:view-box;transform-origin:16px 13.5px;opacity:0;animation:ltSpark3 2.4s ease-out infinite}
@keyframes ltSw3L{0%,55%,100%{transform:rotate(0)}68%{transform:rotate(-30deg)}78%{transform:rotate(5deg)}86%{transform:rotate(-2deg)}}
@keyframes ltSw3R{0%,55%,100%{transform:rotate(0)}68%{transform:rotate(30deg)}78%{transform:rotate(-5deg)}86%{transform:rotate(2deg)}}
@keyframes ltSpark3{0%,74%{opacity:0;transform:scale(.3)}79%{opacity:1;transform:scale(1.4)}92%,100%{opacity:0;transform:scale(.6)}}
.lt-awning .lt-sky svg{width:48px;height:48px}
.lt-awning .lt-cloud svg{width:66px;height:66px}
@media (min-width:701px){
  .lt-awning .lt-sky svg{width:74px;height:74px}
  .lt-awning .lt-cloud svg{width:104px;height:104px}
  .lt-awning .lt-snow{font-size:26px !important}
  .lt-awning .lt-star{font-size:18px !important}
  .lt-root .lt-awning>.lt-sway{font-size:54px !important}
  .lt-wxpill svg{width:30px;height:30px}
}
@media (min-width:701px){.lt-root .lt-awning.lt-awning-sm .lt-sky svg{width:56px;height:56px}.lt-root .lt-awning.lt-awning-sm .lt-cloud svg{width:76px;height:76px}}
.lt-bake-row{animation:ltFadeUp .4s cubic-bezier(.2,.8,.2,1) both}

/* v142: Abzeichen-Album blättert wie ein Buch */
.lt-leaf{position:absolute;inset:0;z-index:4;border-radius:24px;pointer-events:none;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:linear-gradient(90deg,#F3E7D0 0%,#FFFDF6 18%,#FFFBF0 70%,#EADCC3 100%);box-shadow:0 0 0 1px rgba(31,20,12,.06),0 20px 40px -14px rgba(31,20,12,.45)}
.lt-leaf-r{transform-origin:left center;animation:ltLeafR .75s cubic-bezier(.45,.05,.3,1) forwards}
.lt-leaf-l{transform-origin:right center;animation:ltLeafL .75s cubic-bezier(.45,.05,.3,1) forwards;background:linear-gradient(270deg,#F3E7D0 0%,#FFFDF6 18%,#FFFBF0 70%,#EADCC3 100%)}
@keyframes ltLeafR{0%{transform:perspective(1600px) rotateY(0)}100%{transform:perspective(1600px) rotateY(-180deg)}}
@keyframes ltLeafL{0%{transform:perspective(1600px) rotateY(0)}100%{transform:perspective(1600px) rotateY(180deg)}}
.lt-flip-r>div:not(.lt-leaf),.lt-flip-l>div:not(.lt-leaf){animation:ltPageIn .5s ease .25s both}
@keyframes ltPageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* v143: Schatzkammer */
.lt-schatz-sec{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-top:6px}
.lt-schatz-sec b{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;color:#2B170A}
.lt-schatz-sec span{font-size:13px;color:#7A6553}
.lt-schatz-show{display:flex;align-items:center;justify-content:center;height:88px;border-radius:16px;background:radial-gradient(ellipse at 50% 30%,#FFFFFF,#F6EFE2 75%);box-shadow:inset 0 0 0 1px rgba(31,20,12,.05);overflow:hidden;position:relative}
.lt-schatz-rare{position:relative;display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,90,.55),rgba(255,214,90,0) 70%)}
.lt-schatz-rare::after{content:"";position:absolute;left:50%;bottom:4px;width:44px;height:8px;margin-left:-22px;border-radius:50%;background:radial-gradient(ellipse,rgba(31,20,12,.28),rgba(31,20,12,0) 70%);z-index:-1}
.lt-root .lt-schatz-mk{width:100% !important;height:62px !important;border:none !important;border-radius:0 !important;align-self:flex-start;box-shadow:none !important;-webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 12px) no-repeat,radial-gradient(circle at 12px 0,#000 12px,transparent 12.5px) bottom/24px 12px repeat-x;mask:linear-gradient(#000 0 0) top/100% calc(100% - 12px) no-repeat,radial-gradient(circle at 12px 0,#000 12px,transparent 12.5px) bottom/24px 12px repeat-x}
.lt-schatz-bon{padding:10px 14px 14px;background:#FFFFFF;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:15px;color:#2B170A;white-space:nowrap;box-shadow:0 6px 12px -6px rgba(31,20,12,.4);transform:rotate(-2deg);-webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 6px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/10px 6px repeat-x;mask:linear-gradient(#000 0 0) top/100% calc(100% - 6px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/10px 6px repeat-x}

/* v143: Pillen wie Milchglas, wenn die Wetter-Markise an ist */
.lt-root .lt-wx-on .lt-pill,.lt-root .lt-wx-on .lt-kasse{background:rgba(31,20,12,.32) !important;color:#FFF3C4 !important;-webkit-backdrop-filter:blur(10px) saturate(1.3);backdrop-filter:blur(10px) saturate(1.3);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 6px 14px -8px rgba(0,0,0,.45) !important;text-shadow:0 1px 2px rgba(0,0,0,.35)}
.lt-wx-on .lt-wxpill{background:rgba(255,255,255,.3);color:#FFFFFF;-webkit-backdrop-filter:blur(10px) saturate(1.3);backdrop-filter:blur(10px) saturate(1.3);box-shadow:inset 0 0 0 1px rgba(255,255,255,.4),0 6px 14px -8px rgba(0,0,0,.35);text-shadow:0 1px 2px rgba(0,0,0,.35)}
.lt-root img.lt-intro-kueken,.lt-root img.lt-intro-kueken.lt-loaded{background:none !important;filter:drop-shadow(0 4px 4px rgba(43,23,10,.25));animation:ltKuekenUp .7s cubic-bezier(.16,1,.3,1) .2s both !important}
/* v134: Kopf und Navigation wie im Prototyp */
.lt-root{padding-bottom:116px}
.lt-hdr-row{position:relative;z-index:2;width:100%;max-width:1100px;margin:0 auto;padding:0 16px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;box-sizing:border-box}
.lt-hdr-left{display:flex;justify-content:flex-start;min-width:0}
.lt-hdr-row .lt-hdr-pills{justify-content:flex-end;min-width:0}
@media (max-width:420px){.lt-pill{padding:0 10px;font-size:15px;gap:4px}.lt-pill-round{width:40px;padding:0}.lt-hdr-row{padding:0 10px;gap:4px}}
.lt-hdr-pills{display:flex;align-items:center;gap:6px;flex-wrap:nowrap}
.lt-pill{position:relative;display:flex;align-items:center;gap:6px;min-height:42px;padding:0 13px;border:none;border-radius:999px;background:#1F140C;color:#FFD86B;font-size:16px;font-weight:800;cursor:pointer;font-variant-numeric:tabular-nums;white-space:nowrap;box-shadow:0 6px 14px -8px rgba(31,20,12,.7)}
.lt-pill-round{width:42px;padding:0;justify-content:center}
/* Handy: Markise größer und in zwei Reihen (oben Punkte/Trinkgeld/Menü, darunter groß das Logo), damit nichts übereinanderliegt */
@media (max-width:560px){
  .lt-root .lt-awning:not(.lt-awning-sm){height:auto;min-height:232px}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-hdr-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"l r" "m m";row-gap:6px;padding-top:14px;padding-bottom:12px}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-pill{min-height:46px;font-size:17px}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-pill-round{width:46px}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-hdr-left{grid-area:l}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-hdr-pills{grid-area:r}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-hdr-logo{grid-area:m;justify-self:center}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-logo{height:132px}
  .lt-root .lt-awning-sm .lt-wxpill{display:none}
  .lt-root .lt-awning:not(.lt-awning-sm) .lt-wxpill{position:absolute;left:16px;bottom:14px}
  .lt-root .lt-awning.lt-awning-sm{height:96px}.lt-root .lt-awning-sm .lt-logo{height:70px}
}
.lt-menu-pop{position:fixed;top:12px;right:12px;z-index:120;min-width:240px;padding:8px;border-radius:18px;background:#FFFFFF;box-shadow:0 24px 50px -16px rgba(31,20,12,.55);display:flex;flex-direction:column;gap:2px;animation:ltFadeUp .25s cubic-bezier(.2,.8,.2,1)}
.lt-menu-pop button{display:flex;align-items:center;gap:12px;min-height:50px;padding:0 14px;border:none;border-radius:12px;background:transparent;color:#2B170A;font-size:16px;font-weight:700;text-align:left;cursor:pointer}
.lt-menu-pop button:hover{background:#FBF6EC}
.lt-menu-pop .lt-menu-who{padding:8px 14px 6px;font-size:13px;color:#7A6553}
.lt-bottomnav{position:fixed;left:50%;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:calc(100% - 24px);max-width:560px;z-index:50;background:#4B2A14;border-radius:26px;padding:8px;gap:0;box-sizing:border-box;box-shadow:0 18px 32px -12px rgba(31,20,12,.65)}
.lt-nav-ind{position:absolute;top:8px;bottom:8px;left:8px;border-radius:19px;background:#FFC72C;box-shadow:inset 0 -3px 0 rgba(185,138,10,.45);transition:transform .45s cubic-bezier(.3,1.25,.5,1),opacity .2s;pointer-events:none}
.lt-bottomnav button{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;min-height:54px;border:none;border-radius:19px;background:transparent;color:#F0D9AE;cursor:pointer;min-width:0}
.lt-bottomnav button.lt-on{color:#1F140C}
.lt-bottomnav button:not(.lt-on):hover{color:#FFFFFF}
/* v134: Produkt des Tages groß mit Foto */
.lt-pod{position:relative;display:block;width:100%;height:270px;padding:0;border:none;border-radius:26px;overflow:hidden;cursor:pointer;text-align:left;background:radial-gradient(ellipse at 62% 30%,#F8C982,#C9803F 50%,#5E3214);box-shadow:0 18px 32px -18px rgba(75,42,20,.7)}
.lt-pod.lt-pod-solo{height:220px}
.lt-root img.lt-pod-img,.lt-root img.lt-pod-img.lt-loaded{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:none !important;animation:ltPodZoom 16s ease-in-out infinite alternate !important}
@keyframes ltPodZoom{from{transform:scale(1.02)}to{transform:scale(1.1)}}
.lt-pod-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,10,4,.05) 20%,rgba(20,10,4,.78) 100%)}
.lt-pod-bread{position:absolute;right:-10px;top:10px;color:rgba(255,236,200,.28)}
.lt-pod-tag{position:absolute;top:14px;left:14px;padding:6px 12px;border-radius:999px;background:#FFFFFF;color:#2B170A;font-size:12px;font-weight:800;letter-spacing:.1em}
.lt-pod-txt{position:absolute;left:20px;right:20px;bottom:96px;color:#FFFFFF;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.lt-pod-solo .lt-pod-txt{bottom:20px}
.lt-pod-txt b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1.08;letter-spacing:-.02em}
.lt-pod-txt span{display:block;margin-top:4px;font-size:15px;line-height:1.35;opacity:.92;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lt-pod + .lt-hero-wrap{margin-top:-108px;padding:0 12px}
/* v134: Team-Zeile */
.lt-team{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;background:#FFFFFF;box-shadow:0 1px 2px rgba(31,20,12,.05),0 8px 20px -14px rgba(31,20,12,.3);font-size:15px;line-height:1.35}
.lt-team-av{display:flex;flex:0 0 auto}
.lt-team-av span{width:38px;height:38px;margin-left:-10px;border-radius:50%;border:3px solid #FFFFFF;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;animation:ltPopIn .5s cubic-bezier(.3,1.4,.5,1) both}
.lt-team-av span:first-child{margin-left:0}
@keyframes ltPopIn{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}
.lt-foot{padding:10px 0 0;text-align:center;font-size:12px;font-weight:700;letter-spacing:.16em;color:#9A8370}
/* v135 */
.lt-basket{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:20px;background:#FFFFFF;box-shadow:0 1px 2px rgba(31,20,12,.05),0 8px 20px -14px rgba(31,20,12,.3)}
.lt-basket b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px}
.lt-basket span>span{display:block;font-size:15px;color:#7A6553;margin-top:2px;line-height:1.35}
.lt-basket .lt-basket-lvl{height:6px;margin:8px 0 4px;border-radius:9px;background:#F3EBDB;overflow:hidden}
.lt-basket .lt-basket-lvl i{display:block;height:100%;border-radius:9px;background:#FFC72C}
.lt-bread{transform-box:fill-box;transform-origin:center;animation:ltBreadDrop .7s cubic-bezier(.3,1.3,.5,1) both}
@keyframes ltBreadDrop{0%{transform:translateY(-40px) rotate(-20deg);opacity:0}60%{opacity:1}100%{transform:none}}
.lt-root .lt-menu{background:#FFFFFF !important;border:none !important;border-radius:22px !important;box-shadow:0 1px 2px rgba(31,20,12,.05),0 10px 24px -16px rgba(31,20,12,.4) !important}
/* Produkt des Tages: Foto scharf und ganz zu sehen */
.lt-pod{background:#3A2210}
.lt-root img.lt-pod-blur,.lt-root img.lt-pod-blur.lt-loaded{position:absolute;inset:-30px;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;filter:blur(28px) saturate(1.2) brightness(.75);background:none !important;animation:none !important}
.lt-root img.lt-pod-img,.lt-root img.lt-pod-img.lt-loaded{position:absolute;inset:auto;right:18px;top:16px;bottom:auto;left:auto;width:auto;height:auto;max-width:46%;max-height:150px;object-fit:contain;border-radius:16px;box-shadow:0 14px 28px -12px rgba(0,0,0,.6);background:none !important;animation:ltPodIn .7s cubic-bezier(.16,1,.3,1) .2s both !important}
@keyframes ltPodIn{from{transform:translateY(10px) scale(.94);opacity:0}to{transform:none;opacity:1}}
.lt-pod-shade{background:linear-gradient(90deg,rgba(20,10,4,.72) 0%,rgba(20,10,4,.35) 55%,rgba(20,10,4,0) 100%),linear-gradient(180deg,rgba(20,10,4,0) 50%,rgba(20,10,4,.55) 100%)}
.lt-pod-txt{right:calc(46% + 24px)}
@media (min-width:701px){.lt-pod{height:300px}.lt-root img.lt-pod-img,.lt-root img.lt-pod-img.lt-loaded{max-height:190px;right:28px;top:22px}.lt-pod-txt{bottom:110px}.lt-pod + .lt-hero-wrap{margin-top:-96px}}
@media (max-width:700px){.lt-pod{height:330px}.lt-pod.lt-pod-solo{height:280px}.lt-pod-txt{right:20px;bottom:100px}.lt-root img.lt-pod-img,.lt-root img.lt-pod-img.lt-loaded{max-width:52%;max-height:118px;top:14px;right:14px}.lt-pod-txt b{font-size:22px;-webkit-line-clamp:3}.lt-pod-txt{padding-right:0}}


/* v132: Quiz im Laden-Stil */
.lt-qcard{border:none !important;box-shadow:0 1px 2px rgba(31,20,12,.05),0 16px 32px -20px rgba(31,20,12,.45) !important;border-radius:26px !important}
.lt-qopt{transition:transform .12s ease,box-shadow .12s ease,background-color .25s,border-color .25s}
.lt-qopt:not(:disabled):active{transform:translateY(2px)}
.lt-qopt:not(:disabled):hover{border-color:#D9C29A !important}
.lt-qopt-dim{opacity:.5}
.lt-qnote{position:relative;padding:16px 18px 14px;background:#FFF6B8;transform:rotate(-.8deg);box-shadow:0 10px 18px -12px rgba(31,20,12,.45);font-size:18px;line-height:1.5;color:#2B170A}
.lt-qnote::before{content:"";position:absolute;top:-9px;left:50%;width:70px;height:18px;margin-left:-35px;background:rgba(255,255,255,.7);transform:rotate(2deg)}
.lt-qnote-lbl{display:block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7A6553;margin-bottom:4px;padding-right:60px}
.lt-root img.lt-qnote-kueken,.lt-root img.lt-qnote-kueken.lt-loaded{position:absolute;right:10px;top:-34px;width:56px;height:auto;background:none !important;filter:drop-shadow(0 3px 3px rgba(43,23,10,.25));animation:ltKuekenUp .6s cubic-bezier(.16,1,.3,1) .1s both !important}
.lt-root img.lt-qnote-kueken.lt-happy{animation:ltKuekenUp .6s cubic-bezier(.16,1,.3,1) .1s both,ltHop .5s ease .7s 2 !important}
@keyframes ltHop{0%,100%{transform:none}50%{transform:translateY(-8px) rotate(-6deg)}}
/* v132: Ergebnis-Bon */
.lt-receipt .lt-rc-lines{width:100%;display:flex;flex-direction:column;gap:2px;font-size:15px;border-top:1px dashed rgba(0,0,0,.18);padding-top:8px;margin-top:2px}
.lt-receipt .lt-rc-lines>div{display:flex;justify-content:space-between;gap:10px}
.lt-receipt .lt-rc-lines .lt-rc-sum{font-size:19px;font-weight:700;border-top:1px dashed rgba(0,0,0,.18);padding-top:6px;margin-top:4px}
.lt-receipt .lt-rc-stamp{position:absolute;right:14px;top:205px;padding:5px 10px;border:3px solid #D92D20 !important;border-radius:8px !important;color:#D92D20 !important;background:rgba(255,255,255,.6) !important;font-weight:700;font-size:16px;letter-spacing:.08em;transform:rotate(12deg);animation:ltStampIn .6s cubic-bezier(.16,1,.3,1) 1.2s both;--sr:12deg;z-index:2}
.lt-receipt .lt-rc-stamp.ok{border-color:#2F7A3E !important;color:#2F7A3E !important}

.lt-rc-mono{font-family:'Courier Prime','Courier New',Courier,ui-monospace,monospace}
.lt-rc-line{border-top:2px dashed rgba(75,42,20,.35);margin:10px 0}
.lt-rc-barcode{height:34px;width:70%;margin:10px auto 4px;background:repeating-linear-gradient(90deg,#3A2414 0 2px,transparent 2px 4px,#3A2414 4px 7px,transparent 7px 8px,#3A2414 8px 9px,transparent 9px 12px)}
.lt-paper{background-color:#FFFDF6 !important;background-image:repeating-linear-gradient(180deg,transparent 0 31px,rgba(70,120,190,.10) 31px 32px),radial-gradient(circle at 20% 15%,rgba(160,120,60,.06),transparent 60%),radial-gradient(circle at 80% 85%,rgba(160,120,60,.07),transparent 55%) !important}
.lt-paper::after{content:'';position:absolute;right:0;bottom:0;width:34px;height:34px;background:linear-gradient(315deg,#F1E3C8 0 48%,rgba(69,26,3,.18) 50%,transparent 52%);border-bottom-right-radius:inherit;pointer-events:none}
.lt-paperflip[data-t]{transition:none !important}
.lt-paperflip[data-t].is-front{animation:ltPaperBack .7s cubic-bezier(.3,.7,.3,1) both}
.lt-paperflip[data-t].is-back{animation:ltPaperFront .7s cubic-bezier(.3,.7,.3,1) both}
@keyframes ltPaperFront{0%{transform:rotateY(0)}45%{transform:rotateY(80deg) rotateZ(-4deg) skewY(5deg) scale(1.05)}100%{transform:rotateY(180deg)}}
@keyframes ltPaperBack{0%{transform:rotateY(180deg)}45%{transform:rotateY(100deg) rotateZ(4deg) skewY(-5deg) scale(1.05)}100%{transform:rotateY(0)}}
.lt-badge-spin{display:inline-block;animation:ltBadgeSpin 1.5s cubic-bezier(.2,.8,.2,1) both}
@keyframes ltBadgeSpin{0%{transform:translateY(90px) scale(3.2) rotateY(0);opacity:0}15%{opacity:1}60%{transform:translateY(90px) scale(3.2) rotateY(720deg)}100%{transform:translateY(0) scale(1) rotateY(720deg)}}
.lt-boot{position:fixed;inset:0;z-index:5000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#FFF8EC;transition:opacity .4s ease}
.lt-boot span{font-size:64px;display:inline-block;animation:ltBootSpin 1.1s cubic-bezier(.5,0,.5,1) infinite}
@keyframes ltBootSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.15)}100%{transform:rotate(360deg) scale(1)}}
@media (prefers-reduced-motion: reduce){.lt-receipt,.lt-paperflip,.lt-badge-spin{animation:none !important}}

.lt-pretzel{position:absolute;top:-50px;line-height:1;animation-name:ltPretzel;animation-timing-function:cubic-bezier(.4,0,.8,1);animation-fill-mode:both}
@keyframes ltPretzel{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(560px) rotate(var(--pr,360deg));opacity:0}}
.lt-flame-glow{filter:drop-shadow(0 0 6px rgba(255,140,0,.85)) drop-shadow(0 0 14px rgba(255,90,0,.55))}
.lt-frame-bronze,.lt-frame-silver,.lt-frame-gold{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;padding:3px;line-height:1;vertical-align:middle}
.lt-frame-bronze{background:radial-gradient(circle,#FFF8EC 58%,transparent 60%),conic-gradient(#B87333,#E3A869,#8C5523,#E3A869,#B87333)}
.lt-frame-silver{background:radial-gradient(circle,#FFF8EC 58%,transparent 60%),conic-gradient(#A7ADB5,#F2F4F7,#7F8790,#F2F4F7,#A7ADB5)}
.lt-frame-gold{background:radial-gradient(circle,#FFF8EC 58%,transparent 60%),conic-gradient(#C9971C,#FFE27A,#A87A0E,#FFE27A,#C9971C);box-shadow:0 0 10px rgba(255,200,40,.6)}
.lt-res-chip{min-width:46px;height:46px;border-radius:12px;border:2px solid transparent;font-weight:800;font-size:16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:3px}
.lt-shine{position:relative;overflow:hidden}.lt-shine::after{content:'';position:absolute;top:-20%;left:-60%;width:40%;height:140%;background:linear-gradient(100deg,rgba(255,255,255,0) 0,rgba(255,255,255,.75) 50%,rgba(255,255,255,0) 100%);transform:skewX(-18deg);animation:ltShine 5s ease-in-out infinite;animation-delay:var(--shd,0s);pointer-events:none}
@keyframes ltShine{0%,72%{left:-60%}88%,100%{left:130%}}
.lt-coinfly{position:absolute;left:8px;top:8px;font-size:26px;pointer-events:none;z-index:5;animation:ltCoinFly 1s cubic-bezier(.5,0,.3,1) both}
@keyframes ltCoinFly{0%{transform:translate(-38vw,45vh) scale(1.8);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translate(0,0) scale(.9);opacity:0}}
.lt-story-bar{flex:1;height:4px;border-radius:4px;background:rgba(75,42,20,.2);overflow:hidden}.lt-story-bar>i{display:block;height:100%;background:#4B2A14}
@media (prefers-reduced-motion: reduce){.lt-shine::after,.lt-coinfly{animation:none;display:none}}

.lt-overlay{animation:ltFade .2s ease}
.lt-dialog{animation:ltDialog .35s cubic-bezier(.2,.8,.2,1)}
.lt-root button{transition:transform .12s ease,background-color .2s ease,border-color .2s ease,box-shadow .2s ease,color .2s ease}
.lt-root button:active:not(:disabled){transform:scale(.97)}
.lt-bar{transition:width .5s cubic-bezier(.2,.8,.2,1)}
@keyframes ltFill{from{width:0}}
.lt-fill{animation:ltFill 1s cubic-bezier(.2,.8,.2,1) both}
.lt-expl{scroll-margin-bottom:210px}
@keyframes ltFloat{0%{opacity:0;transform:translateY(12px) scale(.7)}18%{opacity:1;transform:translateY(0) scale(1.15)}30%{transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}
@keyframes ltGlow{0%{box-shadow:0 0 0 0 rgba(47,93,58,.45)}100%{box-shadow:0 0 0 18px rgba(47,93,58,0)}}
@keyframes ltCount{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
.lt-float{animation:ltFloat 1.8s ease forwards;pointer-events:none}
.lt-glow{animation:ltGlow .8s ease-out}
.lt-count{animation:ltCount .7s cubic-bezier(.2,.8,.2,1)}
.lt-root{overflow-x:clip}
.lt-root p{line-height:1.55}
@keyframes ltSlideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes ltSlideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}}
.lt-page.lt-dir-r{animation:ltSlideR .26s cubic-bezier(.16,1,.3,1)}
.lt-page.lt-dir-l{animation:ltSlideL .26s cubic-bezier(.16,1,.3,1)}
@keyframes ltShimmer{0%{background-position:-220px 0}100%{background-position:220px 0}}
.lt-root img:not(.lt-logo):not(.lt-loaded){background-color:${dc('#F4EADB')};background-image:url(${kueken});background-size:auto 42%;background-repeat:no-repeat;background-position:50% 62%;animation:ltKHop .7s cubic-bezier(.3,0,.5,1) infinite}
@keyframes ltKHop{0%,100%{background-position:50% 64%;background-size:auto 40%}45%,55%{background-position:50% 30%;background-size:auto 44%}}
.lt-root img.lt-loaded:not(.lt-logo){animation:ltFade .35s ease}
@keyframes ltLevelUp{0%{transform:scale(.3) rotate(-12deg);opacity:0}55%{transform:scale(1.18) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0)}}
.lt-levelup{animation:ltLevelUp .8s cubic-bezier(.2,.8,.2,1)}
@keyframes ltSway{0%,100%{transform:rotate(-8deg) translateY(0)}50%{transform:rotate(8deg) translateY(-4px)}}
.lt-sway{display:inline-block;animation:ltSway 3.2s ease-in-out infinite;transform-origin:50% 0}
@keyframes ltToast{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}
.lt-sticky-next{position:sticky;bottom:104px;z-index:5;box-shadow:0 10px 24px -6px rgba(43,23,10,.45);animation:ltFadeUp .3s cubic-bezier(.2,.8,.2,1)}
@keyframes ltSwL{0%,28%,100%{transform:rotate(-40deg)}40%{transform:rotate(6deg)}48%{transform:rotate(-6deg)}56%{transform:rotate(2deg)}72%{transform:rotate(-40deg)}}
@keyframes ltSwR{0%,28%,100%{transform:rotate(40deg)}40%{transform:rotate(-6deg)}48%{transform:rotate(6deg)}56%{transform:rotate(-2deg)}72%{transform:rotate(40deg)}}
@keyframes ltSpark{0%,37%{opacity:0;transform:scale(.3)}42%{opacity:1;transform:scale(1.35)}56%,100%{opacity:0;transform:scale(.6)}}
@keyframes ltBadge{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
.lt-sw-l{transform-box:view-box;transform-origin:7px 25px;animation:ltSwL 1.5s ease-in-out infinite}
.lt-sw-r{transform-box:view-box;transform-origin:25px 25px;animation:ltSwR 1.5s ease-in-out infinite}
.lt-spark{transform-box:view-box;transform-origin:16px 16px;opacity:0;animation:ltSpark 1.5s ease-out infinite}
.lt-duel-badge{animation:ltBadge 1.5s ease-in-out infinite}
@keyframes ltWiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg) scale(1.08)}40%{transform:rotate(10deg) scale(1.1)}60%{transform:rotate(-6deg)}80%{transform:rotate(4deg)}}
@keyframes ltBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-6deg)}}
@keyframes ltSpinY{from{transform:perspective(600px) rotateY(0)}to{transform:perspective(600px) rotateY(360deg)}}
@keyframes ltNavPop{0%{transform:scale(1) translateY(0)}35%{transform:scale(1.28) translateY(-6px) rotate(-8deg)}65%{transform:scale(.94) translateY(0) rotate(4deg)}100%{transform:scale(1) rotate(0)}}
@keyframes ltSheen{0%{transform:translateX(-120%) skewX(-20deg)}60%,100%{transform:translateX(320%) skewX(-20deg)}}
@keyframes ltRise{from{opacity:0;transform:perspective(800px) translateY(24px) rotateX(12deg)}to{opacity:1;transform:none}}
@keyframes ltShakeSoft{0%,82%,100%{transform:rotate(0)}86%{transform:rotate(-14deg)}90%{transform:rotate(12deg)}94%{transform:rotate(-8deg)}97%{transform:rotate(5deg)}}
@keyframes ltTwinkle{0%,100%{transform:scale(1) rotate(0);filter:brightness(1)}50%{transform:scale(1.25) rotate(20deg);filter:brightness(1.3)}}
.lt-emo-bob{display:inline-block;animation:ltBob 2.8s ease-in-out infinite}
.lt-emo-shake{display:inline-block;animation:ltShakeSoft 3.5s ease-in-out infinite;transform-origin:50% 80%}
.lt-emo-twinkle{display:inline-block;animation:ltTwinkle 2.2s ease-in-out infinite}
.lt-emo-spin{display:inline-block;animation:ltSpinY 3s linear infinite}
.lt-card:hover>span:first-child,.lt-card:active>span:first-child,.lt-maincard:hover .lt-mc-icon,.lt-maincard:active .lt-mc-icon{animation:ltWiggle .7s ease}
.lt-nav-pop>svg,.lt-nav-pop>span:first-child{animation:ltNavPop .55s cubic-bezier(.2,.8,.2,1)}
.lt-logo{cursor:pointer}
.lt-logo.lt-spin{animation:ltSpinY 1.1s cubic-bezier(.3,.7,.3,1)}
.lt-fill{position:relative;overflow:hidden}
.lt-fill::after{content:'';position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0));animation:ltSheen 2.8s ease-in-out 1.2s infinite}
.lt-tilt3d{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s ease !important;will-change:transform}
.lt-maincards>*,.lt-page .lt-card{animation:ltRise .55s cubic-bezier(.2,.8,.2,1) backwards}
.lt-maincards>*:nth-child(2),.lt-page .lt-card:nth-child(2){animation-delay:.06s}
.lt-maincards>*:nth-child(3),.lt-page .lt-card:nth-child(3){animation-delay:.12s}
.lt-maincards>*:nth-child(4),.lt-page .lt-card:nth-child(4){animation-delay:.18s}
.lt-page .lt-card:nth-child(5){animation-delay:.24s}.lt-page .lt-card:nth-child(6){animation-delay:.3s}.lt-page .lt-card:nth-child(n+7){animation-delay:.34s}
.lt-speak:active{animation:ltWiggle .5s ease}
@keyframes ltSkyFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(12deg)}}
.lt-sky{animation:ltSkyFloat 6s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,255,255,.7))}
@keyframes ltDot{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-6px);opacity:1}}
.lt-dots span{display:inline-block;width:8px;height:8px;margin:0 3px;border-radius:50%;background:currentColor;animation:ltDot 1.1s ease-in-out infinite}
.lt-dots span:nth-child(2){animation-delay:.15s}.lt-dots span:nth-child(3){animation-delay:.3s}
@keyframes ltMood{0%{transform:scale(.4) rotate(-20deg)}60%{transform:scale(1.25) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
.lt-mood{animation:ltMood .5s cubic-bezier(.2,.8,.2,1)}
@keyframes ltRing{to{stroke-dashoffset:0}}
.lt-th-schoko [style*="background-color: rgb(255, 199, 44)"]{background-color:#D9A066 !important}.lt-th-schoko [style*="background-color: rgb(75, 42, 20)"]{background-color:#3B2416 !important}.lt-th-schoko circle[stroke="#FFC72C"]{stroke:#D9A066}.lt-th-schoko .lt-awning,.lt-th-schoko .lt-awning-edge{background-color:#D9A066 !important}
.lt-th-pistazie [style*="background-color: rgb(255, 199, 44)"]{background-color:#A9D18E !important}.lt-th-pistazie [style*="background-color: rgb(75, 42, 20)"]{background-color:#2F5D3A !important}.lt-th-pistazie circle[stroke="#FFC72C"]{stroke:#A9D18E}.lt-th-pistazie .lt-awning,.lt-th-pistazie .lt-awning-edge{background-color:#A9D18E !important}
.lt-th-erdbeere [style*="background-color: rgb(255, 199, 44)"]{background-color:#F6A5B8 !important}.lt-th-erdbeere [style*="background-color: rgb(75, 42, 20)"]{background-color:#9B2C4A !important}.lt-th-erdbeere circle[stroke="#FFC72C"]{stroke:#F6A5B8}.lt-th-erdbeere .lt-awning,.lt-th-erdbeere .lt-awning-edge{background-color:#F6A5B8 !important}
.lt-th-blaubeere [style*="background-color: rgb(255, 199, 44)"]{background-color:#9DB8F2 !important}.lt-th-blaubeere [style*="background-color: rgb(75, 42, 20)"]{background-color:#2F3F8A !important}.lt-th-blaubeere circle[stroke="#FFC72C"]{stroke:#9DB8F2}.lt-th-blaubeere .lt-awning,.lt-th-blaubeere .lt-awning-edge{background-color:#9DB8F2 !important}
.lt-th-vanille [style*="background-color: rgb(255, 199, 44)"]{background-color:#F7E3A1 !important}.lt-th-vanille [style*="background-color: rgb(75, 42, 20)"]{background-color:#6B4E16 !important}.lt-th-vanille circle[stroke="#FFC72C"]{stroke:#F7E3A1}.lt-th-vanille .lt-awning,.lt-th-vanille .lt-awning-edge{background-color:#F7E3A1 !important}
.lt-th-karamell [style*="background-color: rgb(255, 199, 44)"]{background-color:#E0A458 !important}.lt-th-karamell [style*="background-color: rgb(75, 42, 20)"]{background-color:#5A3310 !important}.lt-th-karamell circle[stroke="#FFC72C"]{stroke:#E0A458}.lt-th-karamell .lt-awning,.lt-th-karamell .lt-awning-edge{background-color:#E0A458 !important}
.lt-th-himbeere [style*="background-color: rgb(255, 199, 44)"]{background-color:#E8577A !important}.lt-th-himbeere [style*="background-color: rgb(75, 42, 20)"]{background-color:#7A1033 !important}.lt-th-himbeere circle[stroke="#FFC72C"]{stroke:#E8577A}.lt-th-himbeere .lt-awning,.lt-th-himbeere .lt-awning-edge{background-color:#E8577A !important}
.lt-th-minze [style*="background-color: rgb(255, 199, 44)"]{background-color:#9FE0C9 !important}.lt-th-minze [style*="background-color: rgb(75, 42, 20)"]{background-color:#1F6150 !important}.lt-th-minze circle[stroke="#FFC72C"]{stroke:#9FE0C9}.lt-th-minze .lt-awning,.lt-th-minze .lt-awning-edge{background-color:#9FE0C9 !important}
.lt-th-lavendel [style*="background-color: rgb(255, 199, 44)"]{background-color:#C7B4EC !important}.lt-th-lavendel [style*="background-color: rgb(75, 42, 20)"]{background-color:#4B3685 !important}.lt-th-lavendel circle[stroke="#FFC72C"]{stroke:#C7B4EC}.lt-th-lavendel .lt-awning,.lt-th-lavendel .lt-awning-edge{background-color:#C7B4EC !important}
.lt-th-zitrone [style*="background-color: rgb(255, 199, 44)"]{background-color:#FFF07A !important}.lt-th-zitrone [style*="background-color: rgb(75, 42, 20)"]{background-color:#7A6A00 !important}.lt-th-zitrone circle[stroke="#FFC72C"]{stroke:#FFF07A}.lt-th-zitrone .lt-awning,.lt-th-zitrone .lt-awning-edge{background-color:#FFF07A !important}
@keyframes ltFxGlitz{0%,100%{filter:drop-shadow(0 0 0 rgba(255,215,0,0))}50%{filter:drop-shadow(0 0 8px rgba(255,215,0,.95)) brightness(1.15)}}
.lt-fx-glitzer{display:inline-block;animation:ltFxGlitz 1.6s ease-in-out infinite}
@keyframes ltFxDreh{to{transform:rotate(360deg)}}
.lt-fx-dreh{display:inline-block;animation:ltFxDreh 3s linear infinite}
@keyframes ltFxHupf{0%,100%{transform:translateY(0)}30%{transform:translateY(-10px)}50%{transform:translateY(0)}65%{transform:translateY(-4px)}}
.lt-fx-hupf{display:inline-block;animation:ltFxHupf 1.4s ease-in-out infinite}
@keyframes ltFxPuls{0%,100%{transform:scale(1)}15%{transform:scale(1.18)}30%{transform:scale(1)}45%{transform:scale(1.12)}}
.lt-fx-puls{display:inline-block;animation:ltFxPuls 1.3s ease-in-out infinite}
@keyframes ltFxSchein{to{filter:hue-rotate(360deg) drop-shadow(0 0 6px rgba(255,120,200,.8))}}
.lt-fx-schein{display:inline-block;filter:drop-shadow(0 0 6px rgba(255,120,200,.8));animation:ltFxSchein 3s linear infinite}
@keyframes ltFxWackel{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}
.lt-fx-wackel{display:inline-block;animation:ltFxWackel 1.2s ease-in-out infinite}
.lt-shopfx{display:inline-block}
@keyframes ltDotPulse{0%{box-shadow:0 0 0 0 rgba(217,45,32,.6)}70%{box-shadow:0 0 0 10px rgba(217,45,32,0)}100%{box-shadow:0 0 0 0 rgba(217,45,32,0)}}
.lt-dot-pulse{animation:ltDotPulse 1.6s ease-out infinite}
.lt-tile{animation:ltTileIn .45s cubic-bezier(.2,.8,.2,1) backwards}
.lt-tiles .lt-tile:nth-child(2){animation-delay:.05s}.lt-tiles .lt-tile:nth-child(3){animation-delay:.1s}.lt-tiles .lt-tile:nth-child(4){animation-delay:.15s}.lt-tiles .lt-tile:nth-child(5){animation-delay:.2s}.lt-tiles .lt-tile:nth-child(6){animation-delay:.25s}.lt-tiles .lt-tile:nth-child(7){animation-delay:.3s}
@keyframes ltTileIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
.lt-fold summary::-webkit-details-marker{display:none}
.lt-fold-arrow{transition:transform .25s ease}
.lt-fold[open] .lt-fold-arrow{transform:rotate(180deg)}
.lt-fold[open]>div{animation:ltTileIn .35s ease backwards}
@keyframes ltWheelIdle{0%,100%{rotate:0}20%{rotate:-4deg}40%{rotate:3deg}60%{rotate:-1.5deg}80%{rotate:0}}
.lt-wheel-idle svg{animation:ltWheelIdle 2.6s ease-in-out infinite}
@keyframes ltBulb{0%,100%{opacity:1}50%{opacity:.25}}
.lt-bulb{animation:ltBulb .9s ease-in-out infinite}.lt-bulb-b{animation-delay:.45s}
@keyframes ltTick{0%,100%{transform:translateX(-50%) rotate(0)}50%{transform:translateX(-50%) rotate(-18deg)}}
.lt-wheel-tick{animation:ltTick .16s linear infinite}
@keyframes ltIconBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.lt-card>svg:first-child,.lt-card>span:first-child>svg,.lt-game .lt-game-ic{animation:ltIconBob 3.2s ease-in-out infinite}
.lt-card:nth-child(2n)>svg:first-child,.lt-card:nth-child(2n)>span:first-child>svg{animation-delay:-.8s}
.lt-card:nth-child(3n)>svg:first-child,.lt-card:nth-child(3n)>span:first-child>svg{animation-delay:-1.6s}
.lt-game{position:relative;overflow:hidden}
.lt-game::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0));transform:skewX(-18deg);animation:ltSheen 5.5s ease-in-out infinite;pointer-events:none}
.lt-game:nth-child(2n)::after{animation-delay:1.4s}.lt-game:nth-child(3n)::after{animation-delay:2.8s}
@keyframes ltSheen{0%,70%{left:-60%}100%{left:130%}}
@keyframes ltStar{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
.lt-star{position:absolute;color:#FFFFFF;text-shadow:0 0 6px rgba(255,255,255,.9);animation:ltStar 2.4s ease-in-out infinite;pointer-events:none}
@keyframes ltBrezelFall{from{transform:translateY(-60px) rotate(0)}to{transform:translateY(110vh) rotate(540deg)}}
.lt-brezel-rain{position:fixed;inset:0;pointer-events:none;z-index:1500;overflow:hidden}
.lt-brezel-rain span{position:absolute;top:0;font-size:34px;animation:ltBrezelFall linear forwards}
@keyframes ltDice{0%{transform:rotate(0) scale(.6)}50%{transform:rotate(360deg) scale(1.25)}100%{transform:rotate(720deg) scale(1)}}
.lt-dice{animation:ltDice .9s cubic-bezier(.3,.7,.3,1)}
@keyframes ltDeal{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg) scale(1.04)}}
.lt-deal{animation:ltDeal 2.2s ease-in-out infinite}
@keyframes ltEgg{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg) translateY(-3px)}}
.lt-osterei{animation:ltEgg 1.8s ease-in-out infinite;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25));opacity:.92}
.lt-osterei:hover{opacity:1}
@keyframes ltLoginToday{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(75,42,20,.35)}50%{transform:scale(1.07);box-shadow:0 0 0 6px rgba(75,42,20,0)}}
.lt-login-today{animation:ltLoginToday 1.4s ease-in-out infinite}
@keyframes ltLoginGot{0%{transform:scale(1)}40%{transform:scale(1.25) rotate(-6deg)}100%{transform:scale(1)}}
.lt-login-got{animation:ltLoginGot .6s ease}
@keyframes ltRingIn{from{stroke-dashoffset:var(--lt-c)}}
.lt-ring-arc{animation:ltRingIn 1.2s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes ltBarGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.lt-bar-grow{transform-origin:left center;animation:ltBarGrow .9s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes ltColGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.lt-col-grow{transform-origin:bottom center;animation:ltColGrow .7s cubic-bezier(.2,.8,.2,1) backwards}
.lt-stat-blob{position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.35);animation:ltStatBlob 9s ease-in-out infinite;pointer-events:none}
@keyframes ltStatBlob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,20px) scale(1.15)}}
.lt-shop-awning{height:44px;flex:0 0 44px;background:#FFC72C;background-image:linear-gradient(180deg,rgba(75,42,20,.12),rgba(75,42,20,0) 16px);position:relative;box-shadow:inset 0 -6px 10px rgba(0,0,0,.08);transform-origin:top center;animation:ltAwning .7s cubic-bezier(.16,1,.3,1) backwards}
.lt-shop-awning::after{content:"";position:absolute;left:0;right:0;bottom:-16px;height:16px;background:radial-gradient(circle at 16px 0,#FFC72C 16px,transparent 16.5px) 0 0/32px 16px repeat-x;filter:drop-shadow(0 3px 2px rgba(0,0,0,.12))}
@keyframes ltAwning{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.lt-shop-sign{margin-top:22px;padding:12px 18px;border-radius:16px;background:#1F140C;box-shadow:inset 0 1px 0 rgba(255,216,107,.18),0 12px 22px -12px rgba(31,20,12,.7);transform-origin:top center;animation:ltSignSwing 3.5s ease-in-out infinite;position:relative}
.lt-shop-sign::before,.lt-shop-sign::after{content:"";position:absolute;top:-22px;width:2px;height:22px;background:#4B2A14}
.lt-shop-sign::before{left:24px}.lt-shop-sign::after{right:24px}
@keyframes ltSignSwing{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
.lt-shop-bell{display:inline-block;transform-origin:50% 0;animation:ltBell .9s ease-in-out 2}
@keyframes ltBell{0%,100%{transform:rotate(0)}20%{transform:rotate(22deg)}40%{transform:rotate(-18deg)}60%{transform:rotate(10deg)}80%{transform:rotate(-6deg)}}
.lt-register{margin-top:22px;padding:10px 16px;border-radius:16px;background:#1F140C;border:none;box-shadow:inset 0 0 0 1.5px rgba(255,216,107,.25),0 12px 22px -12px rgba(31,20,12,.7);min-width:150px;animation:ltRegPop .45s ease}
@keyframes ltRegPop{0%{transform:scale(1)}40%{transform:scale(1.08) rotate(-2deg)}100%{transform:scale(1)}}
.lt-chalk{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border-radius:16px;border:8px solid #A0703F;background:#2F3B33;color:#F4F1E6;cursor:pointer;font-family:inherit;box-shadow:inset 0 0 30px rgba(0,0,0,.35),0 4px 0 #7A5230;text-shadow:0 0 1px rgba(255,255,255,.4)}
.lt-shelf-wrap{animation:ltTileIn .35s ease backwards}
.lt-shelf{background:transparent;padding:2px}
.lt-shop-pedestal{position:relative;display:inline-flex;align-items:center;justify-content:center}
.lt-shop-pedestal::after{content:"";position:absolute;left:50%;bottom:-6px;width:46px;height:8px;margin-left:-23px;border-radius:50%;background:radial-gradient(ellipse,rgba(31,20,12,.28),rgba(31,20,12,0) 70%);z-index:-1}
.lt-shop-emo{display:inline-block;filter:drop-shadow(0 6px 5px rgba(31,20,12,.25))}
.lt-shop-ball{display:inline-block;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#FFFFFF 0,rgba(255,255,255,.0) 28%),radial-gradient(circle at 50% 50%,var(--c) 0,var(--c) 55%,rgba(31,20,12,.55) 100%);box-shadow:0 8px 12px -6px rgba(31,20,12,.45),inset -6px -8px 12px rgba(31,20,12,.25)}
.lt-shop-item:not(:disabled):hover{transform:translateY(-3px)}
.lt-shop-item>*{position:relative;z-index:1}
.lt-shop-scroll>*{flex-shrink:0}
.lt-shop-off>*{opacity:.5}
.lt-shop-item{animation:ltShopIn .4s cubic-bezier(.2,.8,.2,1) backwards;transition:transform .15s}
.lt-shop-item:not(:disabled):hover .lt-shop-goods,.lt-shop-item:not(:disabled):active .lt-shop-goods{transform:translateY(-6px) scale(1.06)}
.lt-shop-goods{transition:transform .2s}
@keyframes ltShopIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
.lt-pricetag{position:relative;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:800;white-space:nowrap;font-variant-numeric:tabular-nums;box-shadow:0 4px 10px -6px rgba(31,20,12,.6)}
.lt-pricetag::before{display:none}
.lt-shopbon{position:absolute;right:18px;top:200px;z-index:5;width:230px;padding:12px 14px;background:#FFFFFF;color:#222;font-family:ui-monospace,Menlo,monospace;font-size:13px;box-shadow:0 10px 24px rgba(0,0,0,.3);clip-path:polygon(0 0,100% 0,100% 100%,92% 97%,84% 100%,76% 97%,68% 100%,60% 97%,52% 100%,44% 97%,36% 100%,28% 97%,20% 100%,12% 97%,4% 100%,0 97%);transform-origin:top center;animation:ltBon 3.2s ease forwards}
@keyframes ltBon{0%{transform:scaleY(0);opacity:1}15%{transform:scaleY(1)}85%{transform:scaleY(1);opacity:1}100%{transform:translateY(-20px) scaleY(1);opacity:0}}
.lt-kaching{position:absolute;left:50%;top:120px;z-index:6;transform:translateX(-50%);padding:8px 18px;border-radius:999px;background:#FFC72C;color:#2B170A;font-size:22px;font-weight:900;pointer-events:none;animation:ltKaching 1.4s ease forwards}
@keyframes ltKaching{0%{opacity:0;transform:translate(-50%,10px) scale(.6)}20%{opacity:1;transform:translate(-50%,-10px) scale(1.15)}70%{opacity:1;transform:translate(-50%,-24px) scale(1)}100%{opacity:0;transform:translate(-50%,-50px)}}
@keyframes ltCoinSpin{0%,100%{transform:rotateY(0)}50%{transform:rotateY(180deg)}}
.lt-coin{display:inline-block;animation:ltCoinSpin 2.4s ease-in-out infinite}
.lt-uebung .lt-card>span:first-child{animation:ltUebIn .6s cubic-bezier(.2,.8,.2,1) 1 backwards !important}
.lt-uebung .lt-card:nth-child(2)>span:first-child{animation-delay:.08s !important}.lt-uebung .lt-card:nth-child(3)>span:first-child{animation-delay:.16s !important}.lt-uebung .lt-card:nth-child(4)>span:first-child{animation-delay:.24s !important}.lt-uebung .lt-card:nth-child(5)>span:first-child{animation-delay:.32s !important}.lt-uebung .lt-card:nth-child(6)>span:first-child{animation-delay:.4s !important}.lt-uebung .lt-card:nth-child(7)>span:first-child{animation-delay:.48s !important}
.lt-uebung .lt-card:hover>span:first-child,.lt-uebung .lt-card:active>span:first-child,.lt-uebung .lt-card:focus-visible>span:first-child{animation:ltUebWiggle .6s ease 1 !important}
@keyframes ltUebIn{from{transform:scale(.4) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}
@keyframes ltUebWiggle{0%,100%{transform:rotate(0) scale(1)}30%{transform:rotate(-12deg) scale(1.15)}60%{transform:rotate(8deg) scale(1.1)}}
@keyframes ltFlicker{0%,100%{transform:scale(1) rotate(-2deg)}25%{transform:scale(1.08,1.12) rotate(2deg)}50%{transform:scale(.96,1.04) rotate(-1deg)}75%{transform:scale(1.05,1.1) rotate(1deg)}}.lt-emo-flicker{animation:ltFlicker 1.2s ease-in-out infinite;transform-origin:50% 90%}@keyframes ltFlipR{0%{transform:rotateY(-70deg);opacity:.3}100%{transform:rotateY(0);opacity:1}}@keyframes ltFlipL{0%{transform:rotateY(70deg);opacity:.3}100%{transform:rotateY(0);opacity:1}}.lt-flip-r{animation:ltFlipR .45s ease-out}.lt-flip-l{animation:ltFlipL .45s ease-out}
@keyframes ltStarPop{0%{transform:scale(0) rotate(-40deg);opacity:0}70%{transform:scale(1.25) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0)}}.lt-star-pop{display:inline-block;animation:ltStarPop .55s cubic-bezier(.16,1,.3,1) both}
html.lt-noanim *,html.lt-noanim *::before,html.lt-noanim *::after{animation:none !important;transition:none !important}
html.lt-noanim .lt-float,html.lt-noanim .lt-fx,html.lt-noanim .lt-kaching,html.lt-noanim .lt-brezel-rain,html.lt-noanim .lt-star,html.lt-noanim .lt-dot-pulse{display:none !important}
@keyframes ltOvertakeRun{0%{left:-90px}60%{left:calc(100% + 20px)}100%{left:calc(100% + 20px)}}
.lt-overtake-run{position:absolute;top:6px;left:-90px;font-size:28px;animation:ltOvertakeRun 2.6s ease-in-out infinite;pointer-events:none}
@keyframes ltOvertakeShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg) scale(1.1)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}}
.lt-overtake-ic{display:inline-block;animation:ltOvertakeShake 1.4s ease-in-out infinite}
.lt-overtake{animation:ltTileIn .5s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes ltGoldText{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.lt-goldname{background:linear-gradient(90deg,#8A6100,#C99A06,#E8C547,#C99A06,#8A6100);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent !important;-webkit-text-fill-color:transparent;animation:ltGoldText 3s linear infinite;-webkit-text-stroke:.6px rgba(43,23,10,.45);filter:drop-shadow(0 1px 0 rgba(43,23,10,.5))}
.lt-nc{background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent !important;-webkit-text-fill-color:transparent;animation:ltGoldText 3s linear infinite;-webkit-text-stroke:.6px rgba(43,23,10,.45);filter:drop-shadow(0 1px 0 rgba(43,23,10,.5))}
/* Die 3D-Schrift der Begrüßung (helle Schatten) schimmerte durch die Farbschrift und machte sie blass */
.lt-root .lt-goldname,.lt-root .lt-nc{text-shadow:none !important}
.lt-nc-gold{background-image:linear-gradient(90deg,#8A6100,#C99A06,#E8C547,#C99A06,#8A6100)}
.lt-nc-silber{background-image:linear-gradient(90deg,#374151,#6B7280,#A3AAB5,#6B7280,#374151)}
.lt-nc-rose{background-image:linear-gradient(90deg,#8E3B4B,#B9606F,#D88F9C,#B9606F,#8E3B4B)}
.lt-nc-smaragd{background-image:linear-gradient(90deg,#064E3B,#047857,#10B981,#047857,#064E3B)}
.lt-nc-saphir{background-image:linear-gradient(90deg,#1E3A8A,#1D4ED8,#3B82F6,#1D4ED8,#1E3A8A)}
.lt-nc-feuer{background-image:linear-gradient(90deg,#991B1B,#DC2626,#EA580C,#DC2626,#991B1B)}
.lt-nc-regenbogen{background-image:linear-gradient(90deg,#BE123C,#C2410C,#15803D,#1D4ED8,#6D28D9,#BE123C)}
.lt-nc-schoko{background-image:linear-gradient(90deg,#3B1F0E,#7B4A2A,#C08A5B,#7B4A2A,#3B1F0E)}
html.lt-pt_mk_croissant .lt-awning,html.lt-pt_mk_croissant .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%A5%90%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%A5%90%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_croissant{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%A5%90%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%A5%90%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_keks .lt-awning,html.lt-pt_mk_keks .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%AA%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%AA%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_keks{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%AA%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%AA%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_brezel .lt-awning,html.lt-pt_mk_brezel .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%A5%A8%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%A5%A8%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_brezel{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%A5%A8%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%A5%A8%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_donut .lt-awning,html.lt-pt_mk_donut .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%A9%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%A9%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_donut{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%A9%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%A9%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_kuchen .lt-awning,html.lt-pt_mk_kuchen .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%B0%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%B0%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_kuchen{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8D%B0%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8D%B0%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_weizen .lt-awning,html.lt-pt_mk_weizen .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8C%BE%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8C%BE%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_weizen{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%F0%9F%8C%BE%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%F0%9F%8C%BE%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_herz .lt-awning,html.lt-pt_mk_herz .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_herz{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_schnee .lt-awning,html.lt-pt_mk_schnee .lt-awning-edge{background-color:#FFC72C !important;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%E2%9D%84%EF%B8%8F%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%E2%9D%84%EF%B8%8F%3C/text%3E%3C/svg%3E") !important;background-size:90px 80px !important}
.lt-mk-sw-pt_mk_schnee{background-color:#FFC72C;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2790%27%20height%3D%2780%27%3E%3Ctext%20x%3D%2712%27%20y%3D%2738%27%20font-size%3D%2726%27%3E%E2%9D%84%EF%B8%8F%3C/text%3E%3Ctext%20x%3D%2755%27%20y%3D%2772%27%20font-size%3D%2720%27%3E%E2%9D%84%EF%B8%8F%3C/text%3E%3C/svg%3E");background-size:90px 80px}
html.lt-pt_mk_sterne .lt-awning,html.lt-pt_mk_sterne .lt-awning-edge{background-color:#1E2A4A !important;background-image:radial-gradient(circle at 20% 30%,#FFF 1.5px,transparent 2px),radial-gradient(circle at 70% 60%,#FFE27A 2px,transparent 2.5px),radial-gradient(circle at 45% 80%,#FFF 1px,transparent 1.5px),radial-gradient(circle at 85% 20%,#FFF 1.5px,transparent 2px) !important;background-size:120px 90px !important}
.lt-mk-sw-pt_mk_sterne{background-color:#1E2A4A;background-image:radial-gradient(circle at 20% 30%,#FFF 1.5px,transparent 2px),radial-gradient(circle at 70% 60%,#FFE27A 2px,transparent 2.5px),radial-gradient(circle at 45% 80%,#FFF 1px,transparent 1.5px),radial-gradient(circle at 85% 20%,#FFF 1.5px,transparent 2px);background-size:120px 90px}
html.lt-pt_mk_karo .lt-awning,html.lt-pt_mk_karo .lt-awning-edge{background-image:linear-gradient(45deg,rgba(75,42,20,.14) 25%,transparent 25%,transparent 75%,rgba(75,42,20,.14) 75%),linear-gradient(45deg,rgba(75,42,20,.14) 25%,transparent 25%,transparent 75%,rgba(75,42,20,.14) 75%) !important;background-size:44px 44px !important;background-position:0 0,22px 22px !important}
.lt-mk-sw-pt_mk_karo{background-image:linear-gradient(45deg,rgba(75,42,20,.14) 25%,transparent 25%,transparent 75%,rgba(75,42,20,.14) 75%),linear-gradient(45deg,rgba(75,42,20,.14) 25%,transparent 25%,transparent 75%,rgba(75,42,20,.14) 75%);background-size:44px 44px;background-position:0 0,22px 22px}
html.lt-pt_mk_schoko .lt-awning,html.lt-pt_mk_schoko .lt-awning-edge{background-color:#6B3E1F !important;background-image:repeating-linear-gradient(90deg,#6B3E1F 0 46px,#C08A5B 46px 92px) !important}
.lt-mk-sw-pt_mk_schoko{background-color:#6B3E1F;background-image:repeating-linear-gradient(90deg,#6B3E1F 0 46px,#C08A5B 46px 92px)}
html.lt-pt_mk_erdbeer .lt-awning,html.lt-pt_mk_erdbeer .lt-awning-edge{background-color:#F2667A !important;background-image:repeating-linear-gradient(90deg,#F2667A 0 46px,#FFFFFF 46px 92px) !important}
.lt-mk-sw-pt_mk_erdbeer{background-color:#F2667A;background-image:repeating-linear-gradient(90deg,#F2667A 0 46px,#FFFFFF 46px 92px)}
html.lt-pt_mk_minze .lt-awning,html.lt-pt_mk_minze .lt-awning-edge{background-color:#9FE0C9 !important;background-image:repeating-linear-gradient(90deg,#9FE0C9 0 46px,#FFFFFF 46px 92px) !important}
.lt-mk-sw-pt_mk_minze{background-color:#9FE0C9;background-image:repeating-linear-gradient(90deg,#9FE0C9 0 46px,#FFFFFF 46px 92px)}
html.lt-pt_mk_lavendel .lt-awning,html.lt-pt_mk_lavendel .lt-awning-edge{background-color:#C7B4EC !important;background-image:repeating-linear-gradient(90deg,#C7B4EC 0 46px,#FFFFFF 46px 92px) !important}
.lt-mk-sw-pt_mk_lavendel{background-color:#C7B4EC;background-image:repeating-linear-gradient(90deg,#C7B4EC 0 46px,#FFFFFF 46px 92px)}
html.lt-pt_mk_regenbogen .lt-awning,html.lt-pt_mk_regenbogen .lt-awning-edge{background-image:linear-gradient(90deg,#F87171,#FBBF24,#4ADE80,#60A5FA,#A78BFA) !important}
.lt-mk-sw-pt_mk_regenbogen{background-image:linear-gradient(90deg,#F87171,#FBBF24,#4ADE80,#60A5FA,#A78BFA)}
html.lt-pt_mk_nacht .lt-awning,html.lt-pt_mk_nacht .lt-awning-edge{background-color:#14213D !important;background-image:linear-gradient(180deg,#14213D,#2B3A67) !important}
html.lt-pt_mk_nacht .lt-awning-edge{background-image:none !important;background-color:#2B3A67 !important}
.lt-mk-sw-pt_mk_nacht{background-color:#14213D;background-image:linear-gradient(180deg,#14213D,#2B3A67)}
.lt-mk-swatch{display:inline-block;width:44px;height:34px;border-radius:8px;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,.2);background-color:#FFC72C;background-size:45px 40px}
.lt-schatz-item{transition:transform .15s}
.lt-schatz-item:hover{transform:translateY(-3px)}
@keyframes ltGoldShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.lt-meister-card{border:3px solid transparent !important;background:linear-gradient(#FFFDF4,#FFFDF4) padding-box,linear-gradient(90deg,#C9971C,#FFE27A,#B8860B,#FFE27A,#C9971C) border-box !important;background-size:auto,200% 100% !important;animation:ltGoldShine 4s linear infinite;box-shadow:0 0 18px rgba(201,151,28,.35)}
.lt-meister-chip{background:linear-gradient(90deg,#C9971C,#FFE27A,#B8860B,#FFE27A,#C9971C);background-size:200% 100%;color:#3A2600;animation:ltGoldShine 3s linear infinite;box-shadow:0 2px 8px rgba(201,151,28,.4)}
@keyframes ltSpin2{0%,70%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.lt-emo-spin2{display:inline-block;animation:ltSpin2 4s ease-in-out infinite}
.lt-game:nth-child(3n+1) .lt-game-ic{animation-name:ltCatEmo}.lt-game:nth-child(3n+2) .lt-game-ic{animation-name:ltDiceIdle}
@keyframes ltCatEmo{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-4px) rotate(-6deg)}60%{transform:translateY(0) rotate(4deg)}}
.lt-cat-emo{display:inline-block;animation:ltCatEmo 3s ease-in-out infinite}
@keyframes ltDiceIdle{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-20deg)}90%{transform:rotate(25deg)}95%{transform:rotate(-8deg)}}
.lt-dice-idle{animation:ltDiceIdle 3.5s ease-in-out infinite}
@keyframes ltMarch{to{background-position:0 12px}}
.lt-march{background-image:linear-gradient(180deg,#D9C9AE 50%,rgba(0,0,0,0) 50%);background-size:5px 12px;animation:ltMarch .8s linear infinite}
.lt-march-done{background-image:linear-gradient(180deg,#2F5D3A 50%,rgba(0,0,0,0) 50%)}
@keyframes ltPfadPop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
.lt-pfad-done{animation:ltPfadPop .45s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes ltRain{from{transform:translateY(-30px) rotate(12deg)}to{transform:translate(-40px,260px) rotate(12deg)}}
.lt-rain{position:absolute;top:0;width:2.5px;height:26px;border-radius:2px;background:linear-gradient(rgba(225,240,255,0),rgba(240,248,255,1));box-shadow:0 0 0 .5px rgba(30,50,80,.25),0 0 3px rgba(255,255,255,.6);animation:ltRain linear infinite;pointer-events:none;z-index:1}
.lt-rain-near{width:2.5px;height:32px}
.lt-rain-far{width:1.5px;height:18px;opacity:.7}
.lt-raincloud{position:absolute;left:-5%;right:-5%;top:-30%;height:75%;background:radial-gradient(ellipse at 15% 40%,rgba(70,80,95,.35),transparent 55%),radial-gradient(ellipse at 50% 30%,rgba(60,70,85,.4),transparent 55%),radial-gradient(ellipse at 85% 45%,rgba(70,80,95,.35),transparent 55%);pointer-events:none}
.lt-wx-wet{position:absolute;inset:0;background:repeating-linear-gradient(100deg,rgba(255,255,255,0) 0 18px,rgba(255,255,255,.06) 18px 20px);pointer-events:none}
@keyframes ltSnow{from{transform:translateY(-20px) translateX(0)}50%{transform:translateY(110px) translateX(10px)}to{transform:translateY(260px) translateX(-6px)}}
.lt-snow{position:absolute;top:0;color:#FFFFFF;text-shadow:0 0 4px rgba(60,80,110,.8),0 0 1px rgba(60,80,110,.9);z-index:1;animation:ltSnow linear infinite;pointer-events:none}
@keyframes ltCloud{from{transform:translateX(-120px)}to{transform:translateX(110vw)}}
.lt-cloud{position:absolute;left:0;font-size:44px;opacity:.95;filter:drop-shadow(0 2px 3px rgba(0,0,0,.2));animation:ltCloud linear infinite;pointer-events:none}
@keyframes ltFlash{0%,92%,100%{opacity:0}94%{opacity:.7}96%{opacity:0}97%{opacity:.5}}
.lt-flash{position:absolute;inset:0;background:#FFFFFF;animation:ltFlash 7s infinite;pointer-events:none}
@keyframes ltFigHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.lt-pfad-fig{animation:ltFigHop 1.2s ease-in-out infinite}
@keyframes ltPulseRing{0%{box-shadow:0 0 0 0 rgba(232,181,0,.6)}100%{box-shadow:0 0 0 14px rgba(232,181,0,0)}}
.lt-pfad-cur{animation:ltPulseRing 1.6s ease-out infinite}
.lt-sticker:hover{z-index:1}
/* ── Design-Feinschliff (Version 121) ── */
/* Ruhigere Bewegung: Symbole bewegen sich nur noch einmal beim Erscheinen, keine Dauer-Glanzstreifen */
.lt-page .lt-emo-bob,.lt-page .lt-emo-shake,.lt-page .lt-emo-twinkle,.lt-page .lt-emo-spin2,.lt-page .lt-cat-emo,.lt-page .lt-dice-idle,.lt-page .lt-game-ic,.lt-page .lt-emo-flicker{animation-iteration-count:1 !important}
.lt-card>svg:first-child,.lt-card>span:first-child>svg,.lt-game .lt-game-ic{animation:none}
.lt-game::after,.lt-fill::after{display:none}
.lt-coin{animation:none !important}
.lt-maincards>*,.lt-page .lt-card{animation:ltFadeUp .3s cubic-bezier(.16,1,.3,1) backwards !important}
.lt-fx>span{animation-duration:1.8s !important}
/* Punkte und Trinkgeld oben wie ein Kassendisplay */
.lt-root .lt-kasse{background:#1A0F07 !important;box-shadow:inset 0 2px 6px rgba(0,0,0,.55),0 0 0 1px rgba(255,199,44,.35);color:#FFD86B !important;font-family:'Courier Prime',ui-monospace,monospace;letter-spacing:.02em}
.lt-root .lt-kasse .lt-hide-mobile{color:#E8C27A !important}
/* Schrift: Überschriften ausgewogen umbrechen, nicht zu eng */
/* Hinkel-Schrift (wie der HINKEL-Schriftzug) für alle Überschriften, auch in Spielen und Bestenliste */
.lt-root [style*="Fredoka"],.lt-root [style*="Bricolage"]{font-family:'Bricolage Grotesque','Atkinson Hyperlegible',sans-serif !important;font-weight:750 !important;letter-spacing:-0.02em !important;font-optical-sizing:auto}
.lt-root h1,.lt-root h2,.lt-root h3{text-wrap:balance}
.lt-root h1{line-height:1.1 !important}
.lt-root h2{line-height:1.15 !important}
/* Begrüßung etwas dünner als die übrigen Überschriften */
.lt-root .lt-h1{font-family:'Bricolage Grotesque',sans-serif !important;font-weight:700 !important;letter-spacing:-0.025em !important}
/* Brotkorb fällt beim Öffnen der Startseite auf, das Küken guckt einmal hoch */
.lt-basket-hello svg{animation:ltBasketHello .8s cubic-bezier(.16,1,.3,1) .4s both}
@keyframes ltBasketHello{0%{transform:translateY(-16px) scale(.9);opacity:0}55%{transform:translateY(3px) scale(1.05);opacity:1}100%{transform:none}}
.lt-root img.lt-hero-kueken,.lt-root img.lt-hero-kueken.lt-loaded{animation:ltKuekenUp .7s cubic-bezier(.16,1,.3,1) .3s both,ltKuekenIdle 3.6s ease-in-out 1.1s infinite !important;transform-origin:50% 100%}
@keyframes ltKuekenIdle{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(-4deg)}}
.lt-cta-btn{position:relative;overflow:hidden}
.lt-cta-btn::after{content:'';position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:translateX(-140%) skewX(-20deg);animation:ltCtaSheen 7s ease-in-out 1.5s infinite;pointer-events:none}
@keyframes ltCtaSheen{0%,82%{transform:translateX(-140%) skewX(-20deg)}100%{transform:translateX(380%) skewX(-20deg)}}
.lt-dot-pulse{animation:ltDotPulse 2.6s ease-out infinite !important}
.lt-awning .lt-sway{animation:ltSway 6s ease-in-out infinite !important}
.lt-shop-sign{animation:ltSignSwing 6s ease-in-out infinite !important}
@keyframes ltKuekenUp{0%{transform:translateY(16px);opacity:0}60%{transform:translateY(-4px);opacity:1}100%{transform:none}}
.lt-hero-cta:active .lt-cta-btn{transform:translateY(3px);box-shadow:0 2px 0 #B98A0A !important}
/* Noch weniger Bewegung: nichts läuft dauerhaft */
.lt-bag-top,.lt-deal,.lt-wheel-idle svg,.lt-bulb,.lt-duel-badge,.lt-overtake-ic,.lt-login-today,.lt-osterei,.lt-pfad-fig,.lt-pfad-cur{animation:none !important}
.lt-dialog .lt-emo-bob,.lt-dialog .lt-emo-shake,.lt-dialog .lt-emo-twinkle,.lt-dialog [class^="lt-fx-"],.lt-root h1 [class^="lt-fx-"],.lt-root .lt-emo-bob,.lt-root .lt-emo-shake,.lt-root .lt-emo-twinkle,.lt-root .lt-emo-spin2{animation-iteration-count:1 !important}
.lt-card:hover{transform:none}
/* Hochwertigere Flächen: feine Ränder, einheitliche Ecken, weiche Tiefe statt dicker Kanten */
.lt-root [style*="border: 2px solid rgb(241, 227, 200)"],.lt-root [style*="border: 2px solid rgb(232, 213, 176)"]{border-width:1px !important;border-color:rgba(75,42,20,.12) !important}
.lt-root [style*="border-radius: 28px"],.lt-root [style*="border-radius: 26px"]{border-radius:22px !important}
.lt-root [style*="border-radius: 24px"],.lt-root [style*="border-radius: 22px"]{border-radius:18px !important}
.lt-page .lt-card:not(.lt-hero-cta),.lt-page .lt-menu,.lt-page .lt-herocard,.lt-page .lt-fold{box-shadow:0 1px 2px rgba(43,23,10,.05),0 8px 24px -14px rgba(43,23,10,.22) !important}
.lt-menu{border-color:rgba(75,42,20,.12) !important;border-width:1px !important}
.lt-root h2{letter-spacing:-0.02em}
.lt-root p{color:inherit}
.lt-bottomnav{box-shadow:0 -6px 20px -14px rgba(43,23,10,.35)}
/* Bestenliste: alle Wertungen sichtbar, nichts abgeschnitten */
.lt-root .sb-keylist{flex-wrap:wrap !important;overflow:visible !important}
/* Ladebildschirm: nur das Küken, es hüpft leicht */
.lt-root .lt-boot img.lt-boot-kueken{background:none !important;animation:ltKuekenHop .9s cubic-bezier(.3,0,.5,1) infinite !important}
@keyframes ltKuekenHop{0%,100%{transform:translateY(0)}45%{transform:translateY(-14px)}}
.lt-boot-bar{width:160px;height:6px;border-radius:6px;background:rgba(75,42,20,.15);overflow:hidden}
.lt-boot-bar i{display:block;width:40%;height:100%;border-radius:6px;background:#4B2A14;animation:ltBootBar 1.1s ease-in-out infinite}
@keyframes ltBootBar{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
/* Sichtbarer Fokus für Tastatur */
.lt-root button:focus-visible,.lt-root summary:focus-visible{outline:3px solid #C9971C;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.lt-root *{animation:none !important;transition:none !important}}
/* Das Glücksrad dreht sich immer, auch wenn Animationen ausgeschaltet sind, sonst sieht man keinen Dreh */
html .lt-root svg.lt-wheel-spin,html.lt-noanim svg.lt-wheel-spin,html.lt-noanim .lt-root svg.lt-wheel-spin{transition:transform 4.2s cubic-bezier(.15,.85,.2,1) !important}
@media (max-width:1050px){.lt-home-greet{display:contents !important}.lt-home>*{order:2}.lt-home-greet>div:first-child{order:0}.lt-home .lt-fact{order:0}.lt-home .lt-pod{order:1}.lt-home .lt-hero-wrap{order:1}.lt-home .lt-bake{order:1}.lt-home .lt-team{order:1}.lt-home .lt-herocard{order:2}.lt-hide-tab{display:none !important}.lt-only-tab{display:inline !important}.lt-headbtns>button{white-space:nowrap}.lt-herocard{flex:1 1 100% !important;max-width:none !important}}
@media (max-width:700px){
  .lt-root .lt-awning.lt-awning-sm{height:70px}.lt-root .lt-awning-sm .lt-logo{height:52px}
  .lt-dupnav{display:none !important}
  .lt-home-greet{display:contents !important}.lt-home>*{order:2}.lt-home-greet>div:first-child{order:0}.lt-home .lt-fact{order:0}.lt-home .lt-pod{order:1}.lt-home .lt-bake{order:1}.lt-home .lt-team{order:1}.lt-home .lt-hero-wrap{order:1}.lt-home .lt-herocard{order:2}
  .lt-ansturm-grid{grid-template-columns:repeat(4,1fr) !important;gap:6px !important}.lt-ansturm-grid button{padding:3px !important;border-radius:10px !important;min-width:0 !important}.lt-ansturm-grid span{font-size:11px !important;overflow-wrap:anywhere;hyphens:auto}
  .lt-ansturm-order{position:sticky;top:6px;z-index:5;background:#FFFFFF;padding:6px 0;margin:-6px 0}
  .lt-statchip{min-width:0 !important;padding:6px 8px !important;border-radius:12px !important}.lt-statchip>div:first-child{font-size:11px !important;letter-spacing:0 !important}.lt-statchip>div:last-child{font-size:22px !important}
  .lt-float-report{writing-mode:horizontal-tb !important;transform:none !important;top:auto !important;bottom:96px !important;right:8px !important;border-radius:999px !important;border:2px solid #E2D2B6 !important;padding:6px 12px !important;font-size:13px !important;box-shadow:0 4px 12px rgba(75,42,20,.18)}
  .lt-headbtns{gap:5px !important}
  .lt-headbtns>button{padding:0 9px !important;min-height:44px !important;font-size:15px !important;white-space:nowrap}
  .lt-desknav{display:none}
  .lt-bottomnav{display:grid}
  .lt-awning{height:96px}
  .lt-logo{height:70px}
  .lt-h1{font-size:33px}
  .lt-root{padding-bottom:116px !important}
  .lt-hide-mobile{display:none !important}
  .lt-only-mobile{display:flex}
  .lt-maincards{grid-template-columns:1fr !important}
  .lt-maincard{flex-direction:row !important;align-items:center !important;padding:18px !important;gap:16px !important}
  .lt-maincard .lt-mc-title{font-size:24px !important}
  .lt-maincard .lt-mc-icon{width:64px !important;height:64px !important;flex:0 0 64px}
  .lt-bon{width:100%;max-width:340px;font-size:16px}
  .lt-band{padding:22px !important}
  .lt-sticky-next{bottom:104px}
  .lt-float-report{top:auto !important;font-size:13px !important;padding:6px 12px !important}
  .lt-expl{scroll-margin-bottom:220px}
}

/* v131: Küken erzählt „Wusstest du?“ */
.lt-fact{display:flex;flex-direction:row-reverse;align-items:flex-start;gap:14px}
.lt-root img.lt-fact-kueken,.lt-root img.lt-fact-kueken.lt-loaded{flex:0 0 auto;width:72px;height:auto;margin-top:2px;cursor:pointer;background:none !important;filter:drop-shadow(0 4px 4px rgba(43,23,10,.22));animation:ltKuekenUp .7s cubic-bezier(.16,1,.3,1) .2s both !important}
.lt-root img.lt-fact-kueken.lt-talk{animation:ltTalk .26s ease-in-out infinite !important}
@keyframes ltTalk{0%,100%{transform:none}50%{transform:rotate(-5deg) translateY(-2px)}}
.lt-fact-bubble{position:relative;flex:1;min-width:0;padding:12px 16px 10px;border-radius:18px;background:#FFFFFF;box-shadow:0 1px 2px rgba(31,20,12,.05),0 10px 22px -14px rgba(31,20,12,.4)}
.lt-fact-bubble::before{content:"";position:absolute;right:-16px;top:16px;width:20px;height:18px;background:#FFFFFF;clip-path:polygon(0 0,100% 30%,0 100%)}
.lt-fact-from{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9A7206}
.lt-fact-text{margin-top:4px;font-size:17px;font-weight:700;line-height:1.4;min-height:48px;color:#1F140C}
.lt-fact-more{margin-top:2px;min-height:36px;padding:0;border:none;background:none;font:inherit;font-size:14px;font-weight:700;color:#7A6553;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
/* v131: Ausbilder-Tafel */
.lt-board{position:relative;margin-top:8px}
.lt-board-frame{position:relative;background:#232724;background-image:radial-gradient(ellipse at 18% 25%,rgba(255,255,255,.09),transparent 55%),radial-gradient(ellipse at 85% 80%,rgba(255,255,255,.05),transparent 50%);border:10px solid #8B5A2B;border-radius:12px;padding:16px 18px 30px;color:#F4F1E8;box-shadow:inset 0 0 0 2px #6B4220,inset 0 0 30px rgba(0,0,0,.45),0 14px 24px -14px rgba(31,20,12,.55)}
.lt-board-frame::before{content:"";position:absolute;inset:0;background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.025) 0 2px,transparent 2px 9px);pointer-events:none}
.lt-board-pin{position:absolute;top:-8px;left:50%;z-index:2;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#D92D20;box-shadow:inset -2px -2px 0 rgba(0,0,0,.25),0 2px 3px rgba(0,0,0,.4)}
.lt-board-ttl{position:relative;display:flex;align-items:center;gap:8px;font-family:'Caveat',cursive;font-weight:700;font-size:22px;color:#FFE38A;line-height:1}
.lt-board-ttl::after{content:"";flex:1;height:2px;background:rgba(255,227,138,.35);border-radius:2px}
.lt-board-txt{position:relative;display:block;margin-top:10px;font-family:'Caveat',cursive;font-weight:600;font-size:27px;line-height:1.15;color:#FFFFFF;white-space:pre-line;overflow-wrap:anywhere;text-shadow:0 0 1px rgba(255,255,255,.5);animation:ltChalkIn 1.4s ease .2s both}
@keyframes ltChalkIn{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.lt-board-sig{position:relative;display:block;margin-top:8px;text-align:right;font-family:'Caveat',cursive;font-size:21px;color:#CFE3D2}
.lt-board-sig small{font-size:16px;color:rgba(244,241,232,.65)}
.lt-board-img{position:relative;display:block;width:100%;max-height:300px;object-fit:cover;border-radius:6px;margin-top:10px;border:3px solid rgba(255,255,255,.85)}
.lt-board-ledge{position:absolute;left:-10px;right:-10px;bottom:-10px;height:12px;background:#6B4220;border-radius:0 0 8px 8px;box-shadow:0 3px 0 #4E2F16}
.lt-board-piece{position:absolute;bottom:10px;right:34px;width:30px;height:8px;border-radius:3px;background:#F4F1E8;transform:rotate(-6deg);box-shadow:inset -3px 0 0 #D8D2C4}
.lt-board-sponge{position:absolute;bottom:10px;left:26px;width:38px;height:13px;border-radius:3px;background:#5A3A22;box-shadow:inset 0 -5px 0 #C9B48A}
.lt-board-speak{position:relative;margin-top:6px}
/* v131: Statistik auf der Startseite */
.lt-st{padding:18px;border-radius:22px;background:#FFFFFF;box-shadow:0 1px 2px rgba(31,20,12,.05),0 8px 20px -14px rgba(31,20,12,.3)}
.lt-st-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.lt-st-kpi{padding:12px 12px 10px;border-radius:14px;background:#FBF6EC}
.lt-st-kpi b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.05}
.lt-st-kpi span{display:block;margin-top:2px;font-size:13px;color:#7A6553;line-height:1.25}
.lt-st-h{display:flex;justify-content:space-between;align-items:baseline;margin:18px 0 8px;font-size:13px;font-weight:800;color:#7A6553;letter-spacing:.08em;text-transform:uppercase}
.lt-st-h em{font-style:normal;letter-spacing:0;text-transform:none;color:#1F140C}
.lt-st-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;height:100px}
.lt-st-week>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px;height:100%}
.lt-st-week i{display:block;width:100%;max-width:30px;border-radius:7px 7px 3px 3px;background:#F1E4C8;transform-origin:bottom;animation:ltGrowY .7s cubic-bezier(.16,1,.3,1) both}
.lt-st-week i.on{background:#FFC72C;box-shadow:inset 0 -3px 0 rgba(185,138,10,.35)}
.lt-st-week i.today{background:#1F140C}
.lt-st-week span{font-size:13px;color:#7A6553;font-weight:700}
@keyframes ltGrowY{from{transform:scaleY(0)}to{transform:none}}
.lt-st-cats{display:flex;flex-direction:column;gap:10px}
.lt-st-cat{display:grid;grid-template-columns:96px minmax(0,1fr) 44px;align-items:center;gap:10px;font-size:15px}
.lt-st-bar{height:10px;border-radius:99px;background:#F3EBDB;overflow:hidden}
.lt-st-bar i{display:block;height:100%;border-radius:99px;transform-origin:left;animation:ltGrowX .9s cubic-bezier(.16,1,.3,1) .2s both}
@keyframes ltGrowX{from{transform:scaleX(0)}to{transform:none}}
.lt-st-cat b{text-align:right;font-variant-numeric:tabular-nums}
.lt-st-tip{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px;padding:10px 12px;border-radius:12px;background:#FFF3CF;font-size:15px;line-height:1.35}
.lt-st-tip span{flex:1 1 180px}
.lt-st-btn{min-height:44px;padding:0 16px;border:none;border-radius:12px;background:#1F140C;color:#FFD86B;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.lt-st-more{display:block;width:100%;margin-top:12px;min-height:46px;border-radius:12px;border:1px solid #E8DCC6;background:transparent;color:#4B2A14;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.lt-bon-stamp{position:absolute;right:20px;bottom:64px;padding:4px 8px;border:2px solid #D92D20;border-radius:6px;background:rgba(255,255,255,.85);color:#D92D20;font-weight:700;font-size:13px;letter-spacing:.06em;transform:rotate(12deg)}
.lt-bon-prog{height:12px;margin:4px 0 2px;border:1.5px solid #1F140C;padding:1.5px}
.lt-bon-prog i{display:block;height:100%;background:repeating-linear-gradient(90deg,#1F140C 0 6px,transparent 6px 8px)}
`;
