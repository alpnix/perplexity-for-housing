// hooks/useAPiCall.ts
/* eslint-disable no-unused-vars */
import { getCookie, removeCookie } from "@/lib/utils";
import useUserStore from "@/store/userStore";
import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export const useFetch = async (
  url: string,
  method: string,
  data?: any,
  customHeaders?: HeadersInit
): Promise<Response> => {
  const token = getCookie("token") || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const clearUser = useUserStore.getState().clearUser;

  const defaultHeaders: HeadersInit = {};
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const headers: any = {
    ...defaultHeaders,
    ...customHeaders,
  };

  let body: BodyInit | undefined;
  if (data) {
    if (data instanceof FormData) {
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  if (response.status === 401) {
    console.warn("Unauthorized request. Logging out user...");
    clearUser();
    removeCookie("token");
  }

  return response;
};


export const useMutate = <TData = any, TError = Error, TVariables = any, TContext = unknown>(
  createFn: (data: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn">
): UseMutationResult<TData, TError, TVariables, TContext> & {
  res: (data: TVariables) => Promise<void>;
} => {
  const mutation = useMutation<TData, TError, TVariables, TContext>({
    mutationFn: createFn,
    ...options,
  });

  const res = async (data: TVariables) => {
    await mutation.mutateAsync(data);
  };

  return {
    ...mutation,
    res,
  };
};