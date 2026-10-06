'use strict';
// Brisca por parejas: reglas puras. La interfaz y la IA no pueden saltarse las jugadas legales.
const BriscaRules=(()=>{
 const ids=['jugador1','jugador4','jugador3','jugador2'];
 const sides={jugador1:'nosotros',jugador3:'nosotros',jugador4:'ellos',jugador2:'ellos'};
 const suits=['Oros','Copas','Espadas','Bastos'];
 const ranks=[2,4,5,6,7,10,11,12,3,1],values={1:11,3:10,12:4,11:3,10:2};
 const key=c=>c.palo+'-'+c.numero,points=c=>values[c.numero]||0,strength=c=>ranks.indexOf(c.numero);
 const next=id=>ids[(ids.indexOf(id)+1)%4],order=id=>ids.map((_,i)=>ids[(ids.indexOf(id)+i)%4]);
 const deck=()=>suits.flatMap(palo=>ranks.map(numero=>({palo,numero})));
 function beats(a,b,trump){if(a.palo===b.palo)return strength(a)>strength(b);return a.palo===trump&&b.palo!==trump;}
 function winner(trick,trump){return trick.reduce((best,play)=>!best||beats(play.card,best.card,trump)?play:best,null);}
 function legal(hand){return hand.slice();}
 function pick(hand,trick,trump,id){
  const top=winner(trick,trump),cost=c=>points(c)*3+strength(c)+(c.palo===trump?18:0),sorted=hand.slice().sort((a,b)=>cost(a)-cost(b));
  if(!top)return sorted[0];
  const wins=sorted.filter(c=>beats(c,top.card,trump));
  if(sides[top.id]===sides[id]){const feed=hand.filter(c=>!beats(c,top.card,trump)&&c.palo!==trump);if(trick.length===3&&feed.length)return feed.sort((a,b)=>points(b)-points(a))[0];return sorted[0];}
  const bounty=trick.reduce((n,p)=>n+points(p.card),0);
  return bounty>=5&&wins.length?wins[0]:sorted[0];
 }
 class Game{
  constructor(random=Math.random){this.random=random;this.match={nosotros:0,ellos:0};this.handNo=0;this.dealer=ids[Math.floor(random()*4)];this.deal();}
  deal(){
   const cards=deck();for(let i=cards.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
   this.handNo++;this.mano=next(this.dealer);this.actor=this.mano;this.hands=Object.fromEntries(ids.map(id=>[id,[]]));
   for(let r=0;r<3;r++)for(const id of order(this.mano))this.hands[id].push(cards.pop());
   this.pinta=cards.pop();this.trump=this.pinta.palo;this.trumpCard={...this.pinta};this.stock=cards;
   this.stage='playing';this.trick=[];this.trickNo=1;this.lastWinner=null;this.nextLeader=null;this.drawQueue=[];
   this.captured={nosotros:[],ellos:[]};this.scores={nosotros:0,ellos:0};this.history=[];this.calls={};this.result=null;this.exchangeLog=[];
  }
  remaining(){return this.stock.length+(this.pinta?1:0);}
  legal(id){return this.stage==='playing'&&id===this.actor?this.hands[id].slice():[];}
  play(id,cardKey){
   if(!this.legal(id).some(c=>key(c)===cardKey))return false;
   const i=this.hands[id].findIndex(c=>key(c)===cardKey),card=this.hands[id].splice(i,1)[0];this.trick.push({id,card});this.calls[id]=card.numero+' de '+card.palo;
   if(this.trick.length===4){this.stage='trick-complete';this.actor=null;}else this.actor=next(id);return true;
  }
  resolve(){
   if(this.stage!=='trick-complete')return false;
   const win=winner(this.trick,this.trump),side=sides[win.id],earned=this.trick.reduce((n,p)=>n+points(p.card),0);
   this.captured[side].push(this.trick.slice());this.scores[side]+=earned;this.lastWinner=win.id;this.nextLeader=win.id;
   this.history.push({number:this.trickNo,winner:win.id,points:earned,plays:this.trick.slice()});this.trick=[];this.calls[win.id]='¡BAZA! +'+earned;
   if(this.trickNo===10){this.finish();return true;}
   if(this.remaining()){this.stage='exchange';this.actor=win.id;if(!this.exchangeCard(win.id))this.beginDraw();}
   else this.nextTrick();return true;
  }
  exchangeCard(id){
   if(this.stage!=='exchange'||id!==this.actor||!this.pinta)return null;
   const n=strength(this.pinta)>strength({numero:7})?7:2;
   if(this.pinta.numero===2)return null;
   return this.hands[id].find(c=>c.palo===this.trump&&c.numero===n)||null;
  }
  exchange(id){const offered=this.exchangeCard(id);if(!offered)return false;const i=this.hands[id].indexOf(offered),taken=this.pinta;this.hands[id][i]=taken;this.pinta=offered;this.exchangeLog.push({id,offered,taken});this.calls[id]='¡CAMBIO EL '+offered.numero+'!';this.beginDraw();return true;}
  skipExchange(id){if(this.stage!=='exchange'||this.actor!==id)return false;this.beginDraw();return true;}
  beginDraw(){this.stage='drawing';this.drawQueue=order(this.nextLeader);this.actor=null;}
  drawOne(){
   if(this.stage!=='drawing'||!this.drawQueue.length)return null;
   const id=this.drawQueue.shift();let card;if(this.stock.length)card=this.stock.pop();else{card=this.pinta;this.pinta=null;}
   if(!card)throw Error('Monte agotado antes de terminar el robo');this.hands[id].push(card);
   if(!this.drawQueue.length)this.nextTrick();return {id,card};
  }
  nextTrick(){this.trickNo++;this.stage='playing';this.actor=this.nextLeader;this.calls={};}
  finish(){if(this.result)return;const tie=this.scores.nosotros===this.scores.ellos,side=tie?null:this.scores.nosotros>this.scores.ellos?'nosotros':'ellos';this.result={side,tie};if(side)this.match[side]++;this.stage=side&&this.match[side]>=3?'match-over':'hand-over';this.actor=null;}
  nextHand(){if(this.stage!=='hand-over')return false;this.dealer=next(this.dealer);this.deal();return true;}
 }
 return {ids,sides,suits,ranks,key,points,strength,next,order,deck,beats,winner,legal,pick,Game};
})();
if(typeof module!=='undefined')module.exports=BriscaRules;
