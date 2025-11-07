import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { navigate } from "raviger";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthContext } from "@/hooks/useAuth";

import { REFRESH_TOKEN_REFETCH_INTERVAL } from "@/common/constants";
import GlobalLoader from "@/common/loaders/GlobalLoader";

import routes from "@/api";
import { VerifyAuthResponse } from "@/types/auth";
import { TokenStorage } from "@/utils";
import { mutate, query } from "@/utils/request/request";

interface Props {
  publicRouter: React.ReactNode;
  privateRouter: React.ReactNode;
}

export default function AuthUserProvider({
  publicRouter,
  privateRouter,
}: Props) {
  const queryClient = useQueryClient();

  const [switchProfileEnabled, setSwitchProfileEnabled] = useState(
    TokenStorage.getSwitchProfileEnabled(),
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: query(routes.profile.getProfile, { silent: true }),
    retry: false,
    enabled: !!TokenStorage.getAccessToken(),
  });

  const tokenRefreshQuery = useQuery({
    queryKey: ["refresh-token"],
    queryFn: ({ signal }) => {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        return;
      }
      return query(routes.login.refreshAccessToken, {
        body: { refresh: refreshToken || "" },
      })({ signal });
    },
    refetchIntervalInBackground: true,
    refetchInterval: REFRESH_TOKEN_REFETCH_INTERVAL,
    enabled: !!TokenStorage.getRefreshToken() && !!user,
  });

  useEffect(() => {
    if (tokenRefreshQuery.isError) {
      TokenStorage.clear();
      return;
    }

    if (tokenRefreshQuery.data) {
      const { access_token, refresh_token } = tokenRefreshQuery.data;
      TokenStorage.setTokens(access_token, refresh_token);
    }
  }, [tokenRefreshQuery.data, tokenRefreshQuery.isError]);

  const handleAuthSuccess = useCallback(
    async (data: VerifyAuthResponse) => {
      const { access_token, refresh_token } = data;
      TokenStorage.setTokens(access_token, refresh_token);
      TokenStorage.setSwitchProfileEnabled(data.switchProfileEnabled);

      setSwitchProfileEnabled(data.switchProfileEnabled);

      await queryClient.invalidateQueries({ queryKey: ["user"] });

      navigate("/");
    },
    [setSwitchProfileEnabled, queryClient, navigate],
  );

  const { mutate: verifyUser, isPending: isVerifyingUser } = useMutation({
    mutationFn: mutate(routes.login.verifyUser),
    onSuccess: (data: VerifyAuthResponse) => {
      toast.success("User Verified successfully!");
      handleAuthSuccess(data);
    },
  });

  const { mutate: verifyPassword, isPending: isVerifyingPassword } =
    useMutation({
      mutationFn: mutate(routes.login.verifyPassword),
      onSuccess: (data: VerifyAuthResponse) => {
        toast.success("Password verified successfully!");
        handleAuthSuccess(data);
      },
    });

  const logout = useCallback(
    async (showToast = true) => {
      try {
        const accessToken = TokenStorage.getAccessToken();
        const refreshToken = TokenStorage.getRefreshToken();

        if (accessToken && refreshToken) {
          const response = await mutate(routes.profile.logout)({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (showToast) {
            toast.success(response.detail);
          }
        }
      } catch (error) {
        console.log("Logout error:", error);
      }

      TokenStorage.clear();

      await Promise.all([
        queryClient.resetQueries({ queryKey: ["user"] }),
        queryClient.resetQueries({ queryKey: ["patientLinks"] }),
      ]);

      navigate("/login");
    },
    [queryClient, navigate, mutate],
  );

  useEffect(() => {
    const handleInvalidToken = (e: StorageEvent) => {
      if (e.key === "access_token" && e.oldValue && !e.newValue) {
        logout();
      }
    };

    window.addEventListener("storage", handleInvalidToken);

    return function cleanup() {
      window.removeEventListener("storage", handleInvalidToken);
    };
  }, [logout]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        switchProfileEnabled,
        verifyUser,
        isVerifyingUser,
        verifyPassword,
        isVerifyingPassword,
        handleAuthSuccess,
        logout,
      }}
    >
      {user ? privateRouter : publicRouter}
    </AuthContext.Provider>
  );
}
