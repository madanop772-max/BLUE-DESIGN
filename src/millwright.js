import { spawn } from 'node:child_process';
import readline from 'node:readline';
export class Millwright {
 constructor(config=process.env){this.config=config;this.pending=new Map();this.next=0;this.child=null;}
 start(){if(this.child)return;if(!this.config.MILLWRIGHT_SIDECAR)throw Object.assign(new Error('Millwright is not configured. Set MILLWRIGHT_SIDECAR in blueprint/.env.'),{status:503});
  const child=spawn(this.config.PYTHON||'python',['-B','-m','sw_agent'],{cwd:this.config.MILLWRIGHT_SIDECAR,env:{...process.env,PYTHONIOENCODING:'utf-8',PYTHONDONTWRITEBYTECODE:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});this.child=child;
  const fail=()=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('Millwright sidecar stopped. Check Python and sidecar path.'));}this.pending.clear();this.child=null;};child.on('error',fail);child.on('exit',fail);child.stdin.on('error',()=>{});child.stderr.on('data',()=>{});
  readline.createInterface({input:child.stdout}).on('line',line=>{try{const r=JSON.parse(line),p=this.pending.get(r.id);if(!p||r.progress||r.type==='progress')return;if(r.ok===undefined)return;clearTimeout(p.timer);this.pending.delete(r.id);r.ok?p.resolve(r.data):p.reject(new Error(r.error||'Millwright operation failed'));}catch{}});
 }
 request(method,params={}){this.start();return new Promise((resolve,reject)=>{const id=++this.next;const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Millwright timed out. Check that SolidWorks is running.'));this.close();},20000);this.pending.set(id,{resolve,reject,timer});this.child.stdin.write(JSON.stringify({id,method,params})+'\n');});}
 close(){this.child?.stdin.end();this.child?.kill();this.child=null;}
}
