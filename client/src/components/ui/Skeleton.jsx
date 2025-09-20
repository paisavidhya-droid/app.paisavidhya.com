export default function Skeleton({ height=14, width='100%', radius=10, className='' }){
  return <div className={`pv-skeleton ${className}`} style={{height, width, borderRadius:radius}} />;
}
