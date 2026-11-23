"use client";

import { useState } from "react";
import { Plus, UserX } from "lucide-react";

import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { DataTable, TextoDuplo } from "@/components/DataTable";
import { Campo } from "@/components/Field";
import { ConfirmarModal, FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { useCriarFuncionario, useFuncionarios, useInativarFuncionario } from "@/hooks/use-funcionarios";
import { contem } from "@/lib/format";
import type { Funcionario } from "@/types/funcionario";

export default function FuncionariosPage() {
  const funcionarios = useFuncionarios();
  const criar = useCriarFuncionario();
  const inativar = useInativarFuncionario();
  const [formAberto, setFormAberto] = useState(false);
  const [inativando, setInativando] = useState<Funcionario | null>(null);
  const [busca, setBusca] = useState("");

  const visiveis = (funcionarios.data ?? []).filter((f) => contem(f.nome, busca) || contem(f.email, busca) || contem(f.cargo, busca));

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Equipe"
        descricao="Pessoas com acesso ao sistema. Funcionário inativo não consegue entrar."
        acao={
          <Botao icone={Plus} onClick={() => setFormAberto(true)}>
            Novo Funcionário
          </Botao>
        }
      />

      {formAberto ? (
        <FormModal
          titulo="Novo Funcionário"
          botao="Cadastrar Funcionário"
          mensagemSucesso="Funcionário cadastrado."
          onSubmit={criar.mutateAsync}
          onFechar={() => setFormAberto(false)}
        >
          <Campo label="Nome completo" name="nome" required />
          <Campo label="Cargo" name="cargo" required placeholder="Ex.: Enfermeira" />
          <Campo label="E-mail" name="email" type="email" required />
          <Campo
            label="Senha"
            name="senha"
            type="password"
            required
            ajuda="Pelo menos 6 caracteres, com letra maiúscula, minúscula, número e símbolo (ex.: Leite@2026)."
          />
        </FormModal>
      ) : null}

      <Card tabela filtros={<Busca valor={busca} onMudar={setBusca} placeholder="Buscar por nome, cargo ou e-mail" />}>
        <DataTable
          carregando={funcionarios.isLoading}
          erro={funcionarios.error}
          itens={visiveis}
          vazio="Nenhum funcionário encontrado."
          colunas={[
            { titulo: "Nome", valor: (f) => <TextoDuplo principal={f.nome} /> },
            { titulo: "Cargo", valor: (f) => f.cargo },
            { titulo: "E-mail", valor: (f) => f.email },
            { titulo: "Situação", valor: (f) => <StatusBadge status={f.status} /> },
            {
              titulo: "",
              direita: true,
              valor: (f) =>
                f.status === "ativo" ? (
                  <Botao variante="perigo" pequeno icone={UserX} onClick={() => setInativando(f)}>
                    Inativar
                  </Botao>
                ) : null,
            },
          ]}
        />
      </Card>

      {inativando ? (
        <ConfirmarModal
          titulo="Inativar funcionário?"
          botao="Inativar"
          mensagemSucesso={`${inativando.nome} foi inativado(a).`}
          onConfirmar={() => inativar.mutateAsync(inativando.id)}
          onFechar={() => setInativando(null)}
        >
          <p>
            <strong>{inativando.nome}</strong> não vai mais conseguir entrar no sistema.
          </p>
        </ConfirmarModal>
      ) : null}
    </main>
  );
}
