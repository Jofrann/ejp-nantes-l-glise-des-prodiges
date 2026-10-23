import {entities,db} from './store.mjs';
import {calendarSettings,ensureRecurringCalendar} from './calendar.mjs';
const rename=value=>value.replace(/\bLe culte\b/g,'Prodiges Expérience').replace(/\ble culte\b/g,'Prodiges Expérience').replace(/\bCulte\b/g,'Prodiges Expérience').replace(/Prochain culte/g,'Prochaine Prodiges Expérience').replace(/au culte/g,'à Prodiges Expérience').replace(/du culte/g,'de Prodiges Expérience').replace(/premier culte/g,'première Prodiges Expérience');
try{
 const config=(await entities.ChurchConfig.list())[0];if(config){const copy={...config.public_copy};for(const [key,value] of Object.entries(copy))if(typeof value==='string'&&/culte|Prodiges Expérience/i.test(value))copy[key]=rename(value).replace(/15h00|15h\b|15:00/g,'14h30');await entities.ChurchConfig.update(config.id,{service_day:'Dimanche',service_time:'14:30',...(config.culte_time?{culte_time:'14h30'}:{}),public_copy:copy});}
 const settings=await calendarSettings();if(!settings.id)await entities.CalendarSchedule.create({...settings,key:'ejp'});
 let renamed=0;for(const event of await entities.Event.list(null,100000))if(event.event_type==='culte'&&event.title!=='Prodiges Expérience'){await entities.Event.update(event.id,{title:'Prodiges Expérience'});renamed++;}
 await ensureRecurringCalendar();console.log(JSON.stringify({success:true,renamed,recurrences:(await entities.Event.list(null,100000)).filter(e=>e.recurrence_key).length}));
}finally{db.close();}
