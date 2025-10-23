export default function Progress({ value=0 }){
  return (
    <div style={{width:'100%', height:10, background:'var(--pv-border)', border:'1px solid var(--pv-border)', borderRadius:999}}>
      <div style={{height:'100%', width:`${Math.min(100, Math.max(0, value))}%`, background:'var(--pv-primary)', borderRadius:999}}/>
    </div>
  );
}
