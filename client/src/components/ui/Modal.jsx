import { useEffect, useRef } from "react";
import Portal from "./Portal";
import Button from "./Button";

export default function Modal({ isOpen, onClose, title, children, footer, closeOnOverlay=true }){
  const dialogRef = useRef(null);

  useEffect(()=>{
    function onKey(e){ if(e.key === "Escape") onClose?.(); }
    if(isOpen){ document.addEventListener('keydown', onKey); document.body.style.overflow='hidden'; }
    return ()=>{ document.removeEventListener('keydown', onKey); document.body.style.overflow=''; };
  },[isOpen, onClose]);

  if(!isOpen) return null;

  return (
    <Portal>
      <div className="pv-overlay" onClick={e=>{ if(e.target === e.currentTarget && closeOnOverlay) onClose?.(); }}>
        <div className="pv-modal" role="dialog" aria-modal="true" ref={dialogRef}>
          {title && <div className="pv-modal-header">{title}</div>}
          <div className="pv-modal-body">{children}</div>
          <div className="pv-modal-footer">
            {footer ?? (<Button variant="ghost" onClick={onClose}>Close</Button>)}
          </div>
        </div>
      </div>
    </Portal>
  );
}
