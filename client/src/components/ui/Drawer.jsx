import Portal from "./Portal";

export default function Drawer({ isOpen, onClose, side="right", children }){
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
