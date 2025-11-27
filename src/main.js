const fs = require('fs');
const path = require('path');
const { lexer } = require('./lexer');
const { parse } = require('./slr-parser/slr-parser');

const sampleCodePath = path.join(__dirname, 'sample_code.js');
const code = fs.readFileSync(sampleCodePath, 'utf-8');

const tokens = lexer(code);

console.log('Tokens:', tokens);

try {
    const result = parse(tokens);
    console.log('Parse Tree:', JSON.stringify(result.parseTree, null, 2));
} catch (error) {
    console.error(error.message);
}