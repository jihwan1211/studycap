type CapsuleRoomProps = { opening: number; brightness: number; drawerOpen: boolean };
export default function CapsuleRoom({opening, brightness, drawerOpen}: CapsuleRoomProps) { return (<svg id="room" viewBox="0 0 800 760" role="img" aria-labelledby="room-title room-desc"><title id="room-title">1인 스터디 캡슐 내부 예시</title><desc id="room-desc">책상, 의자, 조명, 서랍이 있는 독립된 공간. 아래 컨트롤로 조명과 수납을 체험할 수 있습니다.</desc>
<defs>
<linearGradient id="outer" x2="1" y2="1"><stop stopColor="#fafbf8"/><stop offset="1" stopColor="#8b9490"/></linearGradient>
<linearGradient id="back" x2="0" y2="1"><stop stopColor="#5c665d"/><stop offset="1" stopColor="#a4ac97"/></linearGradient>
<linearGradient id="side"><stop stopColor="#aab19f"/><stop offset="1" stopColor="#637061"/></linearGradient>
<linearGradient id="wood" x2="0" y2="1"><stop stopColor="#dfc8a3"/><stop offset="1" stopColor="#a88d68"/></linearGradient>
<linearGradient id="doorfill"><stop stopColor="#8a9788"/><stop offset="1" stopColor="#536451"/></linearGradient>
<radialGradient id="light"><stop stopColor="var(--light-color)" stopOpacity=".8"/><stop offset="1" stopColor="var(--light-color)" stopOpacity="0"/></radialGradient>
<filter id="shadow"><feGaussianBlur stdDeviation="14"/></filter><filter id="glow"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
<ellipse cx="406" cy="695" rx="264" ry="30" fill="#000" opacity=".45" filter="url(#shadow)"/>

<path d="M145 140 Q145 112 173 108 L538 65 Q563 63 582 77 L695 155 L695 597 Q695 623 671 635 L331 728 Q310 733 292 721 L145 620Z" fill="url(#outer)"/>
<path d="M174 153 L532 110 L532 518 L174 606Z" fill="url(#back)"/>
<path d="M532 110 L664 181 L664 608 L532 518Z" fill="url(#side)"/>
<path d="M174 606 L532 518 L664 608 L318 699Z" fill="#a69880"/>
<path d="M174 153 L318 234 L664 181 L532 110Z" fill="#d9ddcf"/>
<g stroke="#414e41" opacity=".23" strokeWidth="2"><path d="M218 148V594 M262 142V583 M306 137V572 M350 132V561 M394 126V551 M438 121V540 M482 116V529"/></g>
<g id="light-wash" style={{opacity: brightness / 100}}><ellipse cx="429" cy="345" rx="230" ry="220" fill="url(#light)"/><path d="M222 164L509 128" stroke="var(--light-color)" strokeWidth="15" filter="url(#glow)"/><path d="M222 164L509 128" stroke="var(--light-color)" strokeWidth="5" strokeLinecap="round"/></g>

<path d="M211 287L497 246L535 268L248 313Z" fill="url(#wood)"/><path d="M248 313L535 268V278L248 324Z" fill="#a98c68"/>
<g transform="translate(280 247) rotate(-8)"><rect width="16" height="48" rx="2" fill="#e4d9c6"/><rect x="19" y="-8" width="12" height="56" rx="2" fill="#8eac93"/><rect x="34" y="5" width="18" height="43" rx="2" fill="#3d5049"/></g>
<path d="M447 252l-5-33h29l-5 30Z" fill="#d8d6c7"/><path d="M457 218Q432 195 442 184Q461 190 457 218M457 213Q477 183 484 193Q481 213 457 213" fill="#4b7054"/>

<path d="M205 406L529 352L625 416L299 480Z" fill="url(#wood)"/><path d="M299 480L625 416V433L299 497Z" fill="#b99a73"/><path d="M205 406L299 480V497L205 422Z" fill="#99805f"/>
<path d="M224 424V592L239 588V436M600 439V609L614 605V435" stroke="#b3b4a4" strokeWidth="10"/>

<path d="M335 410L424 394L471 425L380 444Z" fill="#f2eee1"/><path d="M380 402L425 434" stroke="#c7c2b2"/><path d="M347 415L375 409M354 422L382 416M402 410L428 405" stroke="#c8c6ba" strokeWidth="2"/>
<path d="M451 375L445 308Q444 302 451 301L518 291Q524 290 525 296L532 361Z" fill="#293833"/><path d="M456 364L451 312L518 302L523 354Z" fill="#8fa59a"/><path d="M451 375L532 361L552 373L473 388Z" fill="#b5bfb5"/>
<ellipse cx="292" cy="402" rx="16" ry="6" fill="#6d6655" opacity=".3"/><path d="M279 374V398Q293 409 305 395V371Z" fill="#edf0e7"/><ellipse cx="292" cy="372" rx="13" ry="5" fill="#b7c2b2"/>

<path d="M510 475L591 458V575L510 596Z" fill="#657161"/><path d="M510 475L480 454V571L510 596Z" fill="#84907c"/>
<g id="drawer" className={drawerOpen ? "open" : undefined}><path d="M510 478L589 461L563 441L484 458Z" fill="#333e32"/><path d="M510 478L589 461V521L510 541Z" fill="#b5bca9"/><path d="M510 478L484 458V518L510 541Z" fill="#929e89"/><path d="M538 498L563 492" stroke="#596551" strokeWidth="5" strokeLinecap="round"/></g>
<path d="M514 550L584 532" stroke="#454f42" strokeWidth="2"/>

<path d="M401 585V653M401 641L354 666M401 641L449 664M401 641L408 681" stroke="#333c36" strokeWidth="9" strokeLinecap="round"/>
<path d="M338 568Q383 544 451 555L476 574Q474 599 410 612Q364 617 338 593Z" fill="#4e6259"/>
<path d="M338 568Q343 526 328 478Q326 458 349 453L407 442Q428 442 435 465L451 555Q399 583 338 568" fill="#354d43"/>
<path d="M346 474L411 460M352 493L417 479M358 512L422 499M362 532L427 519" stroke="#607569" strokeWidth="3" opacity=".5"/>

<path d="M174 153L318 234L664 181" fill="none" stroke="#e1e5d9" strokeWidth="18" strokeLinejoin="round"/>
<path d="M318 234V699L664 608V181" fill="none" stroke="#e1e5d9" strokeWidth="16" strokeLinejoin="round"/>
<g id="door" style={{transform: `skewY(${-opening * 12}deg) scaleX(${1 - opening * .98})`, opacity: 1 - opening * .6}}><path d="M324 245L654 194V599L324 685Z" fill="url(#doorfill)"/><path d="M345 267L632 221V577L345 651Z" fill="none" stroke="#acb8a2" strokeOpacity=".35" strokeWidth="2"/><path d="M604 382V438" stroke="#e7eadf" strokeWidth="7" strokeLinecap="round"/><text x="463" y="354" fill="#dfe5d7" fontSize="17" letterSpacing="7" transform="rotate(-10 463 354)">STUDYCAP</text><text x="474" y="388" fill="#c8d2bf" fontSize="12" letterSpacing="3" transform="rotate(-10 474 388)">JUST FOR YOU</text></g>
</svg>); }
