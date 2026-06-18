export interface MyJwtPayload {
  userId: string;
  roleId: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthPayload {
  userId: string;
  roleId: string;
}
