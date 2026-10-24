/** Original AERONAUT simplified teaching meshes. Generator MIT; generated geometry CC0-1.0. */
import * as T from 'three';
import {Document, NodeIO} from '@gltf-transform/core';
import {weld,dedup,prune} from '@gltf-transform/functions';
import {writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const specs=[
 {slug:'a320neo',name:'Airbus A320neo',length:37.57,span:35.8,height:11.76,r:1.975,engines:2,fan:1.16,tip:'sharklet',gear:2},
 {slug:'a350-900',name:'Airbus A350-900',length:66.8,span:64.75,height:17.05,r:2.98,engines:2,fan:1.74,tip:'curved',gear:4,mask:true},
 {slug:'a380-800',name:'Airbus A380-800',length:72.72,span:79.75,height:24.09,r:3.57,engines:4,fan:1.65,tip:'fence',gear:6,decks:2},
 {slug:'737-max-8',name:'Boeing 737 MAX 8',length:39.52,span:35.9,height:12.3,r:1.88,engines:2,fan:1.05,tip:'split',gear:2,chevrons:true},
 {slug:'787-9',name:'Boeing 787-9',length:62.81,span:60.12,height:17.02,r:2.885,engines:2,fan:1.53,tip:'raked',gear:4,chevrons:true},
 {slug:'c919',name:'COMAC C919',length:38.9,span:35.8,height:11.95,r:1.98,engines:2,fan:1.15,tip:'curved',gear:2,mask:true},
 {slug:'e195-e2',name:'Embraer E195-E2',length:41.5,span:35.12,height:10.9,r:1.505,engines:2,fan:1.05,tip:'raked',gear:2},
];
const directory='public/models/atlas'; await mkdir(directory,{recursive:true});
const manifest=[];
for(const s of specs){
 const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene(s.name), buckets=new Map();
 doc.getRoot().getAsset().copyright='AERONAUT original simplified educational geometry, CC0-1.0';
 const mats={
 white:doc.createMaterial('PearlWhite').setBaseColorFactor([.9,.94,.98,1]).setRoughnessFactor(.43),
 paint:doc.createMaterial('AeronautPaint').setBaseColorFactor([.015,.12,.22,1]).setRoughnessFactor(.48),
 accent:doc.createMaterial('AeronautAccent').setBaseColorFactor([.02,.65,.72,1]).setRoughnessFactor(.42),
 wing:doc.createMaterial('WingGrey').setBaseColorFactor([.58,.66,.73,1]).setRoughnessFactor(.6),
 dark:doc.createMaterial('GlazingAndTyres').setBaseColorFactor([.012,.025,.04,1]).setRoughnessFactor(.55),
 metal:doc.createMaterial('Metal').setBaseColorFactor([.38,.45,.5,1]).setMetallicFactor(.6).setRoughnessFactor(.38),
 };
 function add(part,mat,g,p=[0,0,0],r=[0,0,0],scale=[1,1,1]){
  const idx=g.getIndex(),pos=g.getAttribute('position');let vol=0;
  if(idx){for(let i=0;i<idx.count;i+=3){const a=new T.Vector3().fromBufferAttribute(pos,idx.getX(i)),b=new T.Vector3().fromBufferAttribute(pos,idx.getX(i+1)),c=new T.Vector3().fromBufferAttribute(pos,idx.getX(i+2));vol+=a.dot(b.cross(c))/6;}
   if(vol<0){for(let i=0;i<idx.count;i+=3){let b=idx.getX(i+1);idx.setX(i+1,idx.getX(i+2));idx.setX(i+2,b);}g.computeVertexNormals();}}
  const normals=g.getAttribute('normal'); for(let i=0;i<normals.count;i++){const n=new T.Vector3().fromBufferAttribute(normals,i);if(n.lengthSq()<1e-12)n.set(0,0,pos.getZ(i)<0?-1:1);else n.normalize();normals.setXYZ(i,n.x,n.y,n.z);}
  g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion().setFromEuler(new T.Euler(...r)),new T.Vector3(...scale)));
  const x=g.index?g.toNonIndexed():g,key=part+'|'+mat; if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(x);
 }
 function loft(profile,segments=64,arc=[0,Math.PI*2]){
  const p=[],idx=[];for(const[z,r]of profile)for(let j=0;j<=segments;j++){const a=arc[0]+j/segments*(arc[1]-arc[0]);p.push(Math.cos(a)*r,Math.sin(a)*r,z);}
  for(let i=0;i<profile.length-1;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
 }
 function slab(points,thick=.14){
  const p=[],idx=[],n=points.length;for(const y of[-thick/2,thick/2])for(const[x,yy,z]of points)p.push(x,yy+y,z);
  for(let j=1;j<n-1;j++)idx.push(0,j+1,j,n,n+j,n+j+1);
  for(let j=0;j<n;j++){let k=(j+1)%n;idx.push(j,k,n+j,k,n+k,n+j);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
 }
 const L=s.length,R=s.r,S=s.span,ground=s.slug==='737-max-8'?R+1.4:R+1.9,verticalScale=s.decks?1.22:1;
 let prof=[[-.5*L,0],[-.485*L,.15*R],[-.46*L,.42*R],[-.41*L,.78*R],[-.35*L,R],[.33*L,R],[.39*L,.92*R],[.44*L,.7*R],[.478*L,.35*R],[.497*L,.075*R],[.5*L,0]];
 if(s.decks)prof=[[-.5*L,0],[-.485*L,.2*R],[-.46*L,.6*R],[-.40*L,.9*R],[-.34*L,R],[.40*L,R],[.445*L,.95*R],[.475*L,.76*R],[.491*L,.44*R],[.499*L,.12*R],[.5*L,0]];
 // The navy lower hull and turquoise cheatline form an original concept scheme.
 add('Fuselage','white',loft(prof,64,[0,Math.PI]),[0,ground,0],[0,0,0],[1,verticalScale,1]);
 add('Fuselage','paint',loft(prof,64,[Math.PI,2*Math.PI]),[0,ground,0],[0,0,0],[1,verticalScale,1]);
 add('Fuselage','accent',loft(prof.map(([z,r])=>[z,r*1.002]),64,[-.07,.025]),[0,ground,0],[0,0,0],[1,verticalScale,1]);
 add('Fuselage','accent',loft(prof.map(([z,r])=>[z,r*1.002]),64,[Math.PI-.025,Math.PI+.07]),[0,ground,0],[0,0,0],[1,verticalScale,1]);
 const wingY=ground-.5*R,rootZ=.09*L,tipZ=-.15*L,tipY=wingY+S*.025;
 for(const side of[-1,1]){
  const sideName=side===1?'Left':'Right',w='Wing'+sideName;
  const rake=s.tip==='raked'?S*.045:0;
  add(w,'wing',slab([[side*R*.55,wingY,rootZ],[side*S*.32,wingY+S*.01,-L*.045],[side*S*.5,tipY,tipZ-rake],[side*S*.495,tipY,tipZ-L*.028-rake],[side*S*.32,wingY+S*.01,-L*.11],[side*R*.55,wingY,-L*.13]],R*.11));
  if(s.tip!=='raked'){
   const h=s.tip==='fence'?R*.5:R*.9;
   add(w,'paint',slab([[side*S*.493,tipY,tipZ-L*.028],[side*S*.5,tipY,tipZ],[side*(S*.5+.3),tipY+h,tipZ-L*.015],[side*(S*.5+.23),tipY+h,tipZ-L*.043]],.08));
   if(s.tip==='split'||s.tip==='fence')add(w,'accent',slab([[side*S*.493,tipY,tipZ-L*.028],[side*S*.5,tipY,tipZ],[side*(S*.5+.2),tipY-h*.6,tipZ-L*.012],[side*(S*.5+.18),tipY-h*.6,tipZ-L*.035]],.07));
  }
  add('HorizontalTail'+sideName,'wing',slab([[side*R*.35,ground+.55*R,-L*.33],[side*S*.2,ground+R*.77,-L*.435],[side*S*.19,ground+R*.77,-L*.48],[side*R*.3,ground+.55*R,-L*.435]],R*.08));
  for(let engine=0;engine<s.engines/2;engine++){
   const x=side*S*(engine===0?.185:.335),ey=ground-R*.85,ez=L*(engine===0?.075:-.015),er=s.fan,elen=er*3.7,part='Engine'+sideName+(engine?'Outer':'');
   const ep=[[-elen*.55,er*.53],[-elen*.42,er*.8],[elen*.3,er*1.05],[elen*.47,er],[elen*.5,er*.91],[elen*.43,er*.82],[elen*.2,er*.73],[-elen*.48,er*.42],[-elen*.55,er*.53]];
   add(part,'white',loft(ep,48),[x,ey,ez]);
   add(part,'dark',new T.CylinderGeometry(er*.78,er*.78,.04,48),[x,ey,ez+elen*.3],[Math.PI/2,0,0]);
   add(part,'metal',new T.ConeGeometry(er*.21,er*.43,24),[x,ey,ez+elen*.36],[Math.PI/2,0,0]);
   for(let i=0;i<20;i++){let a=i/20*Math.PI*2;add(part,'metal',new T.BoxGeometry(er*.07,er*.53,.025),[x+Math.sin(a)*er*.45,ey+Math.cos(a)*er*.45,ez+elen*.32],[0,0,-a-.32]);}
   add(part,'wing',new T.BoxGeometry(er*.2,R*.85,elen*.56),[x,ey+R*.55,ez-elen*.15]);
   if(s.chevrons)for(let i=0;i<16;i++){const a=i/16*Math.PI*2;add(part,'metal',new T.ConeGeometry(er*.1,er*.28,3),[x+Math.cos(a)*er*.55,ey+Math.sin(a)*er*.55,ez-elen*.56],[Math.PI/2,0,a]);}
  }
  const windows=Math.round(L*1.05),dy=s.decks?[.25*R,1.03*R]:[.38*R];
  for(const wy of dy)for(let i=0;i<windows;i++){
   const z=L*.32-i/(windows-1)*L*.66;
   const radius=R*(z<-.35*L?.9:1),xx=Math.sqrt(Math.max(.1,radius*radius-(wy/verticalScale)**2));
   add('CabinWindows','dark',new T.SphereGeometry(1,8,6),[side*xx*1.005,ground+wy,z],[0,0,0],[.045,s.slug==='787-9'?.23:.17,.105]);
  }
  // Six simplified dark windscreen panes; A350/C919 mask is a contiguous surround.
  for(let k=0;k<(s.mask?6:3);k++){
   const z=L*((s.decks?.455:.398)+k*.008),a=.48+k*.09,radius=R*(.89-k*.035);
   add('Cockpit','dark',new T.SphereGeometry(1,10,6),[side*Math.cos(a)*radius,ground+Math.sin(a)*radius*verticalScale,z],[0,0,side*a],[.07,R*.125,L*.013]);
  }
 }
 // Vertical fin built in x-thickness; height is matched to nominal overall height.
 const finBase=ground+R*.6,finTop=s.height,fp=[[-.08,finBase,-L*.33],[-.08,finTop,-L*.43],[-.08,finTop,-L*.47],[-.08,finBase,-L*.47],[.08,finBase,-L*.33],[.08,finTop,-L*.43],[.08,finTop,-L*.47],[.08,finBase,-L*.47]];
 const fin=new T.BufferGeometry();fin.setAttribute('position',new T.Float32BufferAttribute(fp.flat(),3));fin.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,4,1,5,4,1,2,5,2,6,5,2,3,6,3,7,6,3,0,7,0,4,7]);fin.computeVertexNormals();add('VerticalTail','paint',fin);
 // Original turquoise tail slash; painted design, not a real airline emblem.
 for(const side of[-1,1]){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([side*.085,finBase+(finTop-finBase)*.25,-L*.42, side*.085,finTop-(finTop-finBase)*.08,-L*.44, side*.085,finTop-(finTop-finBase)*.08,-L*.455, side*.085,finBase+(finTop-finBase)*.25,-L*.438],3));g.setIndex(side===1?[0,1,2,0,2,3]:[0,2,1,0,3,2]);g.computeVertexNormals();add('VerticalTail','accent',g);
 }
 const gearDefs=[['NoseGear',0,.34*L,2],['MainGearLeft',R*1.1,-L*.07,s.gear],['MainGearRight',-R*1.1,-L*.07,s.gear]];
 if(s.decks)gearDefs.push(['BodyGearLeft',R*.62,-L*.17,6],['BodyGearRight',-R*.62,-L*.17,6]);
 for(const[part,x,z,wheels]of gearDefs){
  const rr=part==='NoseGear'?R*.15:R*.22;
  add(part,'metal',new T.CylinderGeometry(R*.045,R*.055,ground-R*.55-rr,12),[x,(ground-R*.55+rr)/2,z]);
  for(let row=0;row<wheels/2;row++)for(const sign of[-1,1]){
   add(part,'dark',new T.TorusGeometry(rr*.73,rr*.27,10,20),[x+sign*rr*.65,rr,z+(row-(wheels/2-1)/2)*rr*2.2],[0,Math.PI/2,0]);
   add(part,'metal',new T.CylinderGeometry(rr*.43,rr*.43,rr*.3,16),[x+sign*rr*.65,rr,z+(row-(wheels/2-1)/2)*rr*2.2],[0,0,Math.PI/2]);
  }
 }
 const bounds=new T.Box3(); for(const list of buckets.values())for(const g of list){g.computeBoundingBox();bounds.union(g.boundingBox);}
 const extent=bounds.getSize(new T.Vector3());const calibration=new T.Matrix4().makeScale(S/extent.x,s.height/extent.y,L/extent.z);for(const list of buckets.values())for(const g of list)g.applyMatrix4(calibration);
 const partNames=new Set();
 for(const[key,geometries]of buckets){const[part,mat]=key.split('|');partNames.add(part);const arrays={POSITION:[],NORMAL:[]};for(const g of geometries){arrays.POSITION.push(...g.attributes.position.array);arrays.NORMAL.push(...g.attributes.normal.array);}const primitive=doc.createPrimitive().setMaterial(mats[mat]);for(const[semantic,list]of Object.entries(arrays))primitive.setAttribute(semantic,doc.createAccessor().setType('VEC3').setArray(new Float32Array(list)).setBuffer(buffer));scene.addChild(doc.createNode(part+'_'+mat).setExtras({partId:part}).setMesh(doc.createMesh(part+'_'+mat).addPrimitive(primitive)));}
 await doc.transform(weld(),dedup(),prune()); const bytes=await new NodeIO().writeBinary(doc);await writeFile(`${directory}/${s.slug}.glb`,bytes);
 const triangles=doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((a,p)=>a+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);
 manifest.push({aircraftSlug:s.slug,id:'aeronaut-'+s.slug+'-schematic-v13',name:s.name,kind:'原创简化教学外形 / Original schematic exterior',modelUrl:`/models/atlas/${s.slug}.glb`,url:`/models/atlas/${s.slug}.glb`,bytes:bytes.byteLength,sha256:createHash('sha256').update(bytes).digest('hex'),textures:0,triangles,drawCalls:buckets.size,parts:[...partNames],posterUrl:`/models/atlas/${s.slug}-poster.webp`,license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',source:'/models/atlas/model-source.mjs',author:'AERONAUT — original geometry with OpenAI Codex assistance',dimensionsMetres:{length:L,wingspan:S,height:s.height},dimensionSource:'Existing Aircraft Atlas manufacturer-linked dimensional records; source URLs remain on aircraft page.',orientation:{up:'+Y',nose:'+Z'},capabilities:{meshHighlight:true,animations:false,liverySwitch:true},limitations:['按公开总体尺寸制作的简化教学外形，非厂商工程模型；局部曲面、发动机、翼型和起落架经过简化。','Original schematic geometry; not an OEM/certification/maintenance model.','无可用运动铰链或动画；不提供舵面和起落架运动。','材质色块为原创 Concept Livery，不代表真实航司、制造商展示或历史运营涂装。'],liveries:[{id:'aeronaut-ocean',name:'AERONAUT Ocean — Concept Livery',concept:true,colors:{paint:'#032d49',accent:'#05a6b8'}},{id:'aeronaut-sunset',name:'AERONAUT Sunset — Concept Livery',concept:true,colors:{paint:'#42344d',accent:'#ed9d46'}}]});
 console.log(s.slug,bytes.byteLength,triangles,buckets.size);
}
await writeFile('data/atlas-models.json',JSON.stringify(manifest,null,2)+'\n');
await copyFile('scripts/v13-models.mjs',directory+'/model-source.mjs');
await writeFile(directory+'/LICENSE.txt','Generated geometry and original concept paint schemes: CC0-1.0.\nhttps://creativecommons.org/publicdomain/zero/1.0/legalcode\nGenerator source: MIT (AERONAUT contributors). Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies, subject to inclusion of this copyright and permission notice. THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. No third-party geometry, airline logos, or image textures used.\nAircraft names identify the educational subject only; no manufacturer endorsement.\n');
