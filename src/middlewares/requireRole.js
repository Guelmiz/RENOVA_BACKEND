import { bad } from "../helpers/helpers.js";

export function requireRole(roleName) {
  return (req, res, next) => {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const hasRole = roles.some(
      (r) => String(r).toLowerCase() === String(roleName).toLowerCase()
    );
    if (!hasRole) return bad(res, `Requiere rol: ${roleName}`);
    next();
  };
}
