// src/main.js

// 1. Importe o módulo 'path' no início do arquivo
const path = require('path');

const { lexer } = require('./lexer');
const { Parser } = require('./parser');
const fs = require('fs');
const util = require('util');

try {
  // 2. Crie o caminho completo para o arquivo de exemplo
  const filePath = path.join(__dirname, 'sample_code.js');
  const code = fs.readFileSync(filePath, 'utf-8');
  
  // O resto do código permanece igual...
  console.log('--- TOKENS ---');
  const tokens = lexer(code);
  console.table(tokens);
  
  console.log("--- CONTEÚDO DO ARQUIVO LIDO ---");
  console.log(code);
  console.log("--------------------------------");

  console.log('\n--- ABSTRACT SYNTAX TREE (AST) ---');
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  console.log(util.inspect(ast, { showHidden: false, depth: null, colors: true }));

} catch (error) {
  console.error(error.message);
}