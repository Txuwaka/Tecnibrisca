const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const nodes=new Map(),timers=new Map(),storage=new Map();let seq=0;
function el(id=''){const node={id,children:[],dataset:{},style:{},textContent:'',innerHTML:'',disabled:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},remove(){},getBoundingClientRect(){return {left:10,top:20,width:44,height:61}},querySelector(selector){return selector.startsWith('[data-card=')?this.children.find(c=>selector.includes(c.dataset.card)):el()},scrollIntoView(){}};Object.defineProperties(node,{firstElementChild:{get(){return this.children[0]}},lastElementChild:{get(){return this.children.at(-1)}}});return node;}
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');for(const [,id]of html.matchAll(/id="([^"]+)"/g))nodes.set(id,el(id));
const document={getElementById(id){assert(nodes.has(id),'Unknown DOM id '+id);return nodes.get(id)},createElement:()=>el(),body:el(),addEventListener(){}};
const context={console,document,window:{matchMedia(){return {matches:true}}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},setTimeout(fn){timers.set(++seq,fn);return seq},clearTimeout(id){timers.delete(id)}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../rules.js'),'utf8'),context);
const source=fs.readFileSync(path.join(__dirname,'../brisca.js'),'utf8').replace(/\}\)\(\);\s*$/,'globalThis.test={get game(){return game},get pending(){return pending},card,restart,play,exchange,drive,render};})();');vm.runInContext(source,context);const T=context.test;
async function tick(){const item=timers.entries().next().value;if(item){timers.delete(item[0]);item[1]();}await Promise.resolve();await Promise.resolve();await Promise.resolve();}
(async()=>{
 assert.equal(nodes.get('btn-tips').textContent,'Consejos OFF');nodes.get('btn-tips').onclick();assert.equal(storage.get('tecnibrisca-consejos'),'true');nodes.get('btn-tips').onclick();assert.equal(storage.get('tecnibrisca-consejos'),'false');nodes.get('btn-sound').onclick();assert.equal(storage.get('tecnibrisca-sonido'),'false');nodes.get('volume').oninput({target:{value:'25'}});assert.equal(storage.get('tecnibrisca-volumen'),'25');
 for(const suit of ['Oros','Copas','Espadas','Bastos'])for(let n=1;n<=7;n++)assert.equal((T.card({numero:n,palo:suit}).innerHTML.match(/class="pip"/g)||[]).length,n);
 for(let n of[10,11,12])assert(T.card({numero:n,palo:'Espadas'}).innerHTML.includes('figure-image'));
 let completed=0;
 for(let i=0;i<4000&&completed<5;i++){
  const g=T.game;
  if(g.result&&!T.pending){assert.equal(nodes.get('round-result').hidden,false);completed++;T.restart(g.stage==='match-over');}
  else if(g.actor==='jugador1'&&!T.pending){if(g.stage==='playing'){const choice=nodes.get('cards-1').children.find(c=>!c.disabled);assert(choice);choice.onclick();assert(!nodes.get('actions').children[0].disabled);nodes.get('actions').children[0].onclick();}else if(g.stage==='exchange'){nodes.get('actions').children[0].onclick();}}
  await tick();
 }
 assert.equal(completed,5);
 // Old async plays cannot mutate a replacement game.
 T.restart();timers.clear();T.game.actor='jugador1';T.render();const c=T.game.hands.jugador1[0];const promise=T.play('jugador1',c.palo+'-'+c.numero);T.restart();const replacement=T.game;await promise;assert.equal(T.game,replacement);assert.equal(T.game.trick.length,0);assert.equal(T.pending,false);
 console.log('OK: interfaz DOM, cantidades 1–7, figuras, ajustes persistentes, cinco manos por botones y reinicio durante jugada. No sustituye una prueba visual en navegador.');
})().catch(e=>{console.error(e);process.exitCode=1});
