import { redirect } from "next/navigation";

// Raiz da aplicação redireciona para o painel.
export default function Home() {
  redirect("/dashboard");
}
