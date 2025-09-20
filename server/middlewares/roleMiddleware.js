// const roleMiddleware = (roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//   }
//   next();
// };

// module.exports = roleMiddleware;

//roleMiddleware.js
export const ROLES = { ADMIN: 'ADMIN', STAFF: 'STAFF', CUSTOMER: 'CUSTOMER' };

export function requireRole(...allowed){
  return (req, res, next) => {
    const role = req?.user?.role;
    if(!role) return res.status(401).json({ error: 'Unauthorized' });
    if(!allowed.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
