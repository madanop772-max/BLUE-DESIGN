import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { robotProject } from './seed.js';
export class Store {
 constructor(dir) { this.dir=path.resolve(dir);fs.mkdirSync(this.dir,{recursive:true});this.file=path.join(this.dir,'workspace.json');this.state=fs.existsSync(this.file)?JSON.parse(fs.readFileSync(this.file,'utf8')):{schema:1,profile:{name:'Your workspace',email:'Local account'},projects:[robotProject()],snapshots:{}};this.save(); }
 save(){const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify(this.state,null,2),{mode:0o600});fs.renameSync(temp,this.file);}
 project(id){const p=this.state.projects.find(p=>p.id===id);if(!p)throw Object.assign(new Error('Project not found'),{status:404});return p;}
 change(id,title,fn,version){const p=this.project(id);if(version!==undefined&&version!==p.version)throw Object.assign(new Error('This project changed in another window. Refresh and try again.'),{status:409});const backup=structuredClone(p);try{fn(p);p.version++;p.updatedAt=new Date().toISOString();p.history.unshift({id:randomUUID(),title,at:p.updatedAt});p.history=p.history.slice(0,200);this.save();return p;}catch(e){Object.assign(p,backup);throw e;}}
 create(name,blank=false){const p=robotProject(name);if(blank){p.parts=[];p.messages=[];p.instructions=[];p.description='';}this.state.projects.unshift(p);this.save();return p;}
}
