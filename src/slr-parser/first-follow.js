const { getNonTerminals, getTerminals } = require('../grammar-converter/grammar-parser');

const calculateFirstSets = (grammar) => {
    const firstSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const terminals = getTerminals(grammar);

    // Inicializa FIRST para terminais com eles mesmos
    // IMPORTANTE: Não incluímos EOF/epsilon nos terminais normais a menos que explicitamente tratado
    terminals.forEach(t => {
        firstSets[t] = new Set([t]);
    });

    // Inicializa FIRST para não-terminais como vazio
    nonTerminals.forEach(nt => {
        firstSets[nt] = new Set();
    });

    // Garante que 'epsilon' (ou 'ε') tenha seu próprio conjunto se usado
    firstSets['epsilon'] = new Set(['epsilon']);
    firstSets['ε'] = new Set(['ε']);
    // Garante que EOF tenha seu conjunto, mas cuidado ao propagar
    firstSets['EOF'] = new Set(['EOF']);
    firstSets['$'] = new Set(['$']);

    let changed = true;
    while (changed) {
        changed = false;

        for (const nonTerminal in grammar) {
            for (const production of grammar[nonTerminal]) {
                const symbols = production;
                const originalSize = firstSets[nonTerminal].size;

                let canReachEpsilon = true; // Flag para saber se a produção inteira anula

                for (const symbol of symbols) {
                    // Pula se o símbolo não tem conjunto FIRST definido (erro de gramática ou símbolo novo)
                    if (!firstSets[symbol]) continue;

                    const firstOfSymbol = firstSets[symbol];
                    let symbolHasEpsilon = false;

                    firstOfSymbol.forEach(terminal => {
                        // AQUI ESTÁ A CORREÇÃO:
                        // Filtramos 'epsilon' para não adicionar diretamente, a menos que toda a cadeia anule
                        // E filtramos 'EOF' se ele não fizer sentido no contexto de FIRST de um NT
                        if (terminal !== 'epsilon' && terminal !== 'ε') {
                            firstSets[nonTerminal].add(terminal);
                        } else {
                            symbolHasEpsilon = true;
                        }
                    });

                    // Se esse símbolo não pode ser epsilon, então os próximos símbolos
                    // não contribuem para o FIRST deste não-terminal.
                    if (!symbolHasEpsilon) {
                        canReachEpsilon = false;
                        break; 
                    }
                }

                // Se todos os símbolos da produção podem derivar epsilon, 
                // então o próprio não-terminal produz epsilon.
                if (canReachEpsilon) {
                    firstSets[nonTerminal].add('ε');
                }

                if (firstSets[nonTerminal].size > originalSize) {
                    changed = true;
                }
            }
        }
    }

    // LIMPEZA FINAL: Remove EOF dos conjuntos FIRST de não-terminais, 
    // exceto se for explicitamente desejado (raro em LL1 puro).
    // Geralmente EOF só aparece no FOLLOW.
    for (const nt of nonTerminals) {
        if (firstSets[nt].has('EOF')) firstSets[nt].delete('EOF');
        if (firstSets[nt].has('$')) firstSets[nt].delete('$');
    }

    return firstSets;
};

const calculateFollowSets = (grammar, firstSets) => {
    const followSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const startSymbol = Object.keys(grammar)[0]; // O primeiro NT é o inicial

    nonTerminals.forEach(nt => {
        followSets[nt] = new Set();
    });

    // Regra 1: O símbolo inicial contém EOF no FOLLOW
    if (startSymbol) {
        followSets[startSymbol].add('$'); // Usamos $ para representar EOF na tabela
    }

    let changed = true;
    while (changed) {
        changed = false;

        for (const nonTerminal in grammar) {
            for (const production of grammar[nonTerminal]) {
                // Para cada produção A -> alpha
                for (let i = 0; i < production.length; i++) {
                    const symbol = production[i];

                    // Só calculamos FOLLOW para não-terminais
                    if (!nonTerminals.includes(symbol)) continue;

                    const originalSize = followSets[symbol].size;
                    
                    // O que vem depois do símbolo atual? (beta)
                    const rest = production.slice(i + 1);
                    
                    let canBeEpsilon = true;

                    // Regra 2: Adiciona FIRST(beta) \ {epsilon} ao FOLLOW(symbol)
                    if (rest.length > 0) {
                        for (const nextSymbol of rest) {
                             const nextFirst = firstSets[nextSymbol];
                             // Se for terminal ou NT desconhecido, trate como conjunto unitário se não existir
                             const setNext = nextFirst || new Set([nextSymbol]);

                             let nextHasEpsilon = false;
                             setNext.forEach(s => {
                                 if (s !== 'epsilon' && s !== 'ε') {
                                     followSets[symbol].add(s);
                                 } else {
                                     nextHasEpsilon = true;
                                 }
                             });

                             if (!nextHasEpsilon) {
                                 canBeEpsilon = false;
                                 break;
                             }
                        }
                    }

                    // Regra 3: Se A -> alpha B ou A -> alpha B beta (onde beta => epsilon)
                    // então FOLLOW(A) está contido em FOLLOW(B)
                    if (canBeEpsilon) {
                        if (followSets[nonTerminal]) {
                            followSets[nonTerminal].forEach(s => followSets[symbol].add(s));
                        }
                    }

                    if (followSets[symbol].size > originalSize) {
                        changed = true;
                    }
                }
            }
        }
    }

    return followSets;
};

module.exports = { calculateFirstSets, calculateFollowSets };