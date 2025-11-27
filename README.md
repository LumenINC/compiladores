# Compilador JS com Analisador Léxico e Sintático SLR(1)

Este projeto é um compilador simples construído em JavaScript que demonstra os processos de análise léxica e sintática. Ele utiliza um analisador léxico para tokenizar o código-fonte e um analisador sintático SLR(1) para construir uma árvore de análise (parse tree).

## Funcionalidades

- **Analisador Léxico**: Converte o código-fonte em uma sequência de tokens.
- **Analisador Sintático SLR(1)**: Verifica se a sequência de tokens corresponde à gramática definida e constrói uma árvore de análise.
- **Geração de Tabela SLR(1)**: Gera dinamicamente as tabelas ACTION e GOTO a partir de uma gramática especificada.
- **Detecção de Erros**: Identifica e reporta erros léxicos e sintáticos.

## Como Apresentar o Projeto

Siga estes passos para uma demonstração clara e eficaz do funcionamento do compilador.

### Passo 1: Instalar Dependências

Certifique-se de que o Node.js está instalado. Em seguida, instale as dependências do projeto:

```bash
npm install
```

### Passo 2: Apresentar a Gramática

Mostre o arquivo `docs/gramatica.txt`. Explique que esta é a gramática que define a estrutura da linguagem que o compilador aceita. Destaque algumas regras, como a definição de declarações (`Decl`), expressões (`Expr`) e estruturas de controle (`If`, `While`).

### Passo 3: Gerar as Tabelas de Análise

Execute o script para construir as tabelas SLR(1) a partir da gramática. Este comando irá ler `docs/gramatica.txt`, gerar os itens LR(0), os conjuntos FIRST e FOLLOW, e finalmente a tabela de análise SLR(1), salvando-a em `src/slr-parser/slr-table.json`.

```bash
node src/slr-parser/build-slr-table.js
```

- **O que mostrar**: Abra o `slr-table.json` gerado e explique brevemente o que são as tabelas `action` e `goto` e como elas guiam o analisador.

### Passo 4: Analisar o Código de Exemplo

Execute o `main.js` para processar o código de exemplo localizado em `src/sample_code.js`.

```bash
node src/main.js
```

Este comando fará duas coisas:
1.  **Análise Léxica**: O `lexer.js` irá tokenizar o `sample_code.js`. O resultado (uma lista de tokens) será impresso no console.
2.  **Análise Sintática**: O `slr-parser.js` usará a tabela SLR gerada para analisar os tokens. Se for bem-sucedido, ele imprimirá a árvore de análise (Parse Tree).

- **O que mostrar**: Analise a saída no console. Primeiro, mostre a lista de tokens e explique como o código foi dividido em unidades lógicas. Em seguida, mostre a árvore de análise e explique como ela representa a estrutura hierárquica do código-fonte.

### Passo 5: Demonstração de Erros

Para mostrar a capacidade de detecção de erros do compilador, você pode introduzir erros intencionalmente no arquivo `src/sample_code.js`.

#### Forçando um Erro Léxico

Adicione um caractere inválido ao código, como um `@` ou `#`.

**Exemplo em `src/sample_code.js`:**

```javascript
let x = 10;
let y = x @ 5; // Erro aqui
```

Execute `node src/main.js` novamente. O analisador léxico irá falhar e reportar um `LexerError`, indicando o token inválido.

#### Forçando um Erro Sintático

Modifique o código para que ele viole as regras da gramática. Por exemplo, remova um ponto e vírgula ou escreva uma estrutura de controle de forma incorreta.

**Exemplo 1: Ponto e vírgula faltando**
```javascript
let x = 10 // Erro aqui, falta ';'
```

**Exemplo 2: Estrutura `if` inválida**
```javascript
if (x > 5) then { // 'then' não faz parte da gramática
  y = 1;
}
```

Execute `node src/main.js`. Desta vez, a análise léxica será bem-sucedida, mas a análise sintática falhará, reportando um `Syntax Error` com o token inesperado e o estado em que o erro ocorreu.

## Estrutura do Projeto

```
/src
|-- /grammar-converter  # Ferramentas para manipulação de gramática (não utilizadas no fluxo principal do SLR)
|-- /slr-parser         # Lógica do analisador SLR(1)
|   |-- build-slr-table.js  # Script para construir a tabela SLR
|   |-- slr-parser.js       # O analisador sintático SLR
|   |-- slr-table.json      # Tabela SLR gerada
|   |-- ...
|-- lexer.js            # Analisador Léxico
|-- main.js             # Ponto de entrada principal que integra o lexer e o parser
|-- sample_code.js      # Código de exemplo para ser analisado
/docs
|-- gramatica.txt       # A gramática da linguagem
```