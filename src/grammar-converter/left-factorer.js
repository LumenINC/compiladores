// left-factorer.js
// Aplica fatoração à esquerda completa

function leftFactor(grammar) {
  let changed = true;

  while (changed) {
    changed = false;

    for (const A of Object.keys(grammar)) {
      const prods = grammar[A];
      const groups = {};

      for (const prod of prods) {
        const key = prod[0];
        if (!groups[key]) groups[key] = [];
        groups[key].push(prod);
      }

      for (const key in groups) {
        const group = groups[key];
        if (group.length < 2) continue;

        const prefix = longestPrefix(group);
        if (prefix.length < 1) continue;

        changed = true;

        const A2 = A + "'";

        grammar[A] = [
          ...prods.filter(p => !group.includes(p)),
          [...prefix, A2]
        ];

        grammar[A2] = group.map(prod => {
          const rest = prod.slice(prefix.length);
          return rest.length ? rest : ["ε"];
        });

        break;
      }
    }
  }

  return grammar;
}

function longestPrefix(list) {
  let prefix = [...list[0]];

  for (const prod of list.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < prod.length && prefix[i] === prod[i]) {
      i++;
    }
    prefix = prefix.slice(0, i);
  }

  return prefix;
}

module.exports = { leftFactor };
