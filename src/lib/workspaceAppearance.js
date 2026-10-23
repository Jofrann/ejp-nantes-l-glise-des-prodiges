export const APPEARANCE_DEFAULTS = { appearance_mode:'light', reduce_motion:false, accent_color:'blue', display_density:'comfortable', default_agenda_view:'list' };
export const APPEARANCE_ACCENTS = [
 {key:'gold',label:'Doré EJP',hue:40,saturation:55,light:30,swatch:'#977225'},
 {key:'blue',label:'Bleu nuit',hue:204,saturation:52,light:28,swatch:'#22516d'},
 {key:'green',label:'Vert paix',hue:153,saturation:44,light:27,swatch:'#27634a'},
 {key:'rose',label:'Rose douceur',hue:338,saturation:50,light:36,swatch:'#8a2e50'},
 {key:'purple',label:'Violet formation',hue:267,saturation:42,light:37,swatch:'#58377f'},
];
export function normalizeAppearance(value={}) {
 return {appearance_mode:['light','dark','system'].includes(value.appearance_mode)?value.appearance_mode:'light',reduce_motion:value.reduce_motion===true,accent_color:APPEARANCE_ACCENTS.some(a=>a.key===value.accent_color)?value.accent_color:'blue',display_density:value.display_density==='compact'?'compact':'comfortable',default_agenda_view:['day','week','month','list'].includes(value.default_agenda_view)?value.default_agenda_view:'list'};
}
export function appearanceTokens(settings,dark) {
 const a=APPEARANCE_ACCENTS.find(a=>a.key===settings.accent_color)||APPEARANCE_ACCENTS[1];
 const foreground=`${a.hue} ${a.saturation}% ${dark?76:a.light}%`;
 return {'--primary':foreground,'--secondary':foreground,'--ring':foreground,'--primary-foreground':dark?'210 54% 17%':'0 0% 100%','--secondary-foreground':dark?'210 54% 17%':'0 0% 100%','--private-gold':`hsl(${foreground})`,'--star-accent':`hsl(${foreground})`,'--star-accent-soft':`hsl(${a.hue} 35% 70%)`,'--private-sage':`hsl(${a.hue} ${dark?18:24}% ${dark?23:92}%)`,'--private-hero':`linear-gradient(130deg,hsl(${a.hue} 45% 17%),hsl(${a.hue} 30% 32%))`,'--private-action-accent':`hsl(${a.hue} 40% 78%)`};
}
