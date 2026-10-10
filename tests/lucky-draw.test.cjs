const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start = html.indexOf('  const SHAPES = [');
const end = html.indexOf('  function renderBoard(',start);
assert(start >= 0 && end > start,'Luck engine missing');
const code=html.slice(start,end);
const ai=new Function('const N=8,PALETTE=[{}];\n'+code+'\nfunction renderTray(){}\nreturn {check(b){board=b;refillPieces();const m=maskBoard(),set=pieces.map(specFromPiece),plan=assessPack(set,m,8);const clear=SHAPES.some(spec=>spec.places.some(spot=>{const move=simulateMaskMove(m,spot);return move && move.lines>0}));return {plan,clear}}}')();
let total=0,direct=0,successful=0;
function check(board, label){
 const {plan,clear}=ai.check(board);
 assert(plan.finish,label+': all three pieces should be playable');
 assert(plan.canStart>=2,label+': too few first moves');
 if(clear){direct++;assert(plan.directClear>0,label+': missed an immediate clear');}
 if(plan.clears>0)successful++;
 total++;
}
check(Array(64).fill(null),'initial empty board');
const almostFull=Array(64).fill(null);for(let i=0;i<7;i++)almostFull[i]=1;
check(almostFull,'nearly full row');
for(const density of [0,.07,.14,.22,.3,.4,.5,.62]){
 for(let j=0;j<12;j++){
  const b=Array.from({length:64},()=>Math.random()<density?1:null);
  check(b,'density '+density+' sample '+j);
 }
}
console.log('Lucky Draw: '+total+' boards checked, '+direct+' immediate clears served, '+successful+' packs with a three-piece clear path.');
