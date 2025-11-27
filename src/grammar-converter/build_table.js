const fs = require('fs');
const path = require('path');
const { parseGrammar, getNonTerminals, getTerminals } = require('./grammar-parser');
const { removeLeftRecursion } = require('./left-recursion-remover');
const { leftFactor } = require('./left-factorer');

// --- Funções Auxiliares de Conjuntos ---

function computeFirstSets(grammar) {
    const firstSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const terminals = getTerminals(grammar);

    terminals.forEach(t => firstSets[t] = new Set([t]));
    nonTerminals.forEach(nt => firstSets[nt] = new Set());
    firstSets['ε'] = new Set(['ε']);
    
    if (!terminals.includes('EOF')) firstSets['EOF'] = new Set(['EOF']);

    let changed = true;
    while (changed) {
        changed = false;
        for (const nt of nonTerminals) {
            for (const production of grammar[nt]) {
                const originalSize = firstSets[nt].size;
                let allDeriveEpsilon = true;

                for (const symbol of production) {
                    if (!firstSets[symbol]) continue;

                    const symbolFirst = firstSets[symbol];
                    let symbolHasEpsilon = false;

                    for (const f of symbolFirst) {
                        if (f !== 'ε') firstSets[nt].add(f);
                        else symbolHasEpsilon = true;
                    }

                    if (!symbolHasEpsilon) {
                        allDeriveEpsilon = false;
                        break;
                    }
                }

                if (allDeriveEpsilon) firstSets[nt].add('ε');
                if (firstSets[nt].size > originalSize) changed = true;
            }
        }
    }
    return firstSets;
}

function computeFollowSets(grammar, firstSets) {
    const followSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const startSymbol = Object.keys(grammar)[0];

    nonTerminals.forEach(nt => followSets[nt] = new Set());
    if (startSymbol) followSets[startSymbol].add('$');

    let changed = true;
    while (changed) {
        changed = false;
        for (const nt of nonTerminals) {
            for (const production of grammar[nt]) {
                for (let i = 0; i < production.length; i++) {
                    const B = production[i];
                    if (!nonTerminals.includes(B)) continue;

                    const originalSize = followSets[B].size;
                    const beta = production.slice(i + 1);
                    let betaDerivesEpsilon = true;

                    for (const symbol of beta) {
                        const firstOfSymbol = firstSets[symbol] || new Set([symbol]);
                        let hasEpsilon = false;
                        for (const f of firstOfSymbol) {
                            if (f !== 'ε') followSets[B].add(f);
                            else hasEpsilon = true;
                        }
                        if (!hasEpsilon) {
                            betaDerivesEpsilon = false;
                            break;
                        }
                    }

                    if (betaDerivesEpsilon) {
                        for (const f of followSets[nt]) followSets[B].add(f);
                    }

                    if (followSets[B].size > originalSize) changed = true;
                }
            }
        }
    }
    return followSets;
}

function buildLL1Table(grammar, firstSets, followSets) {
    const table = {};
    const nonTerminals = getNonTerminals(grammar);

    nonTerminals.forEach(nt => table[nt] = {});

    for (const nt of nonTerminals) {
        for (const production of grammar[nt]) {
            const firstOfProd = new Set();
            let allDeriveEpsilon = true;

            for (const symbol of production) {
                const fSet = firstSets[symbol] || new Set([symbol]);
                let hasEpsilon = false;
                for (const f of fSet) {
                    if (f !== 'ε') firstOfProd.add(f);
                    else hasEpsilon = true;
                }
                if (!hasEpsilon) {
                    allDeriveEpsilon = false;
                    break;
                }
            }
            if (allDeriveEpsilon) firstOfProd.add('ε');

            for (const terminal of firstOfProd) {
                if (terminal !== 'ε') table[nt][terminal] = production;
            }

            if (firstOfProd.has('ε')) {
                for (const b of followSets[nt]) table[nt][b] = production;
            }
        }
    }
    return table;
}

// --- Execução Principal ---

const GRAMMAR_PATH = path.join(__dirname, '../../docs/gramatica.txt');
const OUTPUT_PATH = path.join(__dirname, 'll1_table.json');

try {
    const grammarText = fs.readFileSync(GRAMMAR_PATH, 'utf-8');
    
    // Tratamento da Gramática
    let grammar = parseGrammar(grammarText);
    grammar = removeLeftRecursion(grammar);
    grammar = leftFactor(grammar);

    // Cálculo dos Conjuntos
    const firstSetsRaw = computeFirstSets(grammar);
    const followSetsRaw = computeFollowSets(grammar, firstSetsRaw);

    // Substituição de EOF por $ no FOLLOW
    Object.keys(followSetsRaw).forEach(nt => {
        if (followSetsRaw[nt].has('EOF')) {
            followSetsRaw[nt].delete('EOF');
            followSetsRaw[nt].add('$');
        }
    });

    const table = buildLL1Table(grammar, firstSetsRaw, followSetsRaw);

    // Preparação para JSON (Limpando EOF/$)
    const firstSetsClean = {};
    const followSetsClean = {};

    Object.keys(firstSetsRaw).forEach(k => {
        firstSetsClean[k] = Array.from(firstSetsRaw[k]).filter(t => t !== 'EOF' && t !== '$');
    });

    Object.keys(followSetsRaw).forEach(k => {
        followSetsClean[k] = Array.from(followSetsRaw[k]);
    });

    const output = {
        grammar,
        table,
        FIRST: firstSetsClean,
        FOLLOW: followSetsClean
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`Tabela LL(1) gerada: ${OUTPUT_PATH}`);

} catch (err) {
    console.error("Erro na geração da tabela LL(1):", err.message);
}