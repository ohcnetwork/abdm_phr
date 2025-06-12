import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AuthContext } from "@/hooks/useAuth";

import routes from "@/api";
import { mutate } from "@/utils/request/request";

interface Props {
  publicRouter: React.ReactNode;
  privateRouter: React.ReactNode;
}

export default function AuthUserProvider({
  publicRouter,
  privateRouter,
}: Props) {
  const [user, _] = useState<any>(null);

  const { mutate: verifyUser, isPending: isVerifyingUser } = useMutation({
    mutationFn: mutate(routes.login.verifyUser),
    onSuccess: () => {
      toast.success("Verified User successfully!");
      //TODO: Save the token and redirect to the home page
    },
    onError: () => toast.error("Session expired. Please try again."),
  });

  const { mutate: verifyPassword, isPending: isVerifyingPassword } =
    useMutation({
      mutationFn: mutate(routes.login.verifyPassword),
      onSuccess: () => {
        toast.success("Password verified successfully!");
        //TODO: Save the token and redirect to the home page
      },
      onError: () => toast.error("Failed to verify password."),
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        verifyUser,
        isVerifyingUser,
        verifyPassword,
        isVerifyingPassword,
      }}
    >
      {user ? privateRouter : publicRouter}
    </AuthContext.Provider>
  );
}
