import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Portal({ children, container = document.body }){
  const [mounted, setMounted] = useState(false);
  useEffect(()=>setMounted(true),[]);
  if(!mounted) return null;
  return createPortal(children, container);
}
