export default function Select({ label, children, ...props }){
  return (
    <div className="pv-col">
      {label && <label className="pv-label">{label}</label>}
      <select className="pv-select" {...props}>{children}</select>
    </div>
  );
}
