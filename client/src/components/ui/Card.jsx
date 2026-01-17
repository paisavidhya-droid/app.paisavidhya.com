// card with title and actions and leftActions
export default function Card({ title, children, actions, leftActions, style }) {
  return (
    <section className="pv-card" style={{ padding: 16, ...style }}>
      {(title || actions || leftActions) && (
        <header
          className="pv-row"
          style={{
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
            gap: 12,
            minHeight: 40,
          }}
        >
          <div className="pv-row" style={{ gap: 12, alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
              {leftActions}
            </div>
          </div>

          <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
            {actions}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}




// normal card with title and actions
// export default function Card({ title, children, actions, style }){
//   return (
//     <section className="pv-card" style={{ padding: 16, ...style }}>
//       {(title || actions) && (
//         <header className="pv-row" style={{justifyContent:'space-between', marginBottom:12}}>
//           <h3 style={{margin:0}}>{title}</h3>
//           <div className="pv-row">{actions}</div>
//         </header>
//       )}
//       {children}
//     </section>
//   );
// }
