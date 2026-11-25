"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api/http";
import { useLogin, useRegister } from "@/features/auth-payment/auth";

// Giới hạn giống Requests.Register / Requests.Login ở backend (BCrypt tối đa 72 byte).
const byteLength = (value: string) => new TextEncoder().encode(value).length;
const password = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự.")
  .refine((v) => byteLength(v) <= 72, "Mật khẩu tối đa 72 byte.");

const loginSchema = z.object({
  email: z.email("Email không hợp lệ.").max(254),
  password: z.string().min(1, "Nhập mật khẩu.").refine((v) => byteLength(v) <= 72, "Mật khẩu quá dài."),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nhập họ tên.").max(100, "Tối đa 100 ký tự."),
    email: z.email("Email không hợp lệ.").max(254),
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Mật khẩu nhập lại không khớp." });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

/** Chỉ cho phép quay lại đường dẫn nội bộ để tránh open redirect. */
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) return "/";
  return value;
}

export function AuthForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [tab, setTab] = useState(params.get("mode") === "register" ? "register" : "login");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</CardTitle>
        <CardDescription>Đăng nhập để giữ ghế, thanh toán và xem vé của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm next={next} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onRegistered={() => setTab("login")} next={next} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoginForm({ next, defaultEmail = "" }: { next: string; defaultEmail?: string }) {
  const router = useRouter();
  const login = useLogin();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: defaultEmail, password: "" } });

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: (user) => {
          toast.success(`Xin chào, ${user.name}!`);
          router.replace(next);
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {login.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(login.error)}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input id="login-email" type="email" autoComplete="email" {...form.register("email")} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
          <Input id="login-password" type="password" autoComplete="current-password" {...form.register("password")} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
        <Button type="submit" disabled={login.isPending}>
          {login.isPending && <Spinner />} Đăng nhập
        </Button>
      </FieldGroup>
    </form>
  );
}

function RegisterForm({ onRegistered, next }: { onRegistered: () => void; next: string }) {
  const register = useRegister();
  const login = useLogin();
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    const input = { name: values.name.trim(), email: values.email.trim(), password: values.password };
    register.mutate(input, {
      onSuccess: () =>
        // Đăng ký xong thì đăng nhập luôn cho tiện.
        login.mutate(
          { email: input.email, password: input.password },
          {
            onSuccess: (user) => {
              toast.success(`Tạo tài khoản thành công. Xin chào, ${user.name}!`);
              router.replace(next);
            },
            onError: () => {
              toast.success("Tạo tài khoản thành công. Vui lòng đăng nhập.");
              onRegistered();
            },
          },
        ),
    });
  });

  const pending = register.isPending || login.isPending;
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {register.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(register.error)}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="reg-name">Họ tên</FieldLabel>
          <Input id="reg-name" autoComplete="name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="reg-email">Email</FieldLabel>
          <Input id="reg-email" type="email" autoComplete="email" {...form.register("email")} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="reg-password">Mật khẩu</FieldLabel>
          <Input id="reg-password" type="password" autoComplete="new-password" {...form.register("password")} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.confirm}>
          <FieldLabel htmlFor="reg-confirm">Nhập lại mật khẩu</FieldLabel>
          <Input id="reg-confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
          <FieldError errors={[form.formState.errors.confirm]} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />} Tạo tài khoản
        </Button>
      </FieldGroup>
    </form>
  );
}
