import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(await readFile(path.join(root,'cms-publication.json'),'utf8'));
if(expected.version!==1 || !/^[a-f0-9]{32}$/.test(expected.release) || !/^[a-f0-9]{64}$/.test(expected.hash)) throw Error('Invalid publication manifest');
const files={};
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlink in output');if(e.isDirectory())await walk(f);else if(e.isFile()){const rel=path.relative(path.join(root,'.site'),f).replaceAll('\\','/');if(rel!=='cms-version.json')files[rel]=hash(await readFile(f));}}}
await walk(path.join(root,'.site'));
const canonical=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a<b?-1:a>b?1:0));
if(JSON.stringify(canonical)!==JSON.stringify(expected.files) || hash(JSON.stringify(canonical))!==expected.hash) throw Error('Output differs from reviewed candidate; deployment blocked');
await writeFile(path.join(root,'.site/cms-version.json'),JSON.stringify({version:1,release:expected.release,hash:expected.hash}));
console.log('Reviewed publication verified: '+expected.hash);
