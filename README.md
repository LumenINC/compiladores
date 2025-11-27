# 📘 Compilador Didático: Analisador Léxico, LL(1) e SLR

Este projeto implementa um compilador completo em JavaScript (Node.js) desenvolvido para a disciplina de Compiladores. O sistema abrange todas as etapas de análise, desde o reconhecimento de tokens até a geração da árvore sintática.

O projeto cumpre os requisitos principais e os pontos extras:

1. **Scanner (Analisador Léxico):** Identificação de tokens e remoção de comentários.
2. **Gerador de Gramática:** Remoção de recursão à esquerda e fatoração automática.
3. **Parser LL(1):** Análise sintática descendente com tabela preditiva.
4. **Parser SLR:** Análise sintática ascendente (Bottom-Up) com geração de Árvore Sintática (Ponto Extra).

---

## 📂 1. Estrutura de Arquivos

Para garantir que os comandos funcionem corretamente, utilize a seguinte estrutura:

```text
projeto-compilador/
├── docs/
│   └── gramatica.txt            # Definição da Gramática Livre de Contexto
├── src/
│   ├── grammar-converter/
│   ├── grammar-converter/       # Módulo Gerador LL(1)
│   │   ├── build_table.js       # Script principal de geração LL(1)
│   │   ├── grammar-parser.js
│   │   ├── index.js
│   │   ├── left-factorer.js
│   │   └── left-recursion-remover.js
│   ├── lexer.js
│   ├── parser.js
│   ├── main.js
│   └── sample_code.js
├── tests/
│   └── runTests.js
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
```

## 🚀 2. Guia de Execução (Roteiro de Apresentação)

Siga esta sequência no terminal para demonstrar o funcionamento completo do compilador.

---

### **Passo 0: Instalar Dependências**


npm install
Passo 1: Gerar a Tabela LL(1)
Lê a gramática, remove recursões, fatora, gera FIRST e FOLLOW e cria a tabela preditiva.

node src/grammar-converter/build_table.js
Saída esperada:
src/grammar-converter/ll1_table.json

Passo 2: Gerar a Tabela SLR (Ponto Extra)
Constrói os autômatos LR(0) e gera a tabela SLR.


node src/slr-parser/build-slr-table.js
Saída esperada:
src/slr-parser/slr-table.json

Passo 3: Executar o Compilador Completo
node src/main.js
O console exibirá:
Código fonte original
Lista de Tokens (Léxico)
Confirmação do Parser LL(1)
Árvore Sintática gerada pelo Parser SLR (JSON)

🧪 3. Testes de Robustez (Simulando Erros)
Modifique src/sample_code.js com os exemplos abaixo e execute node src/main.js.

🔴 Caso A: Erro Léxico (Token Desconhecido)

let preco = 50 @;
Resultado esperado: erro de caractere inesperado.

🔴 Caso B: Erro Sintático LL(1)

let x = 10     // Falta ';'
let y = 5;
Resultado esperado:

❌ ERRO LL(1): esperado ';' mas encontrou 'let'
🔴 Caso C: Parênteses não balanceados

let y = (5 + 5 * 2;
Erro esperado:
→ esperado ) mas encontrado ;

🔴 Caso D: Erro no Laço for

for (let i = 0; i < 10; ) {
    print(i);
}
Erro esperado: incremento ausente ou token inesperado ).

📝 4. Especificações da Linguagem
A gramática (arquivo docs/gramatica.txt) suporta:

📌 Tipos de Variáveis
var

let

int

float

📌 Atribuição
x = 10 + 2;
📌 Estruturas de Controle
if (cond) { ... } else { ... }

while (cond) { ... }

for (init; condicao; incremento) { ... }

📌 Entrada/Saída
print(...)
📌 Expressões Matemáticas
+, -, *, /, (, )

📌 Comparadores
<, >, ==