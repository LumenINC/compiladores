// src/lexer.js
// ========================================
// Analisador Léxico (Scanner) em JavaScript
// ========================================

const tokenSpecs = [
    ['WHITESPACE', /^\s+/, null],
    ['NUMBER', /^\d+/],
    ['IDENTIFIER', /^[a-zA-Z_]\w*/],
    ['KEYWORD', /^(let|var|const|if|else|for|while|function|return)\b/],
    ['OPERATOR', /^[+\-*/=<>!&|]+/],
    ['DELIMITER', /^[(){};,]/],
    ['STRING', /^"[^"]*"|^'[^']*'/],
  ];
  
  function lexer(input) {
    let tokens = [];
    let code = input;
  
    while (code.length > 0) {
      let match = null;
      for (let [type, regex, ignore] of tokenSpecs) {
        match = regex.exec(code);
        if (match) {
          if (!ignore) {
            tokens.push({ type, value: match[0] });
          }
          code = code.slice(match[0].length);
          break;
        }
      }
      if (!match) {
        throw new Error(`Token inválido próximo de: ${code.slice(0, 20)}`);
      }
    }
  
    return tokens;
  }
  
  // Exporta para uso em main.js
  module.exports = { lexer };
  