import {createPortal} from 'react-dom';
export default function OverlayPortal({children}){return createPortal(children,document.body);}
