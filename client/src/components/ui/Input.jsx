export default function Input({ label, hint, error, ...props }){
  return (
    <div className="pv-col">
      {label && <label className="pv-label">{label}</label>}
      <input className="pv-input" {...props} />
      {hint && !error && <small style={{color:"var(--pv-dim)"}}>{hint}</small>}
      {error && <small style={{color:"var(--pv-danger)"}}>{error}</small>}
    </div>
  );
}
