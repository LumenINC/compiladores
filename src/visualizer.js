const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const LL1_PATH = path.join(__dirname, 'grammar-converter/ll1_table.json');
const SLR_PATH = path.join(__dirname, 'slr-parser/slr-table.json');
const TREE_PATH = path.join(__dirname, '../parse_tree.json');
const OUTPUT_HTML = path.join(__dirname, '../relatorio_compilador.html');

function generateHTML() {
    console.log("Gerando relatório visual completo...");
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Visualização do Compilador</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #f4f4f9; color: #333; }
            h1, h2, h3 { color: #2c3e50; text-align: center; }
            h2 { border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 40px; }
            
            .container { max-width: 95%; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 8px; margin-bottom: 30px; }
            
            /* TABELAS */
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #2980b9; color: white; position: sticky; top: 0; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:hover { background-color: #e1f5fe; }
            
            /* Células Coloridas */
            .cell-shift { color: #0056b3; background-color: #e3f2fd; font-weight: bold; }
            .cell-reduce { color: #2e7d32; background-color: #e8f5e9; font-weight: bold; }
            .cell-accept { color: #6a1b9a; background: #f3e5f5; font-weight: bold; }
            .cell-goto { color: #d35400; font-weight: bold; }
            .set-cell { font-family: monospace; color: #444; }

            /* ÁRVORE */
            .tree { display: flex; justify-content: center; margin-top: 30px; overflow-x: auto; padding-bottom: 20px; }
            .tree ul { padding-top: 20px; position: relative; display: flex; justify-content: center; }
            .tree li { float: left; text-align: center; list-style-type: none; position: relative; padding: 20px 5px 0 5px; }
            /* Conectores da árvore */
            .tree li::before, .tree li::after {
                content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #ccc; width: 50%; height: 20px;
            }
            .tree li::after { right: auto; left: 50%; border-left: 2px solid #ccc; }
            .tree li:only-child::after, .tree li:only-child::before { display: none; }
            .tree li:only-child { padding-top: 0; }
            .tree li:first-child::before, .tree li:last-child::after { border: 0 none; }
            .tree li:last-child::before { border-right: 2px solid #ccc; border-radius: 0 5px 0 0; }
            .tree li:first-child::after { border-radius: 5px 0 0 0; }
            .tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #ccc; width: 0; height: 20px; }
            
            /* Nós da árvore */
            .node {
                border: 2px solid #ccc; padding: 8px; text-decoration: none; color: #666; font-size: 12px;
                display: inline-block; border-radius: 5px; background: white; transition: all 0.3s; min-width: 50px;
            }
            .node:hover { transform: scale(1.1); z-index: 10; border-color: #94a0b4; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .node-nt { border-color: #f39c12; color: #d35400; font-weight: bold; background: #fef5e7; }
            .node-t { border-color: #27ae60; color: #fff; background: #2ecc71; }
            .node-val { display: block; font-size: 10px; color: #333; margin-top: 2px; font-style: italic;}
        </style>
    </head>
    <body>
        <h1>📊 Relatório Final do Compilador</h1>
    `;

    // 1. FIRST & FOLLOW
    html += `<div class="container"><h2>1. Conjuntos FIRST e FOLLOW</h2>`;
    try {
        if (fs.existsSync(LL1_PATH)) {
            const ll1Data = JSON.parse(fs.readFileSync(LL1_PATH, 'utf-8'));
            html += generateFirstFollowTable(ll1Data.FIRST, ll1Data.FOLLOW);
        } else {
            html += `<p style="color:red">Arquivo LL1 não encontrado.</p>`;
        }
    } catch (e) { html += `<p>Erro: ${e.message}</p>`; }
    html += `</div>`;

    // 2. ÁRVORE SINTÁTICA
    html += `<div class="container"><h2>2. Árvore Sintática (Parse Tree)</h2>`;
    try {
        if (fs.existsSync(TREE_PATH)) {
            const treeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf-8'));
            html += `<div class="tree"><ul>` + generateTreeHTML(treeData) + `</ul></div>`;
        } else {
            html += `<p style="color:red; text-align:center">⚠️ Árvore não encontrada. Rode 'node src/main.js' primeiro.</p>`;
        }
    } catch (e) { html += `<p>Erro na árvore: ${e.message}</p>`; }
    html += `</div>`;

    // 3. TABELAS DE PARSING
    html += `<div class="container"><h2>3. Tabelas de Parsing</h2>`;
    
    // Tabela LL(1)
    if (fs.existsSync(LL1_PATH)) {
        const ll1Data = JSON.parse(fs.readFileSync(LL1_PATH, 'utf-8'));
        html += `<h3>Tabela LL(1) (Descendente)</h3>`;
        html += generateLL1Grid(ll1Data.table);
    }

    // Tabela SLR
    if (fs.existsSync(SLR_PATH)) {
        const slrData = JSON.parse(fs.readFileSync(SLR_PATH, 'utf-8'));
        html += `<h3>Tabela SLR (Ascendente)</h3>`;
        html += generateSLRGrid(slrData);
    }
    
    html += `</div></body></html>`;
    fs.writeFileSync(OUTPUT_HTML, html);
    console.log(`✅ Relatório Visual gerado em: \n   ${OUTPUT_HTML}`);
}

// --- GERADORES HTML ---

function generateFirstFollowTable(first, follow) {
    let s = `<table><thead><tr><th>Não-Terminal</th><th>FIRST</th><th>FOLLOW</th></tr></thead><tbody>`;
    const keys = Object.keys(first).sort();
    for (const k of keys) {
        if (first[k] && follow[k]) {
            s += `<tr>
                <td><strong>${k}</strong></td>
                <td class="set-cell">{ ${first[k].join(', ')} }</td>
                <td class="set-cell">{ ${follow[k].join(', ')} }</td>
            </tr>`;
        }
    }
    s += `</tbody></table>`;
    return s;
}

function generateTreeHTML(node) {
    const isTerminal = !node.children || node.children.length === 0;
    const cssClass = isTerminal ? 'node node-t' : 'node node-nt';
    let label = node.type || node.nonTerminal || 'NoName';
    
    let valueDisplay = '';
    if (node.value && node.value !== label) {
        valueDisplay = `<span class="node-val">"${node.value}"</span>`;
    }

    let html = `<li><div class="${cssClass}">${label}${valueDisplay}</div>`;

    if (!isTerminal) {
        html += `<ul>`;
        node.children.forEach(child => html += generateTreeHTML(child));
        html += `</ul>`;
    }
    html += `</li>`;
    return html;
}

function generateLL1Grid(table) {
    const nts = Object.keys(table).sort();
    const ts = new Set();
    nts.forEach(k => Object.keys(table[k]).forEach(t => ts.add(t)));
    const sortedTs = Array.from(ts).sort();

    let s = `<div style="overflow-x:auto;"><table><thead><tr><th>NT</th>${sortedTs.map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>`;
    nts.forEach(nt => {
        s += `<tr><td><strong>${nt}</strong></td>`;
        sortedTs.forEach(t => {
            const p = table[nt][t];
            s += `<td>${p ? (Array.isArray(p)?p.join(' '):p) : '-'}</td>`;
        });
        s += `</tr>`;
    });
    return s + `</tbody></table></div>`;
}

function generateSLRGrid(data) {
    const { action, goto } = data;
    const states = Object.keys(action).sort((a,b)=>a-b);
    const ts = new Set(); const nts = new Set();
    states.forEach(s => {
        if(action[s]) Object.keys(action[s]).forEach(k=>ts.add(k));
        if(goto[s]) Object.keys(goto[s]).forEach(k=>nts.add(k));
    });
    const sTs = Array.from(ts).sort();
    const sNts = Array.from(nts).sort();

    let s = `<div style="overflow-x:auto;"><table><thead><tr><th>Estado</th><th colspan="${sTs.length}">Action</th><th colspan="${sNts.length}">Goto</th></tr><tr><th></th>${sTs.map(t=>`<th>${t}</th>`).join('')}${sNts.map(n=>`<th style="background:#e67e22;color:white">${n}</th>`).join('')}</tr></thead><tbody>`;
    
    states.forEach(st => {
        s += `<tr><td><strong>${st}</strong></td>`;
        sTs.forEach(t => {
            const v = action[st][t];
            let c = '';
            if(v){ if(v.startsWith('s')) c='cell-shift'; else if(v.startsWith('r')) c='cell-reduce'; else if(v=='accept') c='cell-accept'; }
            s += `<td class="${c}">${v||'-'}</td>`;
        });
        sNts.forEach(nt => {
            s += `<td class="cell-goto">${(goto[st]&&goto[st][nt])||'-'}</td>`;
        });
        s += `</tr>`;
    });
    return s + `</tbody></table></div>`;
}

generateHTML();