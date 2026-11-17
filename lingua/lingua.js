/* ======================================================================
   POKÉMON LANGUAGE ADVENTURE: LINGUA REGION
   DLO Bahasa Melayu Tahun 4 (KSSR 5.2: pembentukan kata)
   Bergantung pada index.html: LESSONS (bank soalan), S, db, save, render.
   Simpanan: localStorage "lingua_v1_<id murid>"
   ====================================================================== */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{const r=a.slice();for(let i=r.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[r[i],r[k]]=[r[k],r[i]]}return r};
const U=()=>Math.random().toString(36).slice(2,9);

/* ---------- DATA POKÉMON ---------- */
const SP={};
const sp=(id,n,t,hp,e,l,x)=>{SP[id]=Object.assign({n,t,hp,e,l},x||{})};
sp(1,"Bulbasaur","Rumput",40,"🌱","Kata berimbuhan: ber + main = bermain.",{evo:[5,2]});
sp(2,"Ivysaur","Rumput",52,"🌿","Kata berimbuhan: makan + an = makanan.",{evo:[10,3]});
sp(3,"Venusaur","Rumput",65,"🌳","Apitan: per + main + an = permainan.");
sp(4,"Charmander","Api",38,"🔥","Kata ganda penuh: buku-buku.",{evo:[5,5]});
sp(5,"Charmeleon","Api",50,"🔥","Kata ganda separa: pepohon.",{evo:[10,6]});
sp(6,"Charizard","Api",64,"🐉","Kata ganda: tetamu, lelaki.");
sp(7,"Squirtle","Air",40,"💧","Kata majmuk: kapal terbang.",{evo:[5,8]});
sp(8,"Wartortle","Air",52,"💧","Kata majmuk bebas: meja makan.",{evo:[10,9]});
sp(9,"Blastoise","Air",66,"🐢","Kata majmuk mantap: matahari.");
sp(10,"Caterpie","Serangga",30,"🐛","Awalan di-: dimakan.");
sp(16,"Pidgey","Terbang",32,"🐦","Kata majmuk bebas: kapal terbang.");
sp(19,"Rattata","Biasa",28,"🐭","Kata ganda penuh: kuda-kuda.");
sp(25,"Pikachu","Elektrik",35,"⚡","Kata majmuk bebas: kereta api.",{stone:26});
sp(26,"Raichu","Elektrik",55,"⚡","Kata majmuk mantap: kerjasama.");
sp(39,"Jigglypuff","Biasa",45,"🎤","Akhiran -an: lukisan.");
sp(41,"Zubat","Racun",30,"🦇","Akhiran -kan: ambilkan.");
sp(43,"Oddish","Rumput",34,"🌿","Akhiran -i: dekati.");
sp(52,"Meowth","Biasa",32,"🐱","Kata majmuk: buku teks.");
sp(53,"Persian","Biasa",55,"🐱","Kata ganda penuh: meja-meja.");
sp(65,"Alakazam","Psikik",55,"🔮","Gabungan semua jenis pembentukan kata.");
sp(66,"Machop","Lawan",40,"💪","Kata ganda separa: lelaki.");
sp(69,"Bellsprout","Rumput",34,"🌱","Apitan: kegembiraan.");
sp(74,"Geodude","Batu",40,"🪨","Kata ganda penuh: anak-anak.");
sp(81,"Magnemite","Elektrik",32,"🧲","Kata majmuk bebas: lampu isyarat.");
sp(95,"Onix","Batu",55,"🪨","Kata ganda separa: tetamu.");
sp(100,"Voltorb","Elektrik",32,"⚪","Kata majmuk mantap: tanggungjawab.");
sp(133,"Eevee","Biasa",40,"✨","Awalan se-: sekelas.",{stone:136});
sp(136,"Flareon","Api",60,"🔥","Kata ganda penuh: guru-guru.");
sp(149,"Dragonite","Naga",90,"🐲","Penguasa semua jenis kata!");
const STARTERS=[1,4,7,25];
const stage=id=>{for(const k in SP){const s=SP[k];if((s.evo&&s.evo[1]==id)||s.stone==id)return 1+stage(+k)}return 1};
const spr=(id,w)=>`<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" width="${w||96}" height="${w||96}" alt="${esc(SP[id]?SP[id].n:"Pokémon")}" onerror="this.outerHTML='<span class=&quot;lg-fbk&quot;>${SP[id]?SP[id].e:"🐾"}</span>'">`;

/* ---------- WILAYAH ---------- */
const RG={
 g1:{n:"Hutan Rumput",top:"Kata Berimbuhan",t:"imbuhan",leader:"Flora",badge:"Lencana Alam (Nature Badge)",bg:"lg-g1",pool:[10,16,43,69],gym:{id:43,lv:8},deco:"🌳🌿🍃🌲🌸",lines:"Pokémon di sini lupa cara menggunakan imbuhan. Bantu mereka!"},
 g2:{n:"Bandar Metro",top:"Kata Majmuk",t:"majmuk",leader:"Volt",badge:"Lencana Pengetahuan (Knowledge Badge)",bg:"lg-g2",pool:[81,100,19,52],gym:{id:26,lv:14},deco:"🏙️🚆🚦💡🛰️",lines:"Teka-teki kata majmuk bertaburan di seluruh bandar. Gabungkan kata dengan betul!"},
 g3:{n:"Gua Gunung",top:"Kata Ganda",t:"ganda",leader:"Rocky",badge:"Lencana Penguasaan (Mastery Badge)",bg:"lg-g3",pool:[74,41,66,95],gym:{id:95,lv:20},deco:"⛰️🪨💎🕯️🦇",lines:"Gua ini bergema dengan kata yang diulang-ulang. Kenal pasti jenis kata ganda!"}
};
const ORDER=["g1","g2","g3"];

/* ---------- PANGKALAN PENGETAHUAN PROFESOR BAHASA (tiada AI sebenar) ---------- */
const KB={
 imbuhan:{t:"Kata Berimbuhan",d:"Kata akar yang ditambah imbuhan. Awalan di hadapan (ber-, me-, di-, ter-, se-), akhiran di belakang (-an, -kan, -i), apitan di hadapan dan belakang serentak (per-an, ke-an, pe-an).",ex:"ber + main = bermain; makan + an = makanan; ke + gembira + an = kegembiraan",hint:"Cari kata akar dahulu. Kemudian lihat imbuhan: di hadapan, di belakang atau kedua-duanya?"},
 majmuk:{t:"Kata Majmuk",d:"Gabungan dua kata atau lebih yang membawa satu makna. Majmuk bebas ditulis berasingan; majmuk mantap ditulis rapat.",ex:"kereta api, meja makan (bebas); matahari, kerjasama (mantap)",hint:"Adakah dua kata bergabung menjadi satu makna? Jika ditulis rapat, ia majmuk mantap."},
 ganda:{t:"Kata Ganda",d:"Kata yang diulang. Ganda penuh mengulang seluruh kata akar dengan sempang; ganda separa mengulang sebahagian kata akar.",ex:"buku-buku, kanak-kanak (penuh); pepohon, lelaki, tetamu (separa)",hint:"Adakah kata diulang? Seluruhnya = penuh. Sebahagian sahaja = separa."},
 campuran:{t:"Campuran",d:"Gabungan imbuhan, majmuk dan ganda.",ex:"makanan, kereta api, buku-buku",hint:"Tanya diri: ada imbuhan, dua kata bergabung, atau kata diulang?"}
};
const FAQ=[
 ["Apakah beza awalan, akhiran dan apitan?","Awalan di hadapan kata akar (bermain). Akhiran di belakang (makanan). Apitan ada di hadapan dan di belakang serentak (permainan)."],
 ["Apakah beza majmuk bebas dan mantap?","Majmuk bebas ditulis berasingan (kereta api). Majmuk mantap ditulis rapat dan maknanya tetap (matahari)."],
 ["Apakah beza ganda penuh dan separa?","Ganda penuh mengulang seluruh kata akar (buku-buku). Ganda separa mengulang sebahagian (pepohon)."],
 ["Bagaimana mencari kata akar?","Buang imbuhan dahulu. Contoh: bermain → main, makanan → makan, permainan → main."],
 ["Mengapa me- menjadi mem- dalam membaca?","Me- berubah mengikut huruf pertama kata akar. Sebelum huruf b, me- menjadi mem-: me + baca = membaca."],
 ["Saya salah jawab. Apa perlu dibuat?","Tidak mengapa! Baca penjelasan, ingat contoh, kemudian cuba lagi. Anda boleh ulang soalan di Pusat Pokémon."]
];

/* ---------- BANK PERKATAAN UNTUK TEKA-TEKI ---------- */
const W=[
 {w:"bermain",t:"imbuhan",n:"awalan ber-"},{w:"makanan",t:"imbuhan",n:"akhiran -an"},{w:"permainan",t:"imbuhan",n:"apitan per-an"},
 {w:"dibaca",t:"imbuhan",n:"awalan di-"},{w:"kegembiraan",t:"imbuhan",n:"apitan ke-an"},{w:"ambilkan",t:"imbuhan",n:"akhiran -kan"},
 {w:"kereta api",t:"majmuk",n:"majmuk bebas"},{w:"matahari",t:"majmuk",n:"majmuk mantap"},{w:"meja makan",t:"majmuk",n:"majmuk bebas"},
 {w:"kerjasama",t:"majmuk",n:"majmuk mantap"},{w:"kapal terbang",t:"majmuk",n:"majmuk bebas"},{w:"tanggungjawab",t:"majmuk",n:"majmuk mantap"},
 {w:"buku-buku",t:"ganda",n:"ganda penuh"},{w:"pepohon",t:"ganda",n:"ganda separa"},{w:"kanak-kanak",t:"ganda",n:"ganda penuh"},
 {w:"tetamu",t:"ganda",n:"ganda separa"},{w:"lelaki",t:"ganda",n:"ganda separa"},{w:"meja-meja",t:"ganda",n:"ganda penuh"}
];
const TN={imbuhan:"Kata Berimbuhan",majmuk:"Kata Majmuk",ganda:"Kata Ganda"};
const PZ={
 g1:{s:[{p:["ber","main"],j:"",a:"bermain",n:"ber- + main"},{p:["makan","an"],j:"",a:"makanan",n:"makan + -an"},{p:["per","main","an"],j:"",a:"permainan",n:"per- + main + -an"},{p:["ke","gembira","an"],j:"",a:"kegembiraan",n:"ke- + gembira + -an"}],
     l:[{s:"Adik sedang ___ buku cerita.",o:["membaca","bacaan","pembaca"],a:0,n:"Kata kerja aktif: me- + baca = membaca."},{s:"Ayah ___ kereta ke pejabat.",o:["pandukan","memandu","dipandu"],a:1,n:"Me- + pandu = memandu."},{s:"Kuih itu ___ oleh adik.",o:["dimakan","makanan","memakan"],a:0,n:"Di- + makan = dimakan (perbuatan dikenakan)."}]},
 g2:{s:[{p:["kereta","api"],j:" ",a:"kereta api",n:"majmuk bebas ditulis berasingan"},{p:["mata","hari"],j:"",a:"matahari",n:"majmuk mantap ditulis rapat"},{p:["meja","makan"],j:" ",a:"meja makan",n:"majmuk bebas"},{p:["kerja","sama"],j:"",a:"kerjasama",n:"majmuk mantap"}],
     l:[{s:"Kami menaiki ___ ke bandar.",o:["kereta api","berlari","makanan"],a:0,n:"Kereta api ialah kata majmuk bebas."},{s:"___ terbit di timur.",o:["Mata hari","Matahari","Harimata"],a:1,n:"Majmuk mantap ditulis rapat: matahari."},{s:"Pemandu berhenti di ___ merah.",o:["lampu isyarat","bersinar","cahaya-cahaya"],a:0,n:"Lampu isyarat ialah majmuk bebas."}]},
 g3:{s:[{p:["buku","buku"],j:"-",a:"buku-buku",n:"ganda penuh guna sempang"},{p:["pe","pohon"],j:"",a:"pepohon",n:"ganda separa: pe + pohon"},{p:["te","tamu"],j:"",a:"tetamu",n:"ganda separa: te + tamu"},{p:["kanak","kanak"],j:"-",a:"kanak-kanak",n:"ganda penuh"}],
     l:[{s:"___ itu bermain di padang. (ramai)",o:["Kanak-kanak","Kanak","Kanakan"],a:0,n:"Kanak-kanak ialah ganda penuh."},{s:"___ di taman itu rendang.",o:["Pohon pohon","Pepohon","Pohonan"],a:1,n:"Pepohon ialah ganda separa."},{s:"___ itu dijemput masuk.",o:["Tetamu","Tamuan","Tamu tamu"],a:0,n:"Tetamu ialah ganda separa."}]}
};

/* ---------- KEADAAN & SIMPANAN ---------- */
let G=null,key="",BT=null,CF=null,PU=null;
const fresh=name=>({v:1,name,xp:0,coins:100,mons:[],team:[],items:{ball:5,great:0,potion:3,super:0,stone:1},badges:[],prog:{},mis:0,ach:{},learn:{imbuhan:[],majmuk:[],ganda:[],campuran:[]},stats:{ok:0,t:0,wins:0},wrong:[],seen:[],caught:[],set:{mus:.5,sfx:.7,mute:false},rocket:false,master:false,elite:false,intro:false});
/* Semak & baiki data simpanan supaya data rosak/lama tidak menyebabkan ralat */
function sanitize(o,name){
 const f=fresh(name);if(!o||typeof o!=="object"||o.v!==1)return null;
 const g=Object.assign(f,o);
 ["items","prog","ach","learn","stats","set"].forEach(k=>{g[k]=Object.assign(f[k],o[k]&&typeof o[k]==="object"?o[k]:{})});
 Object.keys(g.learn).forEach(k=>{if(!Array.isArray(g.learn[k]))g.learn[k]=[]});
 ["mons","team","badges","wrong","seen","caught"].forEach(k=>{if(!Array.isArray(g[k]))g[k]=[]});
 g.mons=g.mons.filter(m=>m&&SP[m.id]).map(m=>({u:String(m.u||U()),id:m.id,lv:Math.max(1,+m.lv||1),xp:+m.xp||0,hp:Math.max(0,+m.hp||0)}));
 g.team=g.team.filter(u=>g.mons.some(m=>m.u===u)).slice(0,6);
 g.badges=g.badges.filter(b=>RG[b]);
 ["xp","coins","mis"].forEach(k=>{g[k]=Math.max(0,+g[k]||0)});
 return g;
}
const persist=()=>{try{if(G&&key)localStorage.setItem(key,JSON.stringify(G))}catch(e){}};
const sid=()=>(typeof S!=="undefined"&&S&&S.id)||"tetamu";
const sname=()=>{try{const m=db.students.find(s=>s.id===sid());return m?m.n:"Jurulatih"}catch(e){return "Jurulatih"}};
const readSave=()=>{try{return sanitize(JSON.parse(localStorage.getItem(key)),sname())}catch(e){return null}};
const mon=u=>G.mons.find(m=>m.u===u);
const mhp=m=>SP[m.id].hp+m.lv*6;
const tl=()=>1+Math.floor(G.xp/100);
const prog=()=>G.badges.length*25+(G.master?25:0);
function addMon(id,lv){const m={u:U(),id,lv,xp:0,hp:0};m.hp=mhp(m);G.mons.push(m);if(G.team.length<6)G.team.push(m.u);if(!G.seen.includes(id))G.seen.push(id);if(!G.caught.includes(id))G.caught.push(id);return m}
const alive=()=>G.team.map(mon).filter(m=>m&&m.hp>0);
/* Sinkron kemajuan ke dashboard guru (jika wujud) */
function sync(lid,s,t){try{const me=db.students.find(x=>x.id===sid());if(me){const o=me.p[lid];if(!o||s>o.s)me.p[lid]={s,t};save()}}catch(e){}}

/* ---------- AUDIO (WebAudio; tiada fail luar, jadi tiada ralat 404) ---------- */
let ac=null,mT=null,cur="";
const ctx=()=>{if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==="suspended")ac.resume();return ac};
const tone=(f,d=.08,type="square",v=.08)=>{const a=ctx();if(!a||!G||G.set.mute)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v*G.set.sfx,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}};
function snd(k){const seq={click:[[600,.04]],ok:[[660,.06],[880,.08]],no:[[220,.12],[170,.15]],win:[[523,.1],[659,.1],[784,.18]],lvl:[[523,.08],[659,.08],[784,.08],[1046,.22]],evo:[[392,.1],[523,.1],[659,.1],[784,.1],[1046,.25]],catch:[[660,.08],[880,.08],[1100,.2]]};(seq[k]||seq.click).forEach((x,i)=>setTimeout(()=>tone(x[0],x[1]),i*90))}
function music(k){if(cur===k)return;cur=k;clearInterval(mT);if(!k||!G||G.set.mute)return;const notes=k==="battle"?[261,329,392,329,293,349,440,349]:[262,330,392,523,392,330,294,349];let i=0;mT=setInterval(()=>tone(notes[i++%notes.length],.18,"triangle",.025),260)}
function toast(s){const n=document.createElement("div");n.className="lg-toast";n.textContent=s;$("#lg").appendChild(n);setTimeout(()=>n.remove(),2200)}
function show(html,cls){const m=$("#lgm");if(!m)return;m.className="lg-main "+(cls||"");m.innerHTML=html}
const back=(act="hub",label="← Kembali")=>`<button class="ghost lg-back" data-act="${act}">${label}</button>`;
const bar=(v,max,c="xp")=>`<div class="lg-bar ${c}"><i style="width:${Math.min(100,Math.max(0,v/max*100))}%"></i></div>`;
function reward(xp,coins,u){
 G.xp+=xp;G.coins+=coins;
 const m=mon(u)||mon(G.team[0]);if(m){m.xp+=xp;while(m.xp>=m.lv*20&&m.lv<50){m.xp-=m.lv*20;m.lv++;m.hp=mhp(m);snd("lvl")}}
 persist();return [`+${xp} XP`, `+${coins} 🪙`];
}
function chk(){
 const tests=[
  ["first","Tangkapan pertama",()=>G.caught.length>=1,[20,20]],
  ["five","Pengumpul Pokémon",()=>G.caught.length>=5,[50,50]],
  ["badge","Pengembara",()=>G.badges.length>=1,[40,40]],
  ["three","Penguasa Wilayah",()=>G.badges.length>=3,[100,100]],
  ["perfect","Minda Cemerlang",()=>G.stats.t>=10&&G.stats.ok/G.stats.t>=.9,[80,80]]
 ];
 tests.forEach(a=>{if(!G.ach[a[0]]&&a[2]()){G.ach[a[0]]=true;G.xp+=a[3][0];G.coins+=a[3][1];toast(`🏆 ${a[1]}! +${a[3][0]} XP, +${a[3][1]} 🪙`)}});
 persist();
}
const ACH=[
 {id:"first",n:"Tangkapan pertama",d:"Tangkap Pokémon pertama.",r:[20,20]},
 {id:"five",n:"Pengumpul Pokémon",d:"Tangkap lima Pokémon.",r:[50,50]},
 {id:"badge",n:"Pengembara",d:"Dapatkan lencana pertama.",r:[40,40]},
 {id:"three",n:"Penguasa Wilayah",d:"Kumpul ketiga-tiga lencana.",r:[100,100]},
 {id:"perfect",n:"Minda Cemerlang",d:"Capai ketepatan 90% selepas 10 soalan.",r:[80,80]}
];
