import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBaseIdentifier,generateUniqueIdentifier } from '../base44/shared/identityUtils.ts';
test('lot 09: specified identity, legacy aliases, homonyms and no duplicate identity',async()=>{
 assert.equal(generateBaseIdentifier('Éloïse','Dupont'),'eloise@prodiges');
 const users=[{id:'old',internal_identifier:'Eloise@prodige'},{id:'second',internal_identifier:'eloise.dupont@prodiges'}];
 const client={asServiceRole:{entities:{User:{list:async()=>users}}}};
 assert.equal(await generateUniqueIdentifier(client,'Eloise','Dupont'),'eloise2@prodiges');
 assert.equal(await generateUniqueIdentifier(client,'Eloise','Dupont','old'),'eloise@prodiges');
});
