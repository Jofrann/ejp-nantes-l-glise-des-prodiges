import {entities,db} from './store.mjs';
import {publicImageVariant} from './media-variants.mjs';
import {resolve} from 'node:path';
const root=resolve(process.env.EJP_DATA_DIR||'.local-data','files');let generated=0;
try{for(const file of db.prepare("SELECT id FROM uploaded_files WHERE visibility='public' AND mime IN ('image/jpeg','image/png','image/webp')").all())for(const width of [640,1440]){try{await publicImageVariant(resolve(root,file.id),file.id,width);generated++;}catch{}}console.log(JSON.stringify({generated}));}finally{db.close();}
