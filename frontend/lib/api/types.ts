export type Role = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface CsrfToken {
  token: string;
  headerName: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
