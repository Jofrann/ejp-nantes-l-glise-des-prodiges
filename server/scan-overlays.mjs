import {readFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';
const files=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(p,e.name)):e.name.endsWith('.jsx')?[join(p,e.name)]:[]);const report=[];
for(const file of files('src')){const code=readFileSync(file,'utf8');const fixed=(code.match(/(?<![\w-])fixed(?![\w-])/g)||[]).length;if(fixed)report.push({file,fixed,viewportOwner:code.includes('ViewportOverlay')||code.includes('app-safe-')||code.includes('Dialog')||code.includes('OverlayPortal')});}
console.log(JSON.stringify({files:files('src').length,fixedOccurrences:report.reduce((sum,r)=>sum+r.fixed,0),entries:report},null,2));
