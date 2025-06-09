import { createContext, useContext } from "react";

import { PhrVerifyUserBody } from "@/types/auth";

interface AuthContextType {
  user: any;
  verifyUser: (payload: PhrVerifyUserBody) => void;
  isVerifyingUser: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("'useAuthContext' must be used within 'AuthProvider' only");
  }
  return ctx;
};

export default function useAuth() {
  const user = useAuthContext().user;
  if (!user) {
    throw new Error("'useAuth' must be used within 'PrivateRouter' only");
  }
  return user;
}
