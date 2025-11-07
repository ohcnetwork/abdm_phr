import { useRoutes } from "raviger";

import SessionExpired from "@/components/errors/SessionExpired";

import LoginAbha from "@/pages/auth/Login";
import RegisterAbha from "@/pages/auth/Register";

import { AppRoutes } from "./types";

export const Routes: AppRoutes = {
  "/login": () => <LoginAbha />,
  "/register": () => <RegisterAbha />,

  "/session-expired": () => <SessionExpired />,
};

export default function PublicRouter() {
  const pages = useRoutes(Routes) || <LoginAbha />;

  return <>{pages}</>;
}
