export default function IconButton({ title, children, variant="ghost", ...props }){
  return (
    <button aria-label={title} title={title} className={`pv-btn ${variant}`} {...props}>
      {children}
    </button>
  );
}
