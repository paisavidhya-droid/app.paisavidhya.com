export default function Card({ title, children, actions, style }){
  return (
    <section className="pv-card" style={{ padding: 16, ...style }}>
      {(title || actions) && (
        <header className="pv-row" style={{justifyContent:'space-between', marginBottom:12}}>
          <h3 style={{margin:0}}>{title}</h3>
          <div className="pv-row">{actions}</div>
        </header>
      )}
      {children}
    </section>
  );
}
