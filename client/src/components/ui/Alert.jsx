export default function Alert({ type="info", title, children }){
  const colors = {
    info: '#0ea5e9',
    success: 'var(--pv-success)',
    warning: 'var(--pv-warning)',
    danger: 'var(--pv-danger)',
    error: 'var(--pv-danger)',
  };
  return (
    <div className="pv-card" style={{padding:12, borderLeft:`4px solid ${colors[type]}`}}>
      {title && <div style={{fontWeight:700, marginBottom:6}}>{title}</div>}
      <div style={{color:'var(--pv-dim)'}}>{children}</div>
    </div>
  );
}
