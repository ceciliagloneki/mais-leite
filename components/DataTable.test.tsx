import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";

const itens = Array.from({ length: 25 }, (_, i) => ({ nome: `Item ${i + 1}` }));
const colunas = [{ titulo: "Nome", valor: (item: { nome: string }) => item.nome }];

describe("DataTable", () => {
  it("pagina a lista de 10 em 10", () => {
    render(<DataTable colunas={colunas} itens={itens} />);
    expect(screen.getByText("1–10 de 25 registros")).toBeInTheDocument();
    expect(screen.getByText("Item 10")).toBeInTheDocument();
    expect(screen.queryByText("Item 11")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(screen.getByText("21–25 de 25 registros")).toBeInTheDocument();
    expect(screen.getByText("Item 25")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(screen.getByText("Item 11")).toBeInTheDocument();
  });

  it("volta para a 1ª página quando a lista muda (filtro)", () => {
    const { rerender } = render(<DataTable colunas={colunas} itens={itens} />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    rerender(<DataTable colunas={colunas} itens={itens.slice(0, 15)} />);
    expect(screen.getByText("1–10 de 15 registros")).toBeInTheDocument();
  });
});
