export default function Checkbox({ label, ...props }){
  return (
    <label className="pv-row" style={{cursor:"pointer"}}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
