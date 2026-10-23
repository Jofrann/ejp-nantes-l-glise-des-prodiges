import {createServer} from 'node:net';
// Let the OS choose an available port, including on Windows with excluded port ranges.
export async function freePort(){const server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const port=server.address().port;await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));return port;}
