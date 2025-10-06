const { lexer } = require('./lexer');
const fs = require('fs');

const code = fs.readFileSync('./src/sample_code.js', 'utf-8');
const tokens = lexer(code);

console.table(tokens);
