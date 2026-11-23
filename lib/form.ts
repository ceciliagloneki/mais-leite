export type DadosFormulario = Record<string, string | number[] | boolean>;

export function lerFormulario(form: HTMLFormElement): DadosFormulario {
  const dados: DadosFormulario = {};
  const formData = new FormData(form);

  for (const nome of Array.from(new Set(formData.keys()))) {
    const valores = formData.getAll(nome).map(String);
    dados[nome] = nome.endsWith("_ids") ? valores.map(Number) : valores[0];
  }

  form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
    if (input.name.endsWith("_ids")) {
      dados[input.name] = dados[input.name] ?? [];
    } else {
      dados[input.name] = input.checked;
    }
  });

  return dados;
}
