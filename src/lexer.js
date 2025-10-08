// src/lexer.js
// ========================================
// Analisador Léxico (Scanner) Aprimorado
// ========================================

const tokenSpecs = [
  // Ignoráveis
  ['WHITESPACE', /^\s+/, true],
  ['COMMENT', /^\/\/.*/, true],

  // Literais
  ['NUMBER', /^\d+/],
  ['STRING', /^"[^"]*"|^'[^']*'/],

  // Identificadores e Palavras-chave
  ['KEYWORD', /^(let|var|const|if|else|for|while|function|return|do)\b/],
  ['IDENTIFIER', /^[a-zA-Z_]\w*/],

  // Operadores
  ['OPERATOR', /^(==|!=|<=|>=|&&|\|\||[+\-*/=<>!&|])/],

  // Delimitadores
  ['DELIMITER', /^[(){};,]/],
];

function lexer(input) {
  let tokens = [];
  let code = input;
  let line = 1;
  let column = 1;

  while (code.length > 0) {
    let match = null;
    for (let [type, regex, ignore] of tokenSpecs) {
      match = regex.exec(code);
      if (match) {
        const value = match[0];
        if (!ignore) {
          tokens.push({ type, value, line, column });
        }

        // Atualiza linha e coluna
        const lines = value.split('\n');
        if (lines.length > 1) {
          line += lines.length - 1;
          column = lines[lines.length - 1].length + 1;
        } else {
          column += value.length;
        }
        
        code = code.slice(value.length);
        break;
      }
    }
    if (!match) {
      throw new Error(`LexerError: Token inválido na linha ${line}, coluna ${column} próximo de: ${code.slice(0, 20)}`);
    }
  }

  return tokens;
}

module.exports = { lexer };