# Compilador JS com Analisador Léxico e Sintático SLR(1)

Este projeto é um compilador didático construído em JavaScript que demonstra os processos de análise léxica e sintática. Ele utiliza um analisador léxico para tokenizar o código-fonte, um analisador sintático SLR(1) para construir uma árvore de análise (parse tree), e um visualizador para gerar um relatório HTML completo.

## Funcionalidades

- **Analisador Léxico**: Converte o código-fonte em uma sequência de tokens.
- **Analisador Sintático LL(1) e SLR(1)**: Valida o código com base em duas abordagens de parsing.
- **Geração de Tabela SLR(1)**: Gera dinamicamente as tabelas ACTION e GOTO a partir de uma gramática especificada.
- **Geração de Árvore Sintática**: O parser SLR produz uma árvore de análise detalhada em formato JSON.
- **Visualizador HTML**: Gera um relatório (`relatorio_compilador.html`) com a visualização da árvore sintática, conjuntos FIRST/FOLLOW e as tabelas de parsing LL(1) e SLR.

## Como Apresentar o Projeto

Siga estes passos para uma demonstração clara e eficaz do funcionamento do compilador.

### Passo 1: Instalar Dependências

Certifique-se de que o Node.js está instalado. Em seguida, instale as dependências do projeto:

```bash
npm install
```

### Passo 2: Apresentar a Gramática

Mostre o arquivo `docs/gramatica.txt`. Explique que esta é a gramática que define a estrutura da linguagem que o compilador aceita. Destaque algumas regras, como a definição de declarações (`Decl`), expressões (`Expr`) e estruturas de controle (`If`, `While`).

### Geração das Tabelas de Análise (Parsing)

Para gerar as tabelas de análise LL(1) e SLR, execute os seguintes comandos na raiz do projeto:

- **Tabela LL(1):**
  ```bash
  node src/grammar-converter/build_table.js
  ```

- **Tabela SLR:**
  ```bash
  node src/slr-parser/build-slr-table.js
  ```

### Passo 4: Analisar o Código e Gerar a Árvore

Execute o `main.js` para processar o código de exemplo (`src/sample_code.js`). Este script realiza a análise léxica e sintática (LL(1) e SLR) e salva a árvore de análise gerada pelo SLR em `parse_tree.json`.

```bash
node src/main.js
```

- **O que mostrar**: Analise a saída no console. Mostre a lista de tokens, a validação LL(1) e a confirmação de que a árvore SLR foi salva.

### Passo 5: Gerar e Apresentar o Relatório Visual

Execute o `visualizer.js` para gerar o relatório HTML completo.

```bash
node src/visualizer.js
```

Este comando criará o arquivo `relatorio_compilador.html` na raiz do projeto. Abra este arquivo em um navegador.

- **O que mostrar no relatório**:
    1.  **Conjuntos FIRST e FOLLOW**: Explique como esses conjuntos são usados para construir as tabelas de parsing.
    2.  **Árvore Sintática**: Mostre a representação gráfica do código analisado. Destaque como a estrutura da árvore corresponde ao código-fonte.
    3.  **Tabelas de Parsing LL(1) e SLR**: Compare as duas tabelas e explique brevemente como elas guiam os respectivos analisadores.

### Passo 6: Demonstração de Erros

Para mostrar a capacidade de detecção de erros, introduza erros intencionalmente no arquivo `src/sample_code.js` e execute `node src/main.js` novamente.

#### Forçando um Erro Léxico

Adicione um caractere inválido, como `@`.

```javascript
let y = x @ 5; // Erro aqui
```

**Resultado**: O `main.js` irá falhar com um `LexerError`, indicando o token inválido.

#### Forçando um Erro Sintático

Remova um ponto e vírgula.

```javascript
let x = 10 // Erro aqui, falta ';'
```

**Resultado**: O `main.js` reportará um `Syntax Error` do parser SLR, indicando o token inesperado e o estado do erro.

## Estrutura do Projeto

```
/src
|-- /slr-parser         # Lógica do analisador SLR(1)
|   |-- build-slr-table.js  # Script para construir a tabela SLR
|   |-- slr-parser.js       # O analisador sintático SLR
|   |-- slr-table.json      # Tabela SLR gerada
|-- lexer.js            # Analisador Léxico
|-- main.js             # Ponto de entrada que integra lexer e parsers
|-- visualizer.js       # Gerador do relatório HTML
|-- sample_code.js      # Código de exemplo para ser analisado
/docs
|-- gramatica.txt       # A gramática da linguagem
/relatorio_compilador.html # Relatório visual gerado
/parse_tree.json        # Saída da árvore de análise em JSON
```