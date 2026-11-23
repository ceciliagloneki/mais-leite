import { describe, expect, it } from "vitest";
import { lerFormulario } from "./form";
import { enderecoCompleto, formatarCartaoSus, formatarData, ml, rotulo } from "./format";

describe("format", () => {
  it("formata datas do banco", () => {
    expect(formatarData("2026-11-16")).toBe("16/11/2026");
    expect(formatarData("2026-11-16 08:30:00")).toBe("16/11/2026 08:30");
    expect(formatarData("2020-05")).toBe("05/2020");
    expect(formatarData(null)).toBe("—");
  });

  it("traduz valores do banco", () => {
    expect(rotulo("em_triagem")).toBe("Em triagem");
    expect(rotulo("maduro")).toBe("Maduro (M)");
    expect(ml("200.00")).toBe("200 mL");
  });

  it("aplica a máscara do Cartão SUS", () => {
    expect(formatarCartaoSus("700000000000001")).toBe("700 0000 0000 0001");
    expect(formatarCartaoSus("7000")).toBe("700 0");
    expect(formatarCartaoSus("700 0000 0000 0001 99")).toBe("700 0000 0000 0001");
    expect(formatarCartaoSus(null)).toBe("");
  });

  it("monta o endereço a partir das partes", () => {
    expect(enderecoCompleto("Rua Minas", "50", "Jardim Aurora")).toBe("Rua Minas, 50 — Jardim Aurora");
    expect(enderecoCompleto("Rua Minas", null, null)).toBe("Rua Minas");
    expect(enderecoCompleto(null, null, null)).toBe("—");
  });
});

describe("lerFormulario", () => {
  it("lê texto, checkbox sim/não e listas de IDs", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="nome" value="Maria" />
      <input type="checkbox" name="conforme" checked />
      <input type="checkbox" name="fumante" />
      <input type="checkbox" name="frascos_ids" value="1" checked />
      <input type="checkbox" name="frascos_ids" value="2" />
      <input type="checkbox" name="frascos_ids" value="3" checked />
    `;
    expect(lerFormulario(form)).toEqual({ nome: "Maria", conforme: true, fumante: false, frascos_ids: [1, 3] });
  });
});
