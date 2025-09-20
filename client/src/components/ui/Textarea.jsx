export default function Textarea({ label, rows=4, ...props }){
  return (
    <div className="pv-col">
      {label && <label className="pv-label">{label}</label>}
      <textarea rows={rows} className="pv-textarea" {...props} />
    </div>
  );
}
