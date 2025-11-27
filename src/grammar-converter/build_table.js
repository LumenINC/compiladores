/**
 * build_table.js — Versão que normaliza símbolos entre aspas
 *
 * - Lê docs/gramatica.txt (mantendo "..." nos terminais)
 * - Normaliza terminais removendo aspas internamente
 * - Calcula FIRST, FOLLOW e tabela LL(1)
 * - Salva ll1_table.json em src/grammar-converter/
 */

const fs = require("fs");
const path = require("path");
const { parseGrammar } = require("./grammar-parser");
const { removeLeftRecursion } = require("./left-recursion-remover");
const { leftFactor } = require("./left-factorer");

// ----- Helpers -----

// Remove aspas ao redor de um símbolo, se presentes.
// Ex: "\"var\"" -> "var", '"+"' -> '+', otherwise returns symbol unchanged.
function normalizeSymbol(sym) {
  if (typeof sym !== "string") return sym;
  sym = sym.trim();
  if ((sym.startsWith('"') && sym.endsWith('"')) || (sym.startsWith("'") && sym.endsWith("'"))) {
    return sym.slice(1, -1);
  }
  return sym;
}

// Mantém a gramática original (com aspas) mas cria uma versão "normalizada"
// onde todos os símbolos terminais escritos com aspas viram símbolos sem aspas.
// Também retorna a lista de nonterminals e terminals normalizados.
function normalizeGrammar(grammarRaw) {
  const grammar = {}; // normalized grammar
  const nonterminals = Object.keys(grammarRaw);

  for (const A of nonterminals) {
    grammar[A] = grammarRaw[A].map(prod => prod.map(sym => normalizeSymbol(sym)));
  }

  // collect terminals: any symbol that is not a nonterminal
  const terms = new Set();
  for (const prods of Object.values(grammar)) {
    for (const p of prods) {
      for (const s of p) {
        if (!nonterminals.includes(s) && s !== "ε") terms.add(s);
      }
    }
  }
  // add common EOF symbols
  terms.add("EOF");
  terms.add("$");

  return { grammar, nonterminals, terminals: [...terms] };
}

// ----- FIRST / FOLLOW -----
// These functions expect the *normalized* grammar (symbols without surrounding quotes).

function computeFirstSets(grammar) {
  const FIRST = {};
  const nonterminals = Object.keys(grammar);

  for (const nt of nonterminals) FIRST[nt] = new Set();

  let changed = true;
  while (changed) {
    changed = false;

    for (const A of nonterminals) {
      for (const prod of grammar[A]) {
        // epsilon production
        if (prod.length === 1 && prod[0] === "ε") {
          if (!FIRST[A].has("ε")) {
            FIRST[A].add("ε");
            changed = true;
          }
          continue;
        }

        let nullablePrefix = true;
        for (const X of prod) {
          if (!nonterminals.includes(X)) {
            // X is terminal
            if (!FIRST[A].has(X)) {
              FIRST[A].add(X);
              changed = true;
            }
            nullablePrefix = false;
            break;
          } else {
            // X is nonterminal
            for (const t of FIRST[X]) {
              if (t !== "ε" && !FIRST[A].has(t)) {
                FIRST[A].add(t);
                changed = true;
              }
            }
            if (!FIRST[X].has("ε")) {
              nullablePrefix = false;
              break;
            }
          }
        }

        if (nullablePrefix) {
          if (!FIRST[A].has("ε")) {
            FIRST[A].add("ε");
            changed = true;
          }
        }
      }
    }
  }

  // convert sets to arrays for JSON output
  const FIRSTjson = {};
  for (const k of Object.keys(FIRST)) FIRSTjson[k] = [...FIRST[k]];
  return FIRSTjson;
}

function computeFollowSets(grammar, FIRST, startSymbol) {
  const FOLLOW = {};
  const nonterminals = Object.keys(grammar);
  for (const nt of nonterminals) FOLLOW[nt] = new Set();
  FOLLOW[startSymbol].add("$");

  let changed = true;
  while (changed) {
    changed = false;

    for (const A of nonterminals) {
      for (const prod of grammar[A]) {
        for (let i = 0; i < prod.length; i++) {
          const B = prod[i];
          if (!nonterminals.includes(B)) continue;

          const beta = prod.slice(i + 1);

          // compute FIRST(beta)
          const firstBeta = new Set();
          let allNullable = true;
          if (beta.length === 0) {
            allNullable = true;
          } else {
            for (const X of beta) {
              if (!nonterminals.includes(X)) {
                firstBeta.add(X);
                allNullable = false;
                break;
              } else {
                for (const t of FIRST[X]) if (t !== "ε") firstBeta.add(t);
                if (!FIRST[X].includes("ε")) {
                  allNullable = false;
                  break;
                }
              }
            }
          }

          // add FIRST(beta) \ {ε} to FOLLOW(B)
          for (const t of firstBeta) {
            if (!FOLLOW[B].has(t)) {
              FOLLOW[B].add(t);
              changed = true;
            }
          }

          // if FIRST(beta) contains ε (i.e. allNullable true) then add FOLLOW(A) to FOLLOW(B)
          if (allNullable) {
            for (const t of FOLLOW[A]) {
              if (!FOLLOW[B].has(t)) {
                FOLLOW[B].add(t);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  const FOLLOWjson = {};
  for (const k of Object.keys(FOLLOW)) FOLLOWjson[k] = [...FOLLOW[k]];
  return FOLLOWjson;
}

// ----- FIRST of a production (returns a Set) -----
// production is array of symbols (normalized)
function firstOfProduction(prod, FIRST, grammar) {
  const out = new Set();
  const nonterminals = Object.keys(grammar);

  if (prod.length === 1 && prod[0] === "ε") {
    out.add("ε");
    return out;
  }

  for (const X of prod) {
    if (!nonterminals.includes(X)) {
      out.add(X);
      return out;
    }
    for (const t of FIRST[X]) {
      if (t !== "ε") out.add(t);
    }
    if (!FIRST[X].includes("ε")) {
      return out;
    }
  }

  out.add("ε");
  return out;
}

// ----- Build LL(1) table -----
// table[A][terminal] = production (array)  or null
function buildLL1Table(grammar, FIRST, FOLLOW, terminals) {
  const table = {};
  const nonterminals = Object.keys(grammar);

  for (const A of nonterminals) {
    table[A] = {};
    for (const t of terminals) table[A][t] = null;
  }

  for (const A of nonterminals) {
    for (const prod of grammar[A]) {
      const firstSet = firstOfProduction(prod, FIRST, grammar);
      for (const a of firstSet) {
        if (a !== "ε") table[A][a] = prod;
      }
      if (firstSet.has("ε")) {
        for (const b of FOLLOW[A]) {
          table[A][b] = prod;
        }
      }
    }
  }

  return table;
}

// ----- Main -----
function main() {
  const grammarFile = path.join(__dirname, "../../docs/gramatica.txt");
  if (!fs.existsSync(grammarFile)) {
    console.error("Arquivo de gramática não encontrado em", grammarFile);
    process.exit(1);
  }

  const raw = fs.readFileSync(grammarFile, "utf8");
  const rawGrammar = parseGrammar(raw);

  // Normalize grammar (remove quotes from terminals)
  const { grammar, nonterminals, terminals } = normalizeGrammar(rawGrammar);

  // Remove left recursion and left-factor (these functions expect raw grammar form,
  // but we will apply them to the normalized grammar as that's what we compute FIRST/FOLLOW on)
  // NOTE: if your removeLeftRecursion/leftFactor expect quoted tokens, pass rawGrammar instead.
  // Here we assume they work on arrays of symbols — we'll call them on rawGrammar then normalize again.
  // To be robust: call on rawGrammar and then normalize result.
  let transformed = removeLeftRecursion(rawGrammar);
  transformed = leftFactor(transformed);
  const normalized = normalizeGrammar(transformed);
  const G = normalized.grammar;
  const NT = normalized.nonterminals;
  const TERMS = normalized.terminals;

  // Compute FIRST / FOLLOW
  const FIRST = computeFirstSets(G); // returns object with arrays inside
  // computeFirstSets expects full sets, but earlier function returned arrays; our helper expects sets,
  // so convert FIRST back to form used by computeFollow and firstOfProduction:
  const FIRSTsets = {};
  for (const k of Object.keys(FIRST)) FIRSTsets[k] = FIRST[k].slice ? FIRST[k] : FIRST[k];

  // But computeFollowSets expects FIRST as object with arrays; we implemented computeFollowSets using FIRST arrays above
  const FIRSTarr = FIRST; // already arrays by computeFirstSets
  const FOLLOW = computeFollowSets(G, FIRSTarr, NT[0]);

  // Build table
  const table = buildLL1Table(G, FIRSTarr, FOLLOW, TERMS);

  const output = {
    grammar: G,
    nonterminals: NT,
    terminals: TERMS,
    FIRST: FIRSTarr,
    FOLLOW,
    table
  };

  const outFile = path.join(__dirname, "ll1_table.json");
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf8");
  console.log("✔ Tabela LL(1) gerada em:", outFile);
}

main();
