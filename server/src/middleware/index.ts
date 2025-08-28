import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type RoleName = 'ADMIN' | 'USER' | 'OWNER';

export type JwtPayload = {
  sub: string;
  role: RoleName;
};

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET || '';
    if (!secret) return res.status(500).json({ message: 'Server misconfigured' });
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRoles = (...roles: RoleName[]) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };

// Optional auth: attach user if a valid token is provided; otherwise continue
export const optionalAuth = (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
  } catch {
    // ignore invalid/expired token
  }
  next();
};
