const fs = require('fs');
const path = require('path');

const slrTablePath = path.join(__dirname, 'slr-table.json');
const tableData = JSON.parse(fs.readFileSync(slrTablePath, 'utf-8'));
const { action, goto, productions } = tableData;

function getTerminalFromToken(token) {
    switch (token.type) {
        case 'KEYWORD':
            return token.value;
        case 'IDENTIFIER':
            return 'IDENTIFIER'; 
        case 'NUMBER':
            return 'NUMBER';
        case 'OPERATOR':
        case 'DELIMITER':
            return token.value;
        case 'EOF':
            // IMPORTANTE: Retorna 'EOF' para casar com a regra "Program -> StmtList EOF"
            return 'EOF'; 
        case 'END_OF_INPUT':
            // IMPORTANTE: Retorna '$' para acionar o 'accept' final
            return '$';
        default:
            return token.type;
    }
}

const parse = (tokens) => {
    const stack = [0];
    let cursor = 0;
    
    // PREPARAÇÃO DOS TOKENS:
    // 1. Garante que temos tokens
    const tokensProcessing = [...tokens];
    
    // 2. Verifica se o último token já é um EOF gerado pelo Lexer
    const lastToken = tokensProcessing.length > 0 ? tokensProcessing[tokensProcessing.length - 1] : null;
    
    // Se o Lexer não colocou EOF, nós colocamos.
    // Esse 'EOF' serve para a regra gramatical: Program -> StmtList EOF
    if (!lastToken || lastToken.type !== 'EOF') {
        tokensProcessing.push({ type: 'EOF', value: 'EOF', line: 0, column: 0 });
    }

    // 3. Adiciona o token FINAL '$'
    // Esse '$' serve para a tabela SLR saber que deve dar 'accept' (Program' -> Program)
    tokensProcessing.push({ type: 'END_OF_INPUT', value: '$', line: 0, column: 0 });

    console.log("Iniciando análise SLR...");

    while (cursor < tokensProcessing.length || stack.length > 0) {
        const token = tokensProcessing[cursor];
        const terminal = getTerminalFromToken(token);
        const state = stack[stack.length - 1];
        
        // 1. Tenta encontrar ação para o token atual
        let actionEntry = action[state] && action[state][terminal];

        // 2. FALLBACK: Se não houver ação, tenta redução por vazio (ε)
        if (!actionEntry && action[state] && action[state]['ε']) {
            actionEntry = action[state]['ε'];
            // Reduções por epsilon NÃO consomem o token atual
        }

        if (!actionEntry) {
            const expected = action[state] ? Object.keys(action[state]).join(', ') : 'nada';
            throw new Error(
                `Erro Sintático: Token inesperado '${token.value}' (terminal '${terminal}') no estado ${state}.\n` +
                `Linha: ${token.line}, Coluna: ${token.column}.\n` +
                `Esperado um destes: [ ${expected} ]`
            );
        }

        if (actionEntry.startsWith('s')) {
            // SHIFT
            const nextState = parseInt(actionEntry.substring(1));
            stack.push(token);      
            stack.push(nextState);  
            cursor++; // Consome o token
        } else if (actionEntry.startsWith('r')) {
            // REDUCE
            const productionIndex = parseInt(actionEntry.substring(1));
            const { nonTerminal, production } = productions[productionIndex];
            
            // Remove da pilha (2 * tamanho da produção)
            const numToPop = (production.length === 1 && production[0] === 'ε') ? 0 : production.length * 2;
            const popped = stack.splice(stack.length - numToPop, numToPop);

            // Coleta filhos para a árvore
            const children = [];
            for(let i = 0; i < popped.length; i += 2) {
                children.push(popped[i]); 
            }

            const node = { type: nonTerminal, children: children };
            
            // GOTO
            const prevState = stack[stack.length - 1];
            const nextState = goto[prevState] && goto[prevState][nonTerminal];

            if (nextState === undefined) {
                throw new Error(`Erro Interno: Sem transição GOTO para ${nonTerminal} a partir do estado ${prevState}`);
            }

            stack.push(node);
            stack.push(nextState);
            
        } else if (actionEntry === 'accept') {
            console.log('✅ Análise Sintática SLR concluída com sucesso!');
            return { success: true, parseTree: stack[1] };
        } else {
            throw new Error(`Ação inválida na tabela: ${actionEntry}`);
        }
    }
};

module.exports = { parse };