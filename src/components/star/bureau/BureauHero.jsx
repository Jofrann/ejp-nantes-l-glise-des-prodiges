import React from 'react';
import {Link} from 'react-router-dom';
import {Settings,AlertCircle} from 'lucide-react';
export default function BureauHero({firstName,greeting,todayStr,todoCount,onScrollToActions}) {
 return <div className="maison-hero private-bureau-heading"><div><p className="private-eyebrow">{todayStr}</p><h1>{greeting}, {firstName}<span>.</span></h1><p className="private-intro">Une nouvelle journée pour grandir et servir.</p>{todoCount>0&&<button className="private-action-count" onClick={onScrollToActions}><AlertCircle aria-hidden="true"/>{todoCount} action{todoCount>1?'s':''} à traiter</button>}</div><Link to="/app/espace-personnel" className="private-customize" aria-label="Personnaliser mon bureau"><Settings aria-hidden="true"/><span>Personnaliser</span></Link></div>;
}
