const closure = (items, grammar) => {
    // Usar um Set de strings para evitar duplicatas de forma eficiente
    const closureMap = new Map();
    items.forEach(item => closureMap.set(JSON.stringify(item), item));

    let changed = true;
    while (changed) {
        changed = false;
        for (const item of Array.from(closureMap.values())) {
            const { rule, dot } = item;
            const production = rule.production;

            if (dot < production.length) {
                const symbol = production[dot];
                // Se o símbolo após o ponto é um Não-Terminal (existe na gramática)
                if (grammar[symbol]) { 
                    for (const newProduction of grammar[symbol]) {
                        const newItem = {
                            rule: { nonTerminal: symbol, production: newProduction },
                            dot: 0
                        };
                        const itemKey = JSON.stringify(newItem);
                        if (!closureMap.has(itemKey)) {
                            closureMap.set(itemKey, newItem);
                            changed = true;
                        }
                    }
                }
            }
        }
    }
    return Array.from(closureMap.values());
};

const goTo = (items, symbol, grammar) => {
    const newItems = [];
    for (const item of items) {
        const { rule, dot } = item;
        const production = rule.production;

        // Verifica se o símbolo no ponto é o símbolo de transição
        if (dot < production.length && production[dot] === symbol) {
            newItems.push({ 
                rule: rule, 
                dot: dot + 1 
            });
        }
    }
    return closure(newItems, grammar);
};

// Função auxiliar para gerar uma chave única para o estado (ordena os itens)
const stateToString = (stateItems) => {
    const sorted = stateItems.map(item => {
        // Normaliza a representação do item
        return `${item.rule.nonTerminal}->${item.rule.production.join(' ')}@${item.dot}`;
    }).sort();
    return sorted.join('|');
};

const buildLR0Items = (grammar) => {
    // 1. Criar o estado inicial
    const startSymbol = Object.keys(grammar)[0]; // Geralmente Program'
    const initialProduction = grammar[startSymbol][0];
    
    const initialItem = {
        rule: { nonTerminal: startSymbol, production: initialProduction },
        dot: 0
    };

    const initialClosure = closure([initialItem], grammar);
    const states = [initialClosure];
    const transitions = [{}]; // Array de objetos { simbolo: proximoEstadoIndex }
    
    const statesMap = new Map(); // Mapa de "String do Estado" -> Índice
    statesMap.set(stateToString(initialClosure), 0);

    const stateQueue = [0];

    while (stateQueue.length > 0) {
        const currentStateIndex = stateQueue.shift();
        const currentItems = states[currentStateIndex];

        // Identificar todos os símbolos que podem causar transição (após o ponto)
        const symbols = new Set();
        currentItems.forEach(item => {
            if (item.dot < item.rule.production.length) {
                symbols.add(item.rule.production[item.dot]);
            }
        });

        for (const symbol of symbols) {
            // Ignorar transição em cima de epsilon (epsilon é uma redução, não shift)
            if (symbol === 'ε') continue;

            const nextItems = goTo(currentItems, symbol, grammar);
            
            if (nextItems.length > 0) {
                const nextStateString = stateToString(nextItems);
                let nextStateIndex = statesMap.get(nextStateString);

                if (nextStateIndex === undefined) {
                    nextStateIndex = states.length;
                    states.push(nextItems);
                    transitions.push({});
                    statesMap.set(nextStateString, nextStateIndex);
                    stateQueue.push(nextStateIndex);
                }
                
                // Grava a transição: Estado Atual + Simbolo -> Próximo Estado
                if (!transitions[currentStateIndex]) transitions[currentStateIndex] = {};
                transitions[currentStateIndex][symbol] = nextStateIndex;
            }
        }
    }

    // Formatação para visualização (opcional, mas útil para debug no JSON)
    const formatItem = (item) => {
        const production = [...item.rule.production];
        production.splice(item.dot, 0, '.');
        return `${item.rule.nonTerminal} -> ${production.join(' ')}`;
    };
    const formattedStates = states.map(state => state.map(formatItem));

    return { states: formattedStates, transitions };
};

module.exports = { closure, goTo, buildLR0Items };