// build_ll1_independente.js
// ----------------------------------------------
// GERADOR INDEPENDENTE DE FIRST, FOLLOW E TABELA LL(1)
// NÃO DEPENDE DE NENHUM ARQUIVO DO PROJETO
// ----------------------------------------------

const fs = require("fs");

// ----------------------------------------------------
// 1. GRAMÁTICA CORRIGIDA (FORMA LL(1))
// ----------------------------------------------------
const grammar = {
  Program: [["StmtList", "EOF"]],

  StmtList: [["Stmt", "StmtList"], ["ε"]],

  Stmt: [["Decl"], ["Assign"], ["If"], ["While"], ["Print"], ["Block"]],

  Decl: [["var", "id", "DeclTail"]],

  DeclTail: [["=", "Expr", ";"], [";"]],

  Assign: [["id", "=", "Expr", ";"]],

  If: [["if", "(", "Expr", ")", "Stmt", "ElseOpt"]],

  ElseOpt: [["else", "Stmt"], ["ε"]],

  While: [["while", "(", "Expr", ")", "Stmt"]],

  Print: [["print", "(", "Expr", ")", ";"]],

  Block: [["{", "StmtList", "}"]],

  // EXPRESSÕES
  Expr: [["Term", "Expr'"]],

  "Expr'": [["+", "Term", "Expr'"], ["ε"]],

  Term: [["Factor", "Term'"]],

  "Term'": [["*", "Factor", "Term'"], ["ε"]],

  Factor: [["(", "Expr", ")"], ["id"], ["number"]],

  id: [["IDENTIFIER"]],
  number: [["NUMBER"]],
};

// ----------------------------------------------
// UTILITÁRIOS
// ----------------------------------------------
function isTerminal(sym) {
  if (sym === "ε") return true;
  return !(sym in grammar);
}

function computeFIRST() {
  const FIRST = {};
  for (const nt in grammar) FIRST[nt] = new Set();

  let changed = true;
  while (changed) {
    changed = false;

    for (const nt in grammar) {
      for (const production of grammar[nt]) {
        for (const symbol of production) {
          if (isTerminal(symbol)) {
            if (!FIRST[nt].has(symbol)) {
              FIRST[nt].add(symbol);
              changed = true;
            }
            break;
          }

          const before = FIRST[nt].size;
          for (const t of FIRST[symbol]) {
            if (t !== "ε") FIRST[nt].add(t);
          }
          if (!FIRST[symbol].has("ε")) break;

          const after = FIRST[nt].size;
          if (after > before) changed = true;
        }
      }
    }
  }
  return FIRST;
}

function computeFOLLOW(FIRST) {
  const FOLLOW = {};
  for (const nt in grammar) FOLLOW[nt] = new Set();
  FOLLOW["Program"].add("$");

  let changed = true;

  while (changed) {
    changed = false;

    for (const nt in grammar) {
      for (const production of grammar[nt]) {
        for (let i = 0; i < production.length; i++) {
          const B = production[i];
          if (!(B in grammar)) continue;

          let FIRST_beta = new Set();

          for (let j = i + 1; j < production.length; j++) {
            const sym = production[j];

            if (isTerminal(sym)) {
              FIRST_beta.add(sym);
              break;
            }

            for (const t of FIRST[sym]) FIRST_beta.add(t);
            if (!FIRST[sym].has("ε")) break;

            if (j === production.length - 1) FIRST_beta.add("ε");
          }

          const before = FOLLOW[B].size;

          for (const t of FIRST_beta) {
            if (t !== "ε") FOLLOW[B].add(t);
          }

          if (FIRST_beta.has("ε") || FIRST_beta.size === 0) {
            for (const t of FOLLOW[nt]) FOLLOW[B].add(t);
          }

          const after = FOLLOW[B].size;
          if (after > before) changed = true;
        }
      }
    }
  }

  return FOLLOW;
}

function computeTable(FIRST, FOLLOW) {
  const table = {};

  for (const nt in grammar) {
    table[nt] = {};
    const terminals = new Set([
      ...Object.values(grammar)
        .flat()
        .flat()
        .filter(isTerminal),
    ]);

    terminals.add("$");

    for (const t of terminals) {
      table[nt][t] = null;
    }

    for (const production of grammar[nt]) {
      let FIRST_alpha = new Set();

      for (const symbol of production) {
        if (isTerminal(symbol)) {
          FIRST_alpha.add(symbol);
          break;
        }

        for (const t of FIRST[symbol]) FIRST_alpha.add(t);
        if (!FIRST[symbol].has("ε")) break;
      }

      for (const t of FIRST_alpha) {
        if (t !== "ε") table[nt][t] = production;
      }

      if (FIRST_alpha.has("ε")) {
        for (const t of FOLLOW[nt]) {
          table[nt][t] = production;
        }
      }
    }
  }

  return table;
}

// ----------------------------------------------
// EXECUÇÃO
// ----------------------------------------------

const FIRST = computeFIRST();
const FOLLOW = computeFOLLOW(FIRST);
const TABLE = computeTable(FIRST, FOLLOW);

const output = {
  grammar,
  FIRST: Object.fromEntries(
    Object.entries(FIRST).map(([k, v]) => [k, [...v]])
  ),
  FOLLOW: Object.fromEntries(
    Object.entries(FOLLOW).map(([k, v]) => [k, [...v]])
  ),
  table: TABLE,
};

fs.writeFileSync("tabela_ll1_independente.json", JSON.stringify(output, null, 2));
console.log("Tabela LL(1) gerada em tabela_ll1_independente.json");