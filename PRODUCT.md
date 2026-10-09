# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A pessoa principal cria a conta, adiciona pessoas, itens e consumos, e compartilha o código para que outras pessoas visualizem. Quem recebe o código é audiência secundária: entra para ver a conta, sem montá-la.

## Product Purpose

O racha conta existe para fechar uma conta compartilhada a partir do que cada pessoa consumiu. Sucesso é a pessoa que organiza conseguir montar a conta e entregar um código; quem recebe o código consegue ver o resultado.

## Positioning

O cálculo segue o consumo de cada item, a presença na mesa e a taxa de serviço. Um app que só divide o total em partes iguais não faz a mesma coisa.

## Operating Context

A pessoa entra com Google ou GitHub, cria a conta, inclui participantes, itens e consumos, e compartilha o código. Conta pública pode ser vista pelo código sem login. A lista de contas da pessoa autenticada fica na home. Não há cadastro próprio: `/register` redireciona para `/login`.

## Capabilities and Constraints

- Nome do produto: racha conta.
- Idioma: português do Brasil.
- Login apenas com Google e GitHub.
- Visitante pode ver conta pública pelo código sem entrar.
- Conta pode ser pública ou privada. Itens, consumos, presença (entrar ou sair da mesa) e taxa de serviço (percentual ou valor fixo) entram no cálculo do que cada pessoa deve.
- Participante sem conta pode existir só com nome. Só participante verificado gerencia itens e consumos, conforme a API.
- Token JWT no `localStorage`, enviado como `Authorization: Bearer`.
- Não há depoimentos, clientes, preços, métricas ou casos publicados. Trabalho futuro não pode inventar isso.

## Brand Commitments

O nome é racha conta. Há dois arquivos de marca em `public/logo.PNG` e `public/friends.PNG`.

## Evidence on Hand

- Código e copy atuais do app em `src/`.
- `public/logo.PNG` e `public/friends.PNG`.
- Ausente: depoimentos, números de uso, imprensa, preços e estudos de caso. Não fabricar.

## Product Principles

- Quem organiza monta a conta; as outras pessoas chegam pelo código para visualizar.
- O valor de cada pessoa sai do consumo, da presença e da taxa de serviço.
- Ver uma conta pública não exige criar conta.
- Identidade é só Google ou GitHub.
- O produto fala português do Brasil e se chama racha conta.
