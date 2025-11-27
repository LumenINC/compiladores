const getNonTerminals = (grammar) => {
    return Object.keys(grammar);
};

const getTerminals = (grammar) => {
    const nonTerminals = getNonTerminals(grammar);
    const terminals = new Set();
    for (const nonTerminal in grammar) {
        for (const production of grammar[nonTerminal]) {
            for (const symbol of production) {
                if (!nonTerminals.includes(symbol) && symbol !== 'epsilon') {
                    terminals.add(symbol);
                }
            }
        }
    }
    return Array.from(terminals);
};

const parseGrammar = (grammarText) => {
  const grammar = {};
  const allLines = grammarText.split('\n');
  const uniqueLines = [...new Set(allLines)];
  const lines = uniqueLines.filter(
    line => line.trim() !== '' && !line.trim().startsWith('#') && line.includes('->')
  );

  for (const line of lines) {
    const [nonTerminal, productions] = line.split('->').map(s => s.trim());
    const productionList = productions.split('|').map(p => p.trim().split(' '));
    if (grammar[nonTerminal]) {
      grammar[nonTerminal].push(...productionList);
    } else {
      grammar[nonTerminal] = productionList;
    }
  }

  return grammar;
}

module.exports = { parseGrammar, getNonTerminals, getTerminals };