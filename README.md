# Projeto: Analisador Léxico e Sintático em JavaScript

## 🎯 Objetivo
Implementar um **analisador léxico** e uma **versão inicial de analisador sintático** para um subconjunto da linguagem JavaScript, conforme especificação do projeto do 1º bimestre.

## ⚙️ Estrutura do Projeto
projeto-analisador/
├── src/
│   ├── grammar-converter/
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
├── docs/
│   ├── gramatica.txt
│   └── artigo-ieee.pdf
└── package.json


## 🚀 Como Executar o Analisador (Lexer + Parser)
```bash
npm install
npm run start
```

## 🚀 Como Executar o Conversor de Gramática

Para executar o conversor de gramática e gerar a versão LL(1) a partir de `docs/gramatica.txt`, use o seguinte comando:

```bash
node src/grammar-converter/index.js
```

O script irá processar a gramática, remover a recursão à esquerda, fatorar à esquerda e imprimir o resultado no console.
