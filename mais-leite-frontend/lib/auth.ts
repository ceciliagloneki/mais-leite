export interface FuncionarioAutenticado {
  id: number;
  nome: string;
  cargo: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  funcionario: FuncionarioAutenticado;
}

const TOKEN_KEY = "mais-leite-token";
const FUNCIONARIO_KEY = "mais-leite-funcionario";

export function saveAuthentication(login: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, login.token);
  localStorage.setItem(FUNCIONARIO_KEY, JSON.stringify(login.funcionario));
}

export function clearAuthentication() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FUNCIONARIO_KEY);
}

export function getToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

export function hasValidAuthentication(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getAuthenticatedEmployee(): FuncionarioAutenticado | null {
  try {
    const stored = localStorage.getItem(FUNCIONARIO_KEY);
    return stored ? (JSON.parse(stored) as FuncionarioAutenticado) : null;
  } catch {
    return null;
  }
}
