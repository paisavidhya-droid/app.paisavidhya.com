import Button from "./Button";

export default function Pagination({ page=1, total=1, onChange }){
  const prev = ()=>onChange?.(Math.max(1, page-1));
  const next = ()=>onChange?.(Math.min(total, page+1));
  return (
    <div className="pv-pagination">
      <Button variant="ghost" onClick={prev} disabled={page===1}>Prev</Button>
      <span style={{color:'var(--pv-dim)'}}>Page {page} of {total}</span>
      <Button variant="ghost" onClick={next} disabled={page===total}>Next</Button>
    </div>
  );
}
