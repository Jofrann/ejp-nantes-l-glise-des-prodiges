import test from 'node:test';
import assert from 'node:assert/strict';
import {privateSection, PRIVATE_TABS, uniqueDestinations} from './privateNavigation.js';
test('four stable destinations classify child routes without changing URLs',()=>{
 assert.equal(PRIVATE_TABS.length,4);
 for(const [path,group] of [['/app','bureau'],['/app/presences','agenda'],['/app/rendez-vous','agenda'],['/app/responsabilites/fij-coordination','service'],['/app/departements/accueil','service'],['/app/formations/a','parcours'],['/app/croissance','parcours'],['/app/parcours','parcours'],['/app/admin','bureau']])assert.equal(privateSection(path),group,path);
});
test('directory preserves every destination and search alias, including admin query routes',()=>{
 const input=[{id:'one',items:[{to:'/app',label:'Bureau',desc:'Accueil'},{to:'/app/admin',label:'Administration',desc:'Contenus'}]},{id:'two',items:[{to:'/app',label:'Actions prioritaires',desc:'Aujourd’hui'},{to:'/app/admin?tab=formations',label:'Formations',desc:'Gérer'}]}];
 const output=uniqueDestinations(input),items=output.flatMap(g=>g.items);
 assert.equal(items.length,3);assert.equal(items[0].searchTerms.includes('Actions prioritaires'),true);
 assert.deepEqual(new Set(items.map(i=>i.to)),new Set(input.flatMap(g=>g.items.map(i=>i.to))));
 assert.equal(input[0].items[0].searchTerms,undefined);
});
