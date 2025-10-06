// tests/runTests.js
const { lexer } = require('../src/lexer');

function testLexer() {
  const code = `
    let x = 10;
    let y = 20;
    if (x < y) {
      x = x + 1;
    }
  `;
  const tokens = lexer(code);

  console.log('=== TESTE: Analisador Léxico ===');
  console.table(tokens);
  console.log('Total de tokens:', tokens.length);
}

// Aqui você poderá depois adicionar o parser
// const { parser } = require('../src/parser');
// function testParser() { ... }

testLexer();
