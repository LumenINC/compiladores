const fs = require("fs");
const path = require("path");

/*
    =============================================================
      FUNÇÃO: Converte tokens do LEXER para terminais da TABELA
    =============================================================
*/
function mapTokenToTerminal(token) {
  if (!token) return "$";

  // Categorias diretas
  if (token.type === "IDENTIFIER") return "IDENTIFIER";
  if (token.type === "NUMBER") return "NUMBER";

  // Palavras-chave
  if (token.type === "KEYWORD") {
    return token.value; // var, if, else, while, print...
  }

  // Delimitadores: ; { } ( )
  if (token.type === "DELIMITER") {
    return token.value;
  }

  // Operadores: = + *
  if (token.type === "OPERATOR") {
    return token.value;
  }

  // Último token do arquivo
  if (token.type === "EOF") return "EOF";

  return token.value;
}

/*
    =============================================================
               PARSER LL(1) BASEADO EM TABELA
    =============================================================
*/

function parse(tokens, ll1) {
  const table = ll1.table;
  const grammar = ll1.grammar;
  const FIRST = ll1.FIRST;
  const FOLLOW = ll1.FOLLOW;

  const startSymbol = "Program";

  // Garante EOF no final
  if (tokens.length === 0 || tokens[tokens.length - 1].type !== "EOF") {
    tokens.push({ type: "EOF", value: "$" });
  }

  const stack = ["$", startSymbol];
  let index = 0;

  const errors = [];

  function isTerminal(symbol) {
    return !(grammar[symbol]); // não é não-terminal -> é terminal
  }

  while (stack.length > 0) {
    const top = stack.pop();
    const currentToken = tokens[index];
    const lookahead = mapTokenToTerminal(currentToken);

    // Caso 1: Se top for terminal
    if (isTerminal(top)) {
      if (top === "ε") {
        continue;
      }

      if (top === lookahead) {
        index++; // Consome token
      } else {
        errors.push({
          message: `Erro: esperado '${top}' mas encontrou '${lookahead}'`,
          line: currentToken.line,
          column: currentToken.column
        });
        return { success: false, errors };
      }
      continue;
    }

    // Caso 2: top é não-terminal
    const row = table[top];

    if (!row) {
      errors.push({
        message: `Erro interno: não existe linha na tabela para '${top}'`,
        token: currentToken
      });
      return { success: false, errors };
    }

    let production = row[lookahead];

    // Não achou no lookahead — tenta token.value (caso KEYWORD ou DELIMITER)
    if (!production) production = row[currentToken.value];

    if (!production) {
      errors.push({
        message: `Erro sintático: não existe produção para (${top}, ${lookahead})`,
        line: currentToken.line,
        column: currentToken.column
      });
      return { success: false, errors };
    }

    // Produção ε
    if (production.length === 1 && production[0] === "ε") {
      continue;
    }

    // Desempilha ao contrário
    for (let i = production.length - 1; i >= 0; i--) {
      stack.push(production[i]);
    }
  }

  return { success: true, errors: [] };
}

module.exports = { parse };
