# Endpoints

Todas as rotas, exceto `/` e `/auth/login`, exigem `Authorization: Bearer <token>`.
O funcionário que registra cada operação é o usuário logado (vem do token).

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Verifica se a API está no ar |
| POST | `/auth/login` | `{ email, senha }` → `{ token, funcionario }` |
| GET/POST | `/funcionarios` | Lista / cadastra funcionário |
| GET/PUT/DELETE | `/funcionarios/{id}` | Consulta / edita / inativa funcionário |
| **Fase 1** | | |
| GET | `/zonas` | Matriz logística (zona × dia da semana) |
| GET/POST | `/doadoras` | Lista / cadastra a ficha de identificação (endereço em `endereco_rua`, `endereco_numero`, `endereco_bairro`) |
| GET/PUT | `/doadoras/{id}` | Consulta (com triagem e sorologias) / edita a ficha |
| POST | `/doadoras/{id}/triagem` | Funil de segurança da primeira visita |
| POST | `/doadoras/{id}/sorologias` | Amostra de sorologia (1, 2 ou 3) |
| **Fase 2** | | |
| GET/POST | `/coletas` | Lista as visitas / registra uma visita já feita sem agendamento |
| POST | `/coletas/agendar` | Agenda visita (`doadora_id`, `data`): a data precisa cair no dia da semana da zona da doadora |
| PUT | `/coletas/{id}/realizar` | Registra a visita agendada (`data`, `data_coleta_sangue`, `frascos_esterilizados`, `frascos_recebidos`); não aceita data futura |
| PUT | `/coletas/{id}/cancelar` | Cancela a visita agendada |
| POST | `/coletas/{id}/frascos` | Registra frasco de leite cru da visita; a classificação é calculada pela data do parto |
| GET | `/frascos-crus?status=` | Lista frascos crus (coletado, conforme, descartado, pasteurizado) |
| **Fase 3** | | |
| GET/POST | `/recepcoes` | Lista / registra recepção (`zona_id`, `frascos_ids`, `conforme`, `motivo_descarte`); todos os frascos precisam ser da zona informada |
| GET/POST | `/pasteurizacoes` | Lista / registra pasteurização (`frascos_ids` conformes) |
| POST | `/pasteurizacoes/{id}/frascos` | Reenvase: cria frasco pasteurizado (`doadora_id`, `volume`; `classificacao` só quando a doadora tem mais de um tipo de leite na pasteurização) |
| GET | `/frascos-pasteurizados?status=` | Estoque (quarentena, disponivel, reprovado, alocado, distribuido, bloqueado) |
| POST | `/frascos-pasteurizados/{id}/analise` | Análise físico-química |
| **Fase 4** | | |
| GET/POST | `/hospitais` · PUT `/hospitais/{id}` | Hospitais |
| GET/POST | `/demandas` | Pedido do hospital (volume total e nº de bebês) |
| GET | `/prescricoes` · POST `/demandas/{id}/prescricoes` | Receitas por RN |
| GET/POST | `/alocacoes` | Preparação: frasco destinado a uma prescrição |
| PUT | `/alocacoes/{id}/administracao` | Baixa: data de administração ao RN |
| GET/POST | `/distribuicoes` · GET `/distribuicoes/{id}` | Ficha de distribuição |
| GET/POST | `/devolucoes` | Devolução de frascos vazios pelo hospital |
| **Consultas** | | |
| GET | `/dashboard` | Indicadores do painel |
| GET | `/rastreabilidade/{frascoPasteurizadoId}` | Cadeia completa do frasco |

## Exemplo

```bash
curl -X POST http://localhost:8090/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@maisleite.local","senha":"MaisLeite@123"}'

curl -X POST http://localhost:8090/recepcoes -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"zona_id":1,"data":"2026-11-16","municipios":"Marília","hora_saida":"08:00","hora_chegada":"11:00",
       "temperatura_caixa":-5,"conforme":false,"motivo_descarte":"Frasco trincado","frascos_ids":[3]}'
# => 201 {"id":1}   |   sem motivo: 400 {"error":"Campo 'motivo_descarte' é obrigatório."}
```
