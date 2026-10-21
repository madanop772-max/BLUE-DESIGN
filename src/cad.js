export function parameters(raw={}){
 const defaults={width:80,depth:65,height:75,wall:4,hole:36};const p={};
 for(const [k,d] of Object.entries(defaults)){p[k]=raw[k]===undefined?d:Number(raw[k]);if(!Number.isFinite(p[k])||p[k]<1||p[k]>500)throw Object.assign(new Error(`Invalid ${k}: use 1–500 mm`),{status:400});}
 if(p.wall>=Math.min(p.width,p.depth,p.height)/3)throw Object.assign(new Error('Wall must be less than one third of the smallest dimension'),{status:400});
 if(p.hole>=Math.min(p.width,p.height)-p.wall*2)throw Object.assign(new Error('Motor hole must fit within the upright face'),{status:400});return p;
}
export function scad(raw){const p=parameters(raw);return `// Blue Design — parametric prototype motor mount\n// Units: mm. Validate fit and loads before fabrication.\n$fn=96;\nwidth=${p.width}; depth=${p.depth}; height=${p.height}; wall=${p.wall}; motor_hole=${p.hole}; bolt=4.3;\ndifference(){\n union(){\n  cube([width,depth,wall]);\n  translate([0,depth-wall,wall]) cube([width,wall,height-wall]);\n }\n for(x=[width*0.15,width*0.85],y=[depth*0.18,depth*0.7]) translate([x,y,-1]) cylinder(h=wall+2,d=bolt);\n translate([width/2,depth+1,height*0.58]) rotate([90,0,0]) cylinder(h=wall+2,d=motor_hole);\n for(x=[width*0.2,width*0.8],z=[height*0.25,height*0.85]) translate([x,depth+1,z]) rotate([90,0,0]) cylinder(h=wall+2,d=bolt);\n}\n`;}
// Watertight union of a base and upright with a circular motor opening.
export function stl(raw){const p=parameters(raw);const triangles=[];const quad=(a,b,c,d)=>triangles.push([a,b,c],[a,c,d]);
 const box=(x0,x1,y0,y1,z0,z1)=>{const v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];for(const f of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])quad(...f.map(i=>v[i]));};
 // Each solid is closed; base and upright share only a boundary, with no overlapping volume.
 const n=64,cx=p.width/2,cz=p.height*.58,r=p.hole/2;
 // Extrude a rectangular ring with circular opening, projecting radial rays to the rectangle.
 const inner=[],outer=[];for(let i=0;i<n;i++){const a=i*2*Math.PI/n,dx=Math.cos(a),dz=Math.sin(a);const tx=dx>0?(p.width-cx)/dx:dx<0?-cx/dx:Infinity;const tz=dz>0?(p.height-cz)/dz:dz<0?(p.wall-cz)/dz:Infinity;const t=Math.min(tx,tz);inner.push([cx+r*dx,cz+r*dz]);outer.push([cx+t*dx,cz+t*dz]);}
 // Include exact rectangle corner angles so the rectangular outline never cuts across corners.
 const angles=new Set(Array.from({length:n},(_,i)=>i*2*Math.PI/n));for(const [x,z] of [[0,p.wall],[p.width,p.wall],[p.width,p.height],[0,p.height]])angles.add((Math.atan2(z-cz,x-cx)+2*Math.PI)%(2*Math.PI));
 const ring=[...angles].sort((a,b)=>a-b).map(a=>{const dx=Math.cos(a),dz=Math.sin(a);const tx=dx>0?(p.width-cx)/dx:dx<0?-cx/dx:Infinity;const tz=dz>0?(p.height-cz)/dz:dz<0?(p.wall-cz)/dz:Infinity;const t=Math.min(tx,tz);return {i:[cx+r*dx,cz+r*dz],o:[cx+t*dx,cz+t*dz]};});
 const v=(a,y)=>[a[0],y,a[1]];for(let j=0;j<ring.length;j++){const a=ring[j],b=ring[(j+1)%ring.length],y=p.depth-p.wall,Y=p.depth;quad(v(a.o,y),v(b.o,y),v(b.i,y),v(a.i,y));quad(v(a.i,Y),v(b.i,Y),v(b.o,Y),v(a.o,Y));if(!(Math.abs(a.o[1]-p.wall)<1e-7&&Math.abs(b.o[1]-p.wall)<1e-7))quad(v(a.o,Y),v(b.o,Y),v(b.o,y),v(a.o,y));quad(v(a.i,y),v(b.i,y),v(b.i,Y),v(a.i,Y));}
 // Match the upright's subdivided lower boundary to the base, avoiding internal faces.
 const xs=[...new Set([0,p.width,...ring.filter(a=>Math.abs(a.o[1]-p.wall)<1e-7).map(a=>Math.max(0,Math.min(p.width,a.o[0])))].map(x=>Number(x.toFixed(7))))].sort((a,b)=>a-b);
 const y=p.depth-p.wall,Y=p.depth,z=p.wall;
 for(let j=0;j<xs.length-1;j++){const a=xs[j],b=xs[j+1];
  quad([a,0,0],[a,y,0],[b,y,0],[b,0,0]);
  quad([a,y,0],[a,Y,0],[b,Y,0],[b,y,0]);
  quad([a,0,z],[b,0,z],[b,y,z],[a,y,z]);
  quad([a,0,0],[b,0,0],[b,0,z],[a,0,z]);
  quad([b,Y,0],[a,Y,0],[a,Y,z],[b,Y,z]);
 }
 for(const [a,b] of [[0,y],[y,Y]]){quad([0,b,0],[0,a,0],[0,a,z],[0,b,z]);quad([p.width,a,0],[p.width,b,0],[p.width,b,z],[p.width,a,z]);}
 return 'solid blue_design_mount\n'+triangles.map(t=>{const u=t[1].map((v,i)=>v-t[0][i]),v=t[2].map((v,i)=>v-t[0][i]);let normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const len=Math.hypot(...normal)||1;normal=normal.map(x=>x/len);return `facet normal ${normal.join(' ')}\nouter loop\n${t.map(a=>'vertex '+a.join(' ')).join('\n')}\nendloop\nendfacet`;}).join('\n')+'\nendsolid blue_design_mount\n';
}
