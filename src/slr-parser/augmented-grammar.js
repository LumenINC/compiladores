const augmentGrammar = (grammar) => {
    const originalStartSymbol = Object.keys(grammar)[0];
    const augmentedStartSymbol = `${originalStartSymbol}'`;
    const augmentedGrammar = { [augmentedStartSymbol]: [[originalStartSymbol]] };

    for (const nonTerminal in grammar) {
        augmentedGrammar[nonTerminal] = grammar[nonTerminal];
    }

    return augmentedGrammar;
};

module.exports = { augmentGrammar };