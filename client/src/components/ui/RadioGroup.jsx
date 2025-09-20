import { useId } from "react";

export default function RadioGroup({ name, label, options=[], value, onChange }){
  const gid = useId();
  return (
    <div className="pv-col">
      {label && <span className="pv-label">{label}</span>}
      {options.map((opt, i)=>(
        <label key={i} htmlFor={`${gid}-${i}`} className="pv-row" style={{cursor:"pointer"}}>
          <input
            id={`${gid}-${i}`} type="radio" name={name}
            checked={value === opt.value}
            onChange={()=>onChange?.(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
