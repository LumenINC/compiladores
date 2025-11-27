const fs = require('fs');
const path = require('path');
const { lexer } = require('./lexer');
const slrParser = require('./slr-parser/slr-parser');
const ll1Parser = require('./parser_ll1');
const ll1Table = require('./grammar-converter/ll1_table.json');

const SAMPLE_PATH = path.join(__dirname, 'sample_code.js');
const TREE_OUTPUT_PATH = path.join(__dirname, '../parse_tree.json'); // Arquivo temporário

try {
    const code = fs.readFileSync(SAMPLE_PATH, 'utf-8');
    console.log("--- Código Fonte ---\n", code);

    const tokens = lexer(code);
    console.log(`\n--- Lexer ---\nTokens encontrados: ${tokens.length}`);
    
    // LL(1)
    console.log("\n--- Parser LL(1) ---");
    const tokensLL1 = [...tokens, { type: 'EOF', value: '$', line: 0, column: 0 }];
    const resultLL1 = ll1Parser.parse(tokensLL1, ll1Table);
    
    if (resultLL1.success) {
        console.log("✅ Sucesso: O código é válido segundo a gramática LL(1).");
    } else {
        console.error("❌ Erros LL(1) encontrados.");
    }

    // SLR
    console.log("\n--- Parser SLR ---");
    const resultSLR = slrParser.parse(tokens);
    
    if (resultSLR.success) {
        console.log("✅ Sucesso SLR. Gerando arquivo da árvore...");
        
        fs.writeFileSync(TREE_OUTPUT_PATH, JSON.stringify(resultSLR.parseTree, null, 2));
        console.log(`🌳 Dados da árvore salvos em: ${TREE_OUTPUT_PATH}`);
        console.log("👉 Agora rode: node src/visualizer.js para ver o desenho!");
    }

} catch (err) {
    console.error("Erro fatal na execução:", err.message);
}