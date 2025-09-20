export default function Button({ children, variant="primary", as="button", className="", ...props }){
  const Comp = as;
  return (
    <Comp className={`pv-btn ${variant} ${className}`} {...props}>
      {children}
    </Comp>
  );
}
