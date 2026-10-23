import {createContext,useContext,useState,useEffect,useMemo,useCallback} from 'react';
import {base44} from '@/api/base44Client';
import {normalizeAppearance,appearanceTokens,APPEARANCE_DEFAULTS} from '@/lib/workspaceAppearance';
export const WorkspaceAppearanceContext=createContext(null);
export const useWorkspaceAppearance=()=>useContext(WorkspaceAppearanceContext);
function cached(userId){try{return userId?JSON.parse(localStorage.getItem('ejp-appearance:'+userId)||'null'):null;}catch{return null;}}
export function useAppearanceController(userId){
 const [stored,setStored]=useState(()=>cached(userId)),[preview,setPreview]=useState(null),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const m=window.matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystemDark(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change);},[]);
 useEffect(()=>{let current=true;setStored(cached(userId));setPreview(null);setReady(false);if(!userId)return;
 base44.personal['UserWorkspacePreference'].list('-updated_date',1).then(rows=>{if(current){setStored(rows[0]||null);setReady(true);}}).catch(()=>{if(current){setReady(true);setError('Les préférences ne peuvent pas être chargées.');}});return()=>{current=false;};},[userId]);
 useEffect(()=>{if(stored&&userId){try{localStorage.setItem('ejp-appearance:'+userId,JSON.stringify(normalizeAppearance(stored)));}catch{/* Local cache is optional. */}}},[stored,userId]);
 const previewAppearance=useCallback(value=>setPreview(value),[]),clearPreview=useCallback(()=>setPreview(null),[]);
 const commitPreferences=useCallback(value=>{setStored(value);setPreview(null);setError('');},[]);
 const settings=normalizeAppearance(preview||stored||{}),theme=settings.appearance_mode==='system'?(systemDark?'dark':'light'):settings.appearance_mode;
 const tokens=useMemo(()=>appearanceTokens(settings,theme==='dark'),[settings.accent_color,theme]);
 useEffect(()=>{document.body.dataset.privateTheme=theme;document.body.dataset.privateDensity=settings.display_density;if(settings.reduce_motion)document.body.dataset.privateCalm='true';else delete document.body.dataset.privateCalm;
 for(const [key,value]of Object.entries(tokens))document.body.style.setProperty(key,value);
 return()=>{delete document.body.dataset.privateTheme;delete document.body.dataset.privateDensity;delete document.body.dataset.privateCalm;for(const key of Object.keys(tokens))document.body.style.removeProperty(key);};},[theme,settings.display_density,settings.reduce_motion,tokens]);
 const saveAppearancePatch=async patch=>{if(saving||!ready)return;setSaving(true);setError('');try{const rows=await base44.personal['UserWorkspacePreference'].list('-updated_date',1);const result=rows[0]?.id?await base44.personal['UserWorkspacePreference'].update(rows[0].id,patch):await base44.personal['UserWorkspacePreference'].create({...APPEARANCE_DEFAULTS,...patch});commitPreferences(result);}catch(e){setError(e.message||'Les préférences n’ont pas été enregistrées.');}finally{setSaving(false);}};
 return {settings,theme,tokens,stored,ready,saving,error,previewAppearance,clearPreview,commitPreferences,saveAppearancePatch};
}
