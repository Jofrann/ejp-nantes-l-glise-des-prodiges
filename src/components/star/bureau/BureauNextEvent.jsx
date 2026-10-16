import React from 'react';
import {Link} from 'react-router-dom';
import {Calendar, Clock, MapPin, ArrowRight, CheckCircle} from 'lucide-react';
export default function BureauNextEvent({events=[],responses=[]}) {
 const event=[...events].sort((a,b)=>`${a.event_date} ${a.event_time||''}`.localeCompare(`${b.event_date} ${b.event_time||''}`))[0];
 const response=event&&responses.find(row=>row.event_id===event.id);
 const date=event?new Date(`${event.event_date}T00:00:00`):null;
 return <section className="private-next-event" aria-label="Prochain rendez-vous"><div className="private-next-top"><div><p className="private-eyebrow">TON PROCHAIN RENDEZ-VOUS</p><h2>{event?.title||'La maison se prépare à te retrouver.'}</h2></div>{date&&<div className="private-event-date"><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('fr-FR',{month:'short'})}</span></div>}</div>{event?<div className="private-event-meta"><span><Calendar/>{date.toLocaleDateString('fr-FR',{weekday:'long'})}</span>{event.event_time&&<span><Clock/>{event.event_time}</span>}{event.location&&<span><MapPin/>{event.location}</span>}</div>:<p className="private-next-empty">Aucun programme à venir pour le moment. Retrouve ton agenda et tes occupations personnelles.</p>}<div className="private-next-footer"><span>{response?<><CheckCircle/> Réponse enregistrée : {({present:'présent',absent:'absent',late:'en retard'})[response.status]||response.status}</>:event?'Ta réponse permet à ton équipe de s’organiser.':'Chaque rendez-vous compte.'}</span><Link to={event?'/app/presences':'/app/agenda'}>{event?response?'Mes présences':'Répondre à l’invitation':'Ouvrir mon agenda'}<ArrowRight/></Link></div></section>;
}
