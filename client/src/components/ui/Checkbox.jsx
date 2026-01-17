export default function Checkbox({ label, onClick, ...props }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e); // ✅ preserve consumer onClick
  };

  return (
    <label
      className="pv-row"
      style={{
        cursor: "pointer",
        gap: 8,
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        {...props}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}


// export default function Checkbox({ label, ...props }){
//   return (
//     <label className="pv-row" style={{cursor:"pointer"}}>
//       <input style={{cursor:"pointer"}} type="checkbox" {...props} />
//       <span>{label}</span>
//     </label>
//   );
// }
