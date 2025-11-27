const { getNonTerminals, getTerminals } = require('../grammar-converter/grammar-parser');

const calculateFirstSets = (grammar) => {
    const firstSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const terminals = getTerminals(grammar);

    // Initialize FIRST for all terminals to themselves
    terminals.forEach(t => {
        firstSets[t] = new Set([t]);
    });

    // Initialize FIRST for non-terminals to empty sets
    nonTerminals.forEach(nt => {
        firstSets[nt] = new Set();
    });

    // Add a rule for epsilon
    firstSets['epsilon'] = new Set(['epsilon']);

    let changed = true;
    while (changed) {
        changed = false;

        for (const nonTerminal in grammar) {
            for (const production of grammar[nonTerminal]) {
                const symbols = production;
                const originalSize = firstSets[nonTerminal].size;

                let canReachEpsilon = true;
                for (const symbol of symbols) {
                    // Skip if symbol is not in firstSets (e.g., epsilon handled separately)
                    if (!firstSets[symbol]) continue;

                    const firstOfSymbol = firstSets[symbol];

                    firstOfSymbol.forEach(terminal => {
                        if (terminal !== 'epsilon') {
                            firstSets[nonTerminal].add(terminal);
                        }
                    });

                    if (!firstOfSymbol.has('epsilon')) {
                        canReachEpsilon = false;
                        break;
                    }
                }

                if (canReachEpsilon) {
                    firstSets[nonTerminal].add('epsilon');
                }

                if (firstSets[nonTerminal].size > originalSize) {
                    changed = true;
                }
            }
        }
    }

    return firstSets;
};

const calculateFollowSets = (grammar, firstSets) => {
    const followSets = {};
    const nonTerminals = getNonTerminals(grammar);
    const startSymbol = Object.keys(grammar)[0];

    nonTerminals.forEach(nt => {
        followSets[nt] = new Set();
    });

    followSets[startSymbol].add('$');

    let changed = true;
    while (changed) {
        changed = false;

        for (const nonTerminal in grammar) {
            for (const production of grammar[nonTerminal]) {
                const symbols = production;

                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];

                    if (nonTerminals.includes(symbol)) {
                        const originalSize = followSets[symbol].size;
                        const rest = symbols.slice(i + 1);

                        if (rest.length > 0) {
                            let restFirst = new Set();
                            let canBeEpsilon = true;

                            for (const nextSymbol of rest) {
                                const nextFirst = firstSets[nextSymbol];
                                if (!nextFirst) continue;

                                nextFirst.forEach(s => {
                                    if (s !== 'epsilon') {
                                        restFirst.add(s);
                                    }
                                });
                                if (!nextFirst.has('epsilon')) {
                                    canBeEpsilon = false;
                                    break;
                                }
                            }

                            restFirst.forEach(s => followSets[symbol].add(s));

                            if (canBeEpsilon) {
                                followSets[nonTerminal].forEach(s => followSets[symbol].add(s));
                            }
                        } else {
                            followSets[nonTerminal].forEach(s => followSets[symbol].add(s));
                        }

                        if (followSets[symbol].size > originalSize) {
                            changed = true;
                        }
                    }
                }
            }
        }
    }

    return followSets;
};

module.exports = { calculateFirstSets, calculateFollowSets };
