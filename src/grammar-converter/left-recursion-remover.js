function removeLeftRecursion(grammar) {
  const newGrammar = {};

  for (const nonTerminal in grammar) {
    const productions = grammar[nonTerminal];
    const recursiveProductions = [];
    const nonRecursiveProductions = [];

    let hasRecursion = false;
    for (const production of productions) {
      if (production[0] === nonTerminal) {
        recursiveProductions.push(production.slice(1));
        hasRecursion = true;
      } else {
        nonRecursiveProductions.push(production);
      }
    }

    if (hasRecursion) {
      const newNonTerminal = nonTerminal + "'";
      newGrammar[nonTerminal] = nonRecursiveProductions.map(prod => [...prod, newNonTerminal]);

      newGrammar[newNonTerminal] = recursiveProductions.map(prod => [...prod, newNonTerminal]);
      newGrammar[newNonTerminal].push(['ε']);
    } else {
      newGrammar[nonTerminal] = productions;
    }
  }

  return newGrammar;
}

module.exports = { removeLeftRecursion };