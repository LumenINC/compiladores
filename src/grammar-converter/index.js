

const fs = require('fs');
const path = require('path');

const { parseGrammar } = require('./grammar-parser');
const { removeLeftRecursion } = require('./left-recursion-remover');
const { leftFactor } = require('./left-factorer');

function convertGrammar(grammarText) {
  const parsedGrammar = parseGrammar(grammarText);

  const noLeftRecursionGrammar = removeLeftRecursion(parsedGrammar);

  const factoredGrammar = leftFactor(noLeftRecursionGrammar);

  return factoredGrammar;
}

function runConversion() {
  const grammarFilePath = path.join(__dirname, '..', '..', 'docs', 'gramatica.txt');
  const grammarText = fs.readFileSync(grammarFilePath, 'utf-8');

  console.log('Iniciando a conversão da gramática...');
  const finalGrammar = convertGrammar(grammarText);

  console.log('\n--- Gramática Original ---');
  console.log(parseGrammar(grammarText));

  console.log('\n--- Gramática Sem Recursão à Esquerda ---');
  console.log(removeLeftRecursion(parseGrammar(grammarText)));

  console.log('\n--- Gramática Final (Fatorada e Pronta para LL(1)) ---');
  console.log(finalGrammar);
}

runConversion();

module.exports = { convertGrammar };