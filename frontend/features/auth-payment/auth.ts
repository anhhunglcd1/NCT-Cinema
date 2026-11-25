"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api, ApiError, resetCsrf } from "@/lib/api/http";
import type { LoginInput, RegisterInput, User } from "@/lib/api/types";

const meKey = ["auth", "me"] as const;

/** Các query chứa dữ liệu riêng của tài khoản, phải xóa khi đổi/đăng xuất tài khoản. */
const PRIVATE_KEYS = [["tickets"], ["ticket"], ["payment"], ["admin"]] as const;

async function fetchMe(): Promise<User | null> {
  try {
    return await api<User>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: fetchMe, staleTime: 60_000 });
}

function clearPrivateState(client: QueryClient) {
  for (const key of PRIVATE_KEYS) client.removeQueries({ queryKey: key });
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api<User>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: (user) => {
      // Đăng nhập đổi session id và CSRF token phía server.
      resetCsrf();
      clearPrivateState(client);
      client.setQueryData(meKey, user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api<User>("/api/auth/register", { method: "POST", body: input }),
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ message: string }>("/api/auth/logout", { method: "POST" }),
    onSettled: () => {
      resetCsrf();
      clearPrivateState(client);
      client.setQueryData(meKey, null);
    },
  });
}
