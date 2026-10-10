/** Offline PNG generator for SnapShift's 1024x1024 opaque iOS icon. */
import { deflateSync } from 'node:zlib';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const n=1024;
const rgba=Buffer.alloc(n*(n*4+1));
const colors=[[85,233,252],[204,129,255],[255,188,106],[83,242,173]];
const sn=Math.sin(-.13), cs=Math.cos(-.13);
const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
for(let y=0;y<n;y++){
  const row=y*(n*4+1);rgba[row]=0;
  for(let x=0;x<n;x++){
    const px=(x-512)/512,py=(y-512)/512,u=x-512,v=y-526;
    const rx=u*cs+v*sn,ry=v*cs-u*sn;
    const a=Math.exp(-((px+.38)**2+(py+.50)**2)*2.45);
    const b=Math.exp(-((px-.56)**2+(py-.42)**2)*2.55);
    const c=Math.exp(-(px*px+(py+.14)**2)*2.1);
    const vignette=1-.11*(px*px+py*py);
    let r=(7+24*a+30*b+16*c)*vignette;
    let g=(15+15*a+7*b+25*c)*vignette;
    let blue=(39+60*a+59*b+56*c)*vignette;
    for(let k=0;k<4;k++){
      const dx=rx-(k%2?123:-123),dy=ry-(k>=2?123:-123);
      const qx=Math.abs(dx)-75,qy=Math.abs(dy)-75;
      const sd=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-34;
      const color=colors[k];
      const bloom=Math.exp(-Math.pow(Math.max(sd,0)/49,2))*.20;
      r=mix(r,color[0],bloom);g=mix(g,color[1],bloom);blue=mix(blue,color[2],bloom);
      if(sd<1){
        const edge=smooth(-1.5,1.5,-sd);
        const highlight=dy< -58 && Math.abs(dx)<85 ? .18*smooth(-72,-106,dy):0;
        const light=.76+.29*smooth(115,-115,-dy);
        const border=sd>-7 ? .18*(1-smooth(0,7,-sd)):0;
        const f=clamp(light+highlight+border);
        r=mix(r,clamp(color[0]*f+10,0,255),edge);
        g=mix(g,clamp(color[1]*f+10,0,255),edge);
        blue=mix(blue,clamp(color[2]*f+10,0,255),edge);
      }
    }
    const fade=smooth(.88,1.39,Math.max(Math.abs(px),Math.abs(py)))*.24;
    const i=row+1+x*4;
    rgba[i]=clamp(Math.round(mix(r,6,fade)),0,255);
    rgba[i+1]=clamp(Math.round(mix(g,11,fade)),0,255);
    rgba[i+2]=clamp(Math.round(mix(blue,29,fade)),0,255);
    rgba[i+3]=255;
  }
}
const table=new Uint32Array(256);
for(let j=0;j<256;j++){let c=j;for(let i=0;i<8;i++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);table[j]=c>>>0;}
const crc=buf=>{let c=0xffffffff;for(const v of buf)c=table[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0;};
const chunk=(type,body)=>{
  const t=Buffer.from(type),len=Buffer.alloc(4),check=Buffer.alloc(4);
  len.writeUInt32BE(body.length);check.writeUInt32BE(crc(Buffer.concat([t,body])));
  return Buffer.concat([len,t,body,check]);
};
const header=Buffer.alloc(13);
header.writeUInt32BE(n,0);header.writeUInt32BE(n,4);header[8]=8;header[9]=6;
const png=Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),
  chunk('IDAT',deflateSync(rgba,{level:9})),chunk('IEND',Buffer.alloc(0))
]);
const catalog='ios/App/App/Assets.xcassets/AppIcon.appiconset';
const data=JSON.parse(await readFile(join(catalog,'Contents.json'),'utf8'));
const entry=data.images?.find(e=>e.filename && (e.size==='1024x1024'||e.filename.includes('512@2x')));
if(!entry)throw new Error('No 1024px iOS AppIcon found in generated Capacitor project');
const target=join(catalog,entry.filename);
await mkdir(dirname(target),{recursive:true});
await writeFile(target,png);
console.log('Generated SnapShift AppIcon: '+target+' ('+png.length+' bytes)');
