const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() { this.dataset={}; this.attrs={}; this.style={}; this.events={}; this.value=''; this.classList={add(){},remove(){}}; }
  addEventListener(k,f){(this.events[k] ||= []).push(f);}
  emit(k,e={}){for(const f of this.events[k]||[])f(e);}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k];}
  removeAttribute(k){delete this.attrs[k];}
  getBoundingClientRect(){return {left:0,top:0,width:330,height:390};}
  setPointerCapture(id){this.capture=id;}
  hasPointerCapture(id){return this.capture===id;}
  releasePointerCapture(){this.capture=null;}
  contains(el){return el===nodes['#username']||el===nodes['#password'];}
  focus(){doc.activeElement=this;}
}
const selectors=['.lamp-stage','#pull-handle','.cord','.shade-motion','.face','.login-card','#username','#password','.toast','#login-form','.forgot-button','#date'];
const nodes=Object.fromEntries(selectors.map(s=>[s,new Element()]));
const root=new Element(),doc=new Element(); doc.documentElement=root;
doc.querySelector=s=>nodes[s];
const eyes=[new Element(),new Element()],pupils=[new Element(),new Element()];
doc.querySelectorAll=s=>s==='.eye'?eyes:pupils;
let now=0,next;
const reduced={matches:false};
vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../lamp.js'),'utf8'),{document:doc,matchMedia:()=>reduced,performance:{now:()=>now},requestAnimationFrame:f=>{next=f;return 1},cancelAnimationFrame(){},Intl,Date});
function tick(ms){const end=now+ms;while(now<end){now+=16;next(now);}}
const handle=nodes['#pull-handle'];
function drag(dy,cancel=false){const e={isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100};handle.emit('pointerdown',e);handle.emit('pointermove',{...e,clientY:100+dy});handle.emit(cancel?'pointercancel':'pointerup',{...e,clientY:100+dy});if(!cancel)handle.emit('click',{detail:1});tick(1000);}
assert.equal(root.dataset.on,'true');
drag(60);assert.equal(root.dataset.on,'false','drag toggles exactly once');assert.equal(nodes['.login-card'].inert,true);
assert.match(nodes['.cord'].attrs.d,/207 288$/,'spring returns to resting position');
drag(12);assert.equal(root.dataset.on,'false','short tug must not toggle');
drag(60,true);assert.equal(root.dataset.on,'false','canceled tug must not toggle');
handle.emit('click',{detail:0});tick(1000);assert.equal(root.dataset.on,'true');assert.equal(root.dataset.theme,'cool');
assert.equal(nodes['.login-card'].inert,false);
for(const expected of ['rose','mint','lavender','pink','teal','lime','peach','cherry','gold','ice','warm']) {
  handle.emit('click',{detail:1});
  assert.equal(root.dataset.on,'false');
  handle.emit('click',{detail:1});tick(100);
  assert.equal(root.dataset.on,'true');
  assert.equal(root.dataset.theme,expected,'All twelve palettes cycle and wrap');
}
doc.activeElement=nodes['#password'];tick(100);assert.equal(root.dataset.expression,'password');
assert.match(pupils[0].style.transform,/translate\(-/,'look away when entering password');
nodes['#login-form'].emit('submit',{preventDefault(){}});tick(100);assert.equal(root.dataset.expression,'error');
assert.equal(nodes['#username'].attrs['aria-invalid'],'true');tick(2000);assert.notEqual(root.dataset.expression,'error');
reduced.matches=true;handle.emit('click',{detail:1});tick(100);assert.equal(handle.style.transform,'translate(0px,0px)');
for(const el of [...Object.values(nodes),...eyes,...pupils])for(const v of [...Object.values(el.style),...Object.values(el.attrs)])assert.ok(!/NaN|Infinity/.test(String(v)));
console.log('PASS: full/short/canceled drags, one toggle per release, spring recovery, keyboard, theme cycle, form privacy, validation, reduced motion');
