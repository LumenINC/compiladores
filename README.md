# 📘 Compilador Didático: Analisador Léxico, LL(1) e SLR

Este projeto implementa um compilador completo em JavaScript (Node.js) desenvolvido para a disciplina de Compiladores. O sistema abrange todas as etapas de análise:

1.  **Scanner (Analisador Léxico):** Identificação de tokens.
2.  **Gerador de Gramática:** Tratamento automático de gramáticas (Remoção de recursão à esquerda e Fatoração).
3.  **Parser LL(1):** Análise sintática descendente com tabela preditiva.
4.  **Parser SLR:** Análise sintática ascendente (Bottom-Up) com geração de Árvore Sintática (Ponto Extra).

---

## 📂 1. Estrutura de Arquivos Necessária

Para garantir que os comandos funcionem, organize seus arquivos exatamente nesta estrutura de pastas:

```text
projeto-compilador/
├── docs/
│   └── gramatica.txt            # Definição da Gramática Livre de Contexto
├── src/
│   ├── grammar-converter/       # Módulo Gerador LL(1)
│   │   ├── build_table.js       # Script principal de geração LL(1)
│   │   ├── grammar-parser.js
│   │   ├── left-factorer.js
│   │   └── left-recursion-remover.js
│   ├── slr-parser/              # Módulo Gerador SLR
│   │   ├── build-slr-table.js   # Script principal de geração SLR
│   │   ├── slr-parser.js        # Algoritmo de análise SLR
│   │   ├── lr0-items.js         # Gerador de Itens LR(0)
│   │   └── augmented-grammar.js
│   ├── lexer.js                 # O Analisador Léxico
│   ├── main.js                  # Arquivo principal (Executa todo o fluxo)
│   ├── parser_ll1.js            # Algoritmo de análise LL(1)
│   └── sample_code.js           # Código fonte de entrada para teste
├── package.json
└── README.md

Aqui está o conteúdo completo e formatado. Pode copiar o bloco abaixo inteiro e colar diretamente no seu ficheiro README.md.

Markdown

# 📘 Compilador Didático: Analisador Léxico, LL(1) e SLR

Este projeto implementa um compilador completo em JavaScript (Node.js) desenvolvido para a disciplina de Compiladores. O sistema abrange todas as etapas de análise, desde o reconhecimento de tokens até à geração da árvore sintática.

O projeto cumpre os requisitos principais e os pontos extras:
1.  **Scanner (Analisador Léxico):** Identificação de tokens e remoção de comentários.
2.  **Gerador de Gramática:** Tratamento automático (Remoção de recursão à esquerda e Fatoração).
3.  **Parser LL(1):** Análise sintática descendente com tabela preditiva.
4.  **Parser SLR:** Análise sintática ascendente (Bottom-Up) com geração de Árvore Sintática (Ponto Extra).

---

## 📂 1. Estrutura de Arquivos Necessária

Para garantir que os comandos funcionem, os arquivos devem estar organizados na seguinte estrutura:

```text
projeto-compilador/
├── docs/
│   └── gramatica.txt            # Definição da Gramática Livre de Contexto
├── src/
│   ├── grammar-converter/       # Módulo Gerador LL(1)
│   │   ├── build_table.js       # Script principal de geração LL(1)
│   │   ├── grammar-parser.js
│   │   ├── left-factorer.js
│   │   ├── left-recursion-remover.js
│   │   └── ll1_table.json       # (Gerado automaticamente)
│   ├── slr-parser/              # Módulo Gerador SLR
│   │   ├── build-slr-table.js   # Script principal de geração SLR
│   │   ├── slr-parser.js        # Algoritmo de análise SLR
│   │   ├── lr0-items.js         # Gerador de Itens LR(0)
│   │   ├── augmented-grammar.js
│   │   └── slr-table.json       # (Gerado automaticamente)
│   ├── lexer.js                 # O Analisador Léxico
│   ├── main.js                  # Arquivo principal (Executa todo o fluxo)
│   ├── parser_ll1.js            # Algoritmo de análise LL(1)
│   └── sample_code.js           # Código fonte de entrada para teste
├── package.json
└── README.md

## 🚀 2. Guia de Execução (Roteiro de Apresentação)
Siga esta ordem exata no terminal para demonstrar o funcionamento completo do trabalho.

# Passo 0: Instalação
Caso ainda não tenha instalado as dependências:

Bash

npm install
# Passo 1: Gerar a Tabela LL(1)
Este comando lê a gramática, remove recursões, fatora e calcula os conjuntos FIRST e FOLLOW.

Bash

node src/grammar-converter/build_table.js
Saída: Cria/Atualiza o arquivo src/grammar-converter/ll1_table.json.

# Passo 2: Gerar a Tabela SLR (Ponto Extra)
Este comando constrói os autômatos LR(0), resolve conflitos e gera a tabela de ações SLR.

Bash

node src/slr-parser/build-slr-table.js
Saída: Cria/Atualiza o arquivo src/slr-parser/slr-table.json.

# Passo 3: Executar o Compilador (Main)
Este é o comando final que lê o código fonte (sample_code.js) e passa por todas as etapas de análise.

Bash

node src/main.js
O que será exibido no console:

O código fonte original.

Lista de Tokens (Análise Léxica).

Confirmação de Sucesso do Parser LL(1).

Árvore Sintática (JSON) gerada pelo Parser SLR.

## 🧪 3. Simulando Erros (Testes de Robustez)
Para demonstrar que o compilador identifica erros corretamente e recupera ou reporta o problema, edite o arquivo src/sample_code.js com os exemplos abaixo e rode o comando node src/main.js.

# 🔴 Caso A: Erro Léxico (Token Desconhecido)
Insira um caractere que não pertence à linguagem definida.

Código:

JavaScript

let preco = 50 @; 
Resultado Esperado: O Lexer identificará um caractere inesperado ou o Parser falhará ao receber um token desconhecido.

# 🔴 Caso B: Erro Sintático LL(1) (Estrutura Incorreta)
Esqueça um ponto e vírgula ou use uma palavra-chave errada.

Código:

JavaScript

let x = 10     // Falta ';'
let y = 5;
# Resultado Esperado:

❌ ERRO LL(1): Erro: esperado ';' mas encontrou 'let'
# 🔴 Caso C: Erro em Expressões (Parênteses não balanceados)
Teste a lógica matemática e de precedência da gramática.

# Código:

let y = (5 + 5 * 2;
Resultado Esperado: O parser indicará que esperava ) mas encontrou ; ou fim de linha.

# 🔴 Caso D: Erro no Laço 'for'
Quebre a estrutura específica do for (que exige inicialização, condição e incremento separados por ;).

Código:

// A 3ª parte do for está vazia ou inválida
for (let i = 0; i < 10; ) { 
    print(i);
}
Resultado Esperado: Erro sintático indicando estrutura incompleta ou token inesperado ) onde deveria haver uma atribuição.

## 📝 Especificações da Linguagem
A gramática implementada (docs/gramatica.txt) suporta:

# Tipos de Variáveis: var, let, int, float.

# Atribuição: x = 10 + 2;

Estruturas de Controle:

# if (condicao) { ... } else { ... }

# while (condicao) { ... }

# for (init; condicao; incremento) { ... }

# Entrada/Saída: print(...)

# Expressões Matemáticas: +, -, *, /, ( ).

# Comparadores Lógicos: <, >, ==.