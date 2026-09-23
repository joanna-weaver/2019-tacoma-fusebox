// 2019 Tacoma V6 fuse box app. Layout and fuse data live in data.json.
let GR,S,COL,TI,LIDONLY;
const ord=n=>n+(["th","st","nd","rd"][n%100>10&&n%100<14?0:n%10<4?n%10:0]);

const $=id=>document.getElementById(id);
let ST={},sel=null;
try{ST=JSON.parse(localStorage.getItem("tacoma-lid-check-v1")||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem("tacoma-lid-check-v1",JSON.stringify(ST))}catch(e){}};
const trk=s=>"MJLP".includes(s.t)&&!s.e, gs=s=>(ST[s.i]&&ST[s.i].s)||"";
const SL={"":"Not checked",o:"Original",r:"Replaced"};
function lines(nm){return nm.length>9&&nm.includes(" ")?[nm.slice(0,nm.lastIndexOf(" ")),nm.slice(nm.lastIndexOf(" ")+1)]:[nm]}
function draw(){
 let h=`<rect x="175" y="490" width="1220" height="1400" fill="#2b2f31"/>`;
 const P="fill='none' stroke='#8a9297' stroke-width='2'";
 h+=`<polygon ${P} points="215,500 433,500 433,880 613,880 613,1493 450,1493 450,1852 187,1852"/><rect ${P} x="455" y="505" width="695" height="350"/><polygon ${P} points="628,880 1010,885 1060,990 1143,990 1143,1493 620,1493"/><rect ${P} x="470" y="1515" width="665" height="330"/><rect ${P} x="1185" y="1128" width="185" height="765" fill="#23272a"/>`;
 S.forEach(s=>{
  const st=gs(s);let inner="";
  if(s.e)inner=`<line x1="${s.x+8}" y1="${s.y+s.h-8}" x2="${s.x+s.w-8}" y2="${s.y+8}" stroke="#7d8588" stroke-width="3"/>`;
  else{
   const cx=s.x+s.w/2,cy=s.y+s.h/2;
   if(s.v){const t=(s.amp?s.amp+"A  ":"")+s.name,fs=Math.max(13,Math.min(20,(s.h-10)/(t.length*.6)));
    inner=`<text transform="translate(${cx+fs*.35},${cy}) rotate(-90)" text-anchor="middle" font-size="${fs}">${t}</text>`}
   else{const L=lines(s.name),fs=Math.max(13,Math.min(21,(s.w-14)/(Math.max(...L.map(x=>x.length))*.62))),lh=fs*1.15,n=L.length+(s.amp?1:0);
    let y0=cy-(n-1)*lh/2+fs*.35;
    if(s.amp){inner+=`<text x="${cx}" y="${y0}" text-anchor="middle" font-size="${fs*1.15}" font-weight="700">${s.amp}A</text>`;y0+=lh}
    L.forEach((x,k)=>inner+=`<text x="${cx}" y="${y0+k*lh}" text-anchor="middle" font-size="${fs}">${x}</text>`)}
   if(COL[s.amp]&&trk(s))inner+=`<rect x="${s.x+2}" y="${s.y+2}" width="7" height="${s.h-4}" rx="3" fill="${COL[s.amp]}" style="fill:${COL[s.amp]}"/>`;
   if(st)inner+=`<text x="${s.x+s.w-4}" y="${s.y+18}" text-anchor="end" font-size="17">${st==="o"?"✅":"🔧"}</text>`}
  h+=`<g class="sl${s.e?" emp":""}" data-i="${s.i}" ${s.e?"":`tabindex="0" role="button" aria-label="${s.name} ${s.amp?s.amp+' amp':''}"`}><rect class="b" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="7"/>${inner}</g>`});
 $("svg").innerHTML=h;paint()}
function paint(){
 const q=$("q").value.trim().toLowerCase(),f=$("sf").value;
 document.querySelectorAll(".sl").forEach(g=>{const s=S[g.dataset.i],st=gs(s);
  const hit=(!q||(s.name+" "+s.d+" "+s.amp+"a").toLowerCase().includes(q))&&(!f||(f==="n"?trk(s)&&!st:st===f));
  g.classList.toggle("dim",!hit&&!s.e);g.classList.toggle("on",sel===s.i)});
 const fu=S.filter(trk);$("prog").textContent=`Checked ${fu.filter(s=>gs(s)).length} of ${fu.length} fuses · ${fu.filter(s=>gs(s)==="r").length} marked replaced`}
function show(s){
 const e=ST[s.i]||{},[sz,tx]=TI[s.t];
 $("det").innerHTML=s.e?`<h2>Unused slot</h2><p>The lid marks this slot as unused, so nothing is installed here.</p><div class="tbl"><b>Where:</b> ${s.where}</div>`:
 `<h2>${s.name}</h2><p style="margin:2px 0 6px">${s.d}</p><span class="tag">${s.amp?s.amp+" A":TI[s.t][0]}</span>${s.amp?`<span class="tag">${sz}</span>`:""}
 <div class="tbl"><b>Where:</b> ${s.where}.</div><div class="tbl"><b>Size:</b> ${tx}</div>
 ${LIDONLY.includes(s.name)?`<div class="tbl">This one comes from your lid photo; some online lists leave it out. Its size is judged from the outline drawn on the lid.</div>`:""}
 ${trk(s)?`<div class="seg">${Object.entries(SL).map(([k,t])=>`<button data-s="${k}" class="${(e.s||"")===k?"on":""}">${t}</button>`).join("")}</div><textarea id="nt" rows="2" placeholder="Notes: brand, color, looks aftermarket?">${e.t||""}</textarea>`:""}`;
 if(trk(s)){const set=(k,v)=>{ST[s.i]=Object.assign({},ST[s.i],{[k]:v});save()};
  $("det").querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{set("s",b.dataset.s);show(s);draw()});$("nt").oninput=e=>set("t",e.target.value)}}
function pick(g){if(!g)return;const s=S[g.dataset.i];if(s.e){sel=s.i;show(s);paint();return}sel=s.i;show(s);paint();$("det").scrollIntoView({behavior:"smooth",block:"nearest"})}
$("svg").addEventListener("click",e=>pick(e.target.closest(".sl")));
$("svg").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(e.target.closest(".sl"))}});
async function init(){
 let D;
 try{D=await (await fetch("data.json")).json()}catch(err){
  $("det").innerHTML="<h2>Could not load data.json</h2><p>Browsers block loading data.json when this page is opened straight from a file. Run <code>python3 -m http.server</code> in this folder and open <code>http://localhost:8000</code>, or use the single-file version.</p>";return}
 {
  GR=D.groups;COL=D.colors;TI=D.sizeInfo;LIDONLY=D.lidOnly;S=D.slots.map((s,i)=>({...s,i}));
  S.forEach(s=>{const grp=S.filter(o=>o.g===s.g).sort((a,b)=>GR[s.g][1]==="y"?a.y-b.y:a.x-b.x);const n=grp.indexOf(s)+1;
 s.where=s.g==="A0"?GR.A0[0]+", "+ord(n)+" from top":s.g==="E1"?GR.E1[0]:GR[s.g][0]+", "+ord(n)+" from "+(GR[s.g][1]==="y"?"top":"left")+" (counting unused slots)"});
  draw();
 }
}
$("q").oninput=paint;$("sf").onchange=paint;init();
