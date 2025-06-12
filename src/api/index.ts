import { login, register } from "@/api/auth";
import { utility } from "@/api/utility";

const routes = {
  register,
  login,
  utility,
} as const;

export default routes;
