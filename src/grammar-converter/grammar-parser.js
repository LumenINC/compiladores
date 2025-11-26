function parseGrammar(text) {
  const grammar = {};
  const allLines = text.split('\n');
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

module.exports = { parseGrammar };