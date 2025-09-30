// this is the simple badge
export default function Badge({ children }){
  return <span className="pv-badge">{children}</span>;
}

// // this is the badge with colors
// export default function Badge({ children, variant = "default" }) {
//   const colors = {
//     default: "background: var(--pv-muted-bg); color: var(--pv-fg);",
//     success: "background: #d1fae5; color: #065f46;", // green
//     danger: "background: #fee2e2; color: #991b1b;",  // red
//     warning: "background: #fef3c7; color: #92400e;", // yellow/orange
//     info: "background: #dbeafe; color: #1e40af;",    // blue
//     secondary: "background: #e5e7eb; color: #374151;", // gray
//   };

//   return (
//     <span
//       className="pv-badge"
//       style={{
//         padding: "2px 8px",
//         borderRadius: "6px",
//         fontSize: "12px",
//         fontWeight: 600,
//         ...parseInlineStyle(colors[variant] || colors.default),
//       }}
//     >
//       {children}
//     </span>
//   );
// }

// // helper: convert inline string to object
// function parseInlineStyle(styleString) {
//   return styleString.split(";").reduce((acc, item) => {
//     if (!item.trim()) return acc;
//     const [prop, value] = item.split(":");
//     acc[prop.trim()] = value.trim();
//     return acc;
//   }, {});
// }
