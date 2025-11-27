function removeLeftRecursion(grammar) {
  const nonTerminals = Object.keys(grammar);
  const newGrammar = {};

  for (let i = 0; i < nonTerminals.length; i++) {
    const Ai = nonTerminals[i];
    let prods = grammar[Ai];

    for (let j = 0; j < i; j++) {
      const Aj = nonTerminals[j];
      const replaced = [];

      for (const prod of prods) {
        if (prod[0] === Aj) {
          for (const gamma of newGrammar[Aj]) {
            replaced.push([...gamma, ...prod.slice(1)]);
          }
        } else {
          replaced.push(prod);
        }
      }

      prods = replaced;
    }

    const directRec = prods.filter(p => p[0] === Ai);
    const nonRec   = prods.filter(p => p[0] !== Ai);

    if (directRec.length === 0) {
      newGrammar[Ai] = prods;
      continue;
    }

    const AiPrime = Ai + "'";

    newGrammar[Ai] = nonRec.map(p => [...p, AiPrime]);

    newGrammar[AiPrime] = directRec.map(p => [...p.slice(1), AiPrime]);
    newGrammar[AiPrime].push(["ε"]);
  }

  return newGrammar;
}

module.exports = { removeLeftRecursion };
