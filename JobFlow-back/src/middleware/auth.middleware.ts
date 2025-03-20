import type { NextFunction, Request, Response } from "express";
import type { Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { AuthRequest, UserJwtPaylod } from "../types/authTypes";
const { JWT_SECRET } = process.env;

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader =
      req.header("Authorization") || req.header("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      console.log(`auth.middleware: no token provided`);
      return res.status(401).json("Access denied");
    }
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as UserJwtPaylod;
    (req as AuthRequest).userId = decoded._id;
    next();
  } catch (error) {
    console.log(
      `auth.middleware: could not verify token`,
      (error as Error).message
    );
    res.status(401).json("Invalid token");
  }
}
