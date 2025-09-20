export default function Switch({ checked, onChange, label }){
  return (
    <label className="pv-row" style={{cursor:"pointer"}}>
      <span
        role="switch" aria-checked={checked}
        onClick={()=>onChange?.(!checked)}
        style={{
          width:44, height:26, background:checked?'var(--pv-primary)':'#334155',
          borderRadius:999, position:'relative', transition:'all var(--pv-fast)'
        }}
      >
        <span style={{
          position:'absolute', top:3, left:checked?22:3, width:20, height:20, borderRadius:999, background:'#fff',
          transition:'all var(--pv-fast)'
        }}/>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
