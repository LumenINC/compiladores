const { lexer } = require("./src/lexer");
const { parse } = require("./src/parser_ll1");
const table = require("./src/grammar-converter/ll1_table.json"); // arquivo gerado

const code = `
var x = 10;
`;

const tokens = lexer(code);
tokens.push({ type: "EOF", value: "$" });

const result = parse(tokens, table);

console.log("Sucesso?", result.success);
console.log(result.errors);
