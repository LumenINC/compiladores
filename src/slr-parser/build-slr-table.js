const fs = require('fs');
const path = require('path');
const { parseGrammar, getNonTerminals, getTerminals } = require('../grammar-converter/grammar-parser');
const { augmentGrammar } = require('./augmented-grammar');
const { buildLR0Items } = require('./lr0-items');
const { calculateFirstSets, calculateFollowSets } = require('./first-follow');

// Caminhos
const grammarFilePath = path.join(__dirname, '../../docs/gramatica.txt');
const tableOutputPath = path.join(__dirname, 'slr-table.json');

// 1. Carregar e Preparar Gramática
const grammarContent = fs.readFileSync(grammarFilePath, 'utf-8');
const grammar = parseGrammar(grammarContent);
const augmentedGrammar = augmentGrammar(grammar);

// 2. Calcular First e Follow
const firstSets = calculateFirstSets(augmentedGrammar);
const followSets = calculateFollowSets(augmentedGrammar, firstSets);

// 3. Gerar Itens LR(0) e Transições
console.log("Gerando Itens LR(0)...");
const { states, transitions } = buildLR0Items(augmentedGrammar);

// 4. Construir Tabelas Action e Goto
const actionTable = {};
const gotoTable = {};

// Mapeamento auxiliar para identificar regras pelo índice
const grammarProductions = [];
Object.keys(augmentedGrammar).forEach(nt => {
    augmentedGrammar[nt].forEach(prod => {
        grammarProductions.push({ nonTerminal: nt, production: prod });
    });
});

// Inicializar tabelas
states.forEach((_, index) => {
    actionTable[index] = {};
    gotoTable[index] = {};
});

states.forEach((stateItems, i) => {
    // A. Ações de Shift e Goto (baseadas nas transições do LR0)
    const stateTransitions = transitions[i] || {};
    Object.keys(stateTransitions).forEach(symbol => {
        const targetState = stateTransitions[symbol];
        
        // Se é terminal -> Shift
        // Se é não-terminal -> Goto
        // Usamos uma verificação simples: se está nas chaves da gramática, é NT.
        if (augmentedGrammar[symbol]) {
            gotoTable[i][symbol] = targetState;
        } else {
            actionTable[i][symbol] = `s${targetState}`;
        }
    });
    
    stateItems.forEach(itemStr => {
        // itemStr ex: "Term -> Factor . TermPrime"
        const [left, right] = itemStr.split(' -> ');
        const parts = right.split(' ');
        const dotIndex = parts.indexOf('.');
        
        // Se o ponto está no final, é Reduce
        if (dotIndex === parts.length - 1) {
            const nonTerminal = left;
            const production = parts.filter(p => p !== '.');
            
            // Caso especial: Program' -> Program . (Aceitação)
            if (nonTerminal.endsWith("'") && production[0] === nonTerminal.slice(0, -1)) {
                actionTable[i]['$'] = 'accept';
                return;
            }

            // Encontrar índice da produção na lista global
            const prodIndex = grammarProductions.findIndex(p => 
                p.nonTerminal === nonTerminal &&
                JSON.stringify(p.production) === JSON.stringify(production)
            );

            // Adicionar Reduce nos símbolos de Follow
            if (prodIndex !== -1 && followSets[nonTerminal]) {
                followSets[nonTerminal].forEach(followSym => {
                    // Resolver conflitos: Shift ganha de Reduce (se preferir)
                    if (!actionTable[i][followSym]) {
                        actionTable[i][followSym] = `r${prodIndex}`;
                    }
                });
            }
        }
        
        // Caso especial: Reduce epsilon (O ponto está no início e a produção é vazia/epsilon)
        // Na representação "A -> . ε", o ponto está no índice 0.
        // Se parts for ['.', 'ε'], então production é ['ε'].
        if (parts.length === 2 && parts[0] === '.' && parts[1] === 'ε') {
            const nonTerminal = left;
            const production = ['ε'];
            
            const prodIndex = grammarProductions.findIndex(p => 
                p.nonTerminal === nonTerminal && p.production[0] === 'ε'
            );

            if (prodIndex !== -1 && followSets[nonTerminal]) {
                followSets[nonTerminal].forEach(followSym => {
                    if (!actionTable[i][followSym]) {
                        actionTable[i][followSym] = `r${prodIndex}`;
                    }
                });
            }
        }
    });
});

// Salvar
const slrTable = { action: actionTable, goto: gotoTable, productions: grammarProductions };
fs.writeFileSync(tableOutputPath, JSON.stringify(slrTable, null, 2));
console.log(`Tabela SLR salva em ${tableOutputPath}`);