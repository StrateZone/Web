import NextAuth from "next-auth";

export type User = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
};

declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    role: string;
    fullName: string;
    accessToken: string;
  }
}
