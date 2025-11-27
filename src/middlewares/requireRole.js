import { bad} from "../helpers/helpers.js"; 

export function requireRole(roleName) {
  return (req, res, next) => {
  
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];

    const hasRole = userRoles.some(
      (r) => String(r).toUpperCase().trim() === String(roleName).toUpperCase().trim()
    );

    if (!hasRole) {
      return bad(res, `Acceso denegado. Se requiere el rol: ${roleName}`);
    }

    next();
  };
}