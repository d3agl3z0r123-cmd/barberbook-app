"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DataPreview,
  EmptyState,
  InternalShell,
  SectionCard,
  StatusNotice,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app-ui";
import { apiUrl } from "@/lib/api-url";

const TOKEN_STORAGE_KEY = "token";
const TOKEN_TYPE_STORAGE_KEY = "token_type";

type ApiState = {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
};

async function parseApiResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export default function AuthTestPage() {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [token, setToken] = useState("");
  const [storedToken, setStoredToken] = useState("");
  const [storedTokenType, setStoredTokenType] = useState("");
  const [responsePayload, setResponsePayload] = useState<string>("");
  const [status, setStatus] = useState<ApiState>({
    kind: "idle",
    title: "Pronto para testar",
    body: "Usa os formularios abaixo para chamar o backend Laravel.",
  });
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedTokenType = window.localStorage.getItem(TOKEN_TYPE_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    setStoredToken(storedToken ?? "");
    setStoredTokenType(storedTokenType ?? "");
  }, []);

  useEffect(() => {
    if (!token) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY);
      setStoredToken("");
      setStoredTokenType("");
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setStoredToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");
  }, [token]);

  const prettyToken = useMemo(() => {
    if (!storedToken) return "Sem token guardado ainda.";

    return storedToken;
  }, [storedToken]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingRegister(true);

    try {
      const response = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          password_confirmation: registerForm.passwordConfirmation,
          role: "client",
        }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro no registo",
          body: "O backend devolveu um erro ao tentar criar o utilizador.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      if (payload?.token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
        setStoredToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");
      }
      if (payload?.token_type) {
        window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, payload.token_type);
        setStoredTokenType(window.localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) ?? "");
      }

      setToken(payload?.token ?? "");
      setStatus({
        kind: "success",
        title: "Registo concluido",
        body: "O utilizador foi criado com sucesso no Laravel.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmittingRegister(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingLogin(true);

    try {
      const response = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          device_name: "next-auth-test",
        }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro no login",
          body: "O backend devolveu um erro ao autenticar o utilizador.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      if (payload?.token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
      }
      if (payload?.token_type) {
        window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, payload.token_type);
      }

      const localStorageToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
      const localStorageTokenType = window.localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) ?? "";

      setStoredToken(localStorageToken);
      setStoredTokenType(localStorageTokenType);
      setToken(localStorageToken);
      setStatus({
        kind: "success",
        title: "Login concluido",
        body: "Recebeste um token Bearer valido do Laravel.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleFetchUser() {
    if (!token) {
      setStatus({
        kind: "error",
        title: "Sem token",
        body: "Faz primeiro registo ou login para obter um token.",
      });
      return;
    }

    setIsLoadingUser(true);

    try {
      const response = await fetch(apiUrl("/user"), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao ler utilizador",
          body: "O backend nao conseguiu devolver o utilizador autenticado.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setStatus({
        kind: "success",
        title: "Utilizador autenticado",
        body: "O token atual foi aceite pelo backend Laravel.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsLoadingUser(false);
    }
  }

  async function handleLogout() {
    if (!token) {
      setStatus({
        kind: "error",
        title: "Sem token",
        body: "Nao existe token para terminar sessao.",
      });
      return;
    }

    setIsSubmittingLogout(true);

    try {
      const response = await fetch(apiUrl("/logout"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro no logout",
          body: "O backend devolveu um erro ao terminar a sessao.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setToken("");
      setStoredToken("");
      setStoredTokenType("");
      setStatus({
        kind: "success",
        title: "Logout concluido",
        body: "O token atual foi invalidado com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmittingLogout(false);
    }
  }

  return (
    <InternalShell
      currentPath="/auth-test"
      title="Autenticacao"
      subtitle="Ligacao Next.js + Laravel Auth API com Bearer token guardado em localStorage."
      userLabel={storedToken ? "Sessao ativa" : "Sem sessao ativa"}
      shopLabel="Area tecnica"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Registo" subtitle="Cria um utilizador diretamente no backend Laravel.">
          <form className="grid gap-4" onSubmit={handleRegister}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Nome</span>
              <input
                className={inputClass}
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Nome do utilizador"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Email</span>
              <input
                className={inputClass}
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="utilizador@example.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Password</span>
              <input
                className={inputClass}
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Password123!"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Confirmacao</span>
              <input
                className={inputClass}
                type="password"
                value={registerForm.passwordConfirmation}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    passwordConfirmation: event.target.value,
                  }))
                }
                placeholder="Password123!"
              />
            </label>
            <button type="submit" disabled={isSubmittingRegister} className={primaryButtonClass}>
              {isSubmittingRegister ? "A registar..." : "Testar registo"}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Login" subtitle="Obtém um token Bearer válido para o resto da plataforma.">
          <form className="grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Email</span>
              <input
                className={inputClass}
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="utilizador@example.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-700">Password</span>
              <input
                className={inputClass}
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Password123!"
              />
            </label>
            <button type="submit" disabled={isSubmittingLogin} className={primaryButtonClass}>
              {isSubmittingLogin ? "A autenticar..." : "Testar login"}
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Token atual" subtitle="Estado atual da sessao guardada localmente.">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm break-all text-neutral-700">
            {prettyToken}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Token type atual: {storedTokenType || "Sem token_type guardado."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleFetchUser}
              disabled={isLoadingUser}
              className={secondaryButtonClass}
            >
              {isLoadingUser ? "A carregar..." : "Testar /api/user"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSubmittingLogout}
              className={ghostButtonClass}
            >
              {isSubmittingLogout ? "A terminar..." : "Testar /api/logout"}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Estado da autenticacao">
            <StatusNotice kind={status.kind} title={status.title} body={status.body} />
          </SectionCard>
          <DataPreview title="Resposta do backend">
            <pre>{responsePayload || "Ainda sem resposta."}</pre>
          </DataPreview>
        </div>
      </div>
    </InternalShell>
  );
}
