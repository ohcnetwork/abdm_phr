import { HTTPError } from "@/utils/request/types";
import type { ApiCallOptions, ApiRoute } from "@/utils/request/types";
import { getResponseBody, makeHeaders, makeUrl } from "@/utils/request/utils";

const BASE_URL = import.meta.env.REACT_CARE_API_URL;
const SUB_PATH = "/api/abdm/v3";

async function callApi<Route extends ApiRoute<unknown, unknown>>(
  { path, method, noAuth }: Route,
  options?: ApiCallOptions<Route>,
): Promise<Route["TRes"]> {
  const url = `${BASE_URL}${SUB_PATH}${makeUrl(
    path,
    options?.queryParams,
    options?.pathParams,
  )}`;

  const fetchOptions: RequestInit = {
    method,
    headers: makeHeaders(noAuth ?? false, options?.headers),
    signal: options?.signal,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    const data = await getResponseBody<Route["TRes"]>(res);

    if (!res.ok) {
      throw new HTTPError({
        message: "Request Failed",
        status: res.status,
        silent: options?.silent ?? false,
        cause: data as Record<string, unknown>,
      });
    }

    return data;
  } catch (err) {
    if (err instanceof HTTPError) throw err;
    throw new Error("Network Error");
  }
}

export function query<Route extends ApiRoute<unknown, unknown>>(
  route: Route,
  options?: ApiCallOptions<Route>,
) {
  return ({ signal }: { signal: AbortSignal }) =>
    callApi(route, { ...options, signal });
}

export function mutate<Route extends ApiRoute<unknown, unknown>>(
  route: Route,
  options?: ApiCallOptions<Route>,
) {
  return (variables: Route["TBody"]) =>
    callApi(route, { ...options, body: variables });
}
