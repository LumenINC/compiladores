// src/grammar-converter/left-factorer.js

function findLongestCommonPrefix(productions) {
  if (!productions || productions.length === 0) {
    return [];
  }

  const shortestProd = productions.reduce((a, b) => (a.length < b.length ? a : b));
  let commonPrefix = [];

  for (let i = 0; i < shortestProd.length; i++) {
    const symbol = shortestProd[i];
    if (productions.every(p => p[i] === symbol)) {
      commonPrefix.push(symbol);
    } else {
      break;
    }
  }

  return commonPrefix;
}

function leftFactor(grammar) {
  let newGrammar = { ...grammar };
  let changed = true;

  while (changed) {
    changed = false;
    const nonTerminals = Object.keys(newGrammar);

    for (const nt of nonTerminals) {
      const productions = newGrammar[nt];
      const groups = {};

      for (const prod of productions) {
        if (prod.length > 0 && prod[0] !== 'ε') {
          const firstSymbol = prod[0];
          if (!groups[firstSymbol]) {
            groups[firstSymbol] = [];
          }
          groups[firstSymbol].push(prod);
        }
      }

      for (const firstSymbol in groups) {
        const group = groups[firstSymbol];
        if (group.length > 1) {
          changed = true;
          const newNonTerminal = nt + "'";

          const commonPrefix = findLongestCommonPrefix(group);

          const newProductions = group.map(prod => {
            const suffix = prod.slice(commonPrefix.length);
            return suffix.length > 0 ? suffix : ['ε'];
          });

          const remainingProductions = productions.filter(p => !group.includes(p));
          newGrammar[nt] = [...remainingProductions, [...commonPrefix, newNonTerminal]];
          newGrammar[newNonTerminal] = newProductions;

          break; // Restart since grammar changed
        }
      }
      if (changed) break;
    }
  }

  return newGrammar;
}

module.exports = { leftFactor };