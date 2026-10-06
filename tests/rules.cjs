const assert=require('node:assert/strict'),R=require('../rules.js');
const c=(numero,palo='Oros')=>({numero,palo}),p=(id,numero,palo)=>({id,card:c(numero,palo)});
assert.equal(R.deck().length,40);assert.equal(new Set(R.deck().map(R.key)).size,40);assert.equal(R.deck().reduce((n,c)=>n+R.points(c),0),120);
assert(R.beats(c(1),c(3),'Copas'));assert(!R.beats(c(2),c(12),'Copas'));assert(R.beats(c(2,'Copas'),c(1),'Copas'));
assert.equal(R.winner([p('jugador1',2,'Oros'),p('jugador4',1,'Bastos')],'Copas').id,'jugador1');
assert.equal(R.legal([c(1),c(2,'Bastos'),c(7,'Copas')],[p('jugador1',12,'Oros')],'Copas').length,3);
let g=new R.Game();assert(Object.values(g.hands).every(h=>h.length===3));assert.equal(g.remaining(),28);assert.equal(g.stock.length,27);assert(!g.play(R.next(g.actor),R.key(g.hands[R.next(g.actor)][0])));assert(!g.resolve());assert.equal(g.drawOne(),null);assert(!g.exchange(g.actor));
for(const n of [1,3,12,11,10,7,6,5,4,2]){g=new R.Game();g.stage='exchange';g.actor='jugador1';g.nextLeader='jugador1';g.trump='Oros';g.pinta=c(n);g.hands.jugador1=[c(n>7||n===1||n===3?7:2),c(6,'Copas')];const e=g.exchangeCard('jugador1');assert.equal(!!e,n!==2);assert(!g.exchange('jugador3'));if(e){const offered=R.key(e);assert(g.exchange('jugador1'));assert.equal(R.key(g.pinta),offered);assert(g.hands.jugador1.some(x=>x.numero===n));assert(!g.exchange('jugador1'));assert.equal(g.stage,'drawing');}}
g=new R.Game();g.stage='exchange';g.actor='jugador1';g.nextLeader='jugador1';assert(g.skipExchange('jugador1'));assert.equal(g.stage,'drawing');
g=new R.Game();g.scores={nosotros:60,ellos:60};g.finish();assert(g.result.tie);assert.equal(g.result.side,null);assert.deepEqual(g.match,{nosotros:0,ellos:0});g.finish();assert.deepEqual(g.match,{nosotros:0,ellos:0});
let hands=0,swaps=0,ties=0;
function conservation(g){const cards=[...Object.values(g.hands).flat(),...g.stock,...(g.pinta?[g.pinta]:[]),...g.trick.map(p=>p.card),...Object.values(g.captured).flat(2).map(p=>p.card)];assert.equal(cards.length,40);assert.equal(new Set(cards.map(R.key)).size,40);}
for(let seed=1;seed<=150;seed++){
 let s=seed;g=new R.Game(()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296));let guard=0;
 while(g.stage!=='match-over'){
  assert(++guard<30);const oldDealer=g.dealer;let steps=0,draws=0;
  while(!g.result){assert(++steps<150);conservation(g);
   if(g.stage==='playing'){const id=g.actor;assert.equal(g.legal(id).length,g.hands[id].length);const card=R.pick(g.hands[id],g.trick,g.trump,id);assert(g.play(id,R.key(card)));assert(!g.play(id,R.key(card)));}
   else if(g.stage==='trick-complete'){assert(g.resolve());assert(!g.resolve());}
   else if(g.stage==='exchange'){assert(g.exchange(g.actor));swaps++;}
   else if(g.stage==='drawing'){const expected=g.drawQueue[0],last=g.remaining()===1?R.key(g.pinta):null;const d=g.drawOne();assert.equal(d.id,expected);if(last)assert.equal(R.key(d.card),last);draws++;}
   else throw Error(g.stage);
  }
  conservation(g);hands++;if(g.result.tie)ties++;assert.equal(draws,28);assert.equal(g.history.length,10);assert.equal(g.scores.nosotros+g.scores.ellos,120);assert.equal(g.remaining(),0);assert(Object.values(g.hands).every(h=>h.length===0));if(g.stage==='hand-over'){assert(g.nextHand());assert.equal(g.dealer,R.next(oldDealer));}
 }
 assert.equal(Math.max(...Object.values(g.match)),3);
}
console.log(`OK: ${hands} manos / 150 partidas; ${swaps} cambios; ${ties} empates; 40 cartas únicas, 120 puntos, robo ganador primero, pinta última, turnos libres.`);
