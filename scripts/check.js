import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const files=[];
for(const dir of ['src','public','test'])for(const name of fs.readdirSync(dir))if(name.endsWith('.js'))files.push(path.join(dir,name));
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
console.log(`Syntax checked ${files.length} JavaScript files.`);
