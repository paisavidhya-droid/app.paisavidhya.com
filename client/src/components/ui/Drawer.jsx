import { useEffect } from "react";
import Portal from "./Portal";

export default function Drawer({ isOpen, onClose, side="right", children }){
   useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);
  if(!isOpen) return null;
  const style = side === 'right' ? {right:0} : {left:0};
  return (
    <Portal>
      <div className="pv-overlay" onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
        <div className="pv-drawer" style={style}>
          {children}
        </div>
      </div>
    </Portal>
  );
}
