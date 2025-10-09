// src/parser.js
const fs = require('fs');
const path = require('path');
const { tokenize } = require('./lexer');

// Parser com suporte a múltiplas instruções, blocos e estruturas de controle
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const body = [];
        while (!this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) body.push(stmt);
            else this.advance(); // evita loop infinito em caso de erro
        }
        return { type: "Program", body };
    }

    parseStatement() {
        if (this.match('KEYWORD', 'let')) return this.parseVariableDeclaration();
        if (this.match('KEYWORD', 'for')) return this.parseForStatement();
        if (this.match('KEYWORD', 'while')) return this.parseWhileStatement();
        if (this.check('DELIMITER', '{')) return this.parseBlock();
        return this.parseExpressionStatement();
    }

    parseBlock() {
        this.consume('DELIMITER', '{');
        const body = [];
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            body.push(this.parseStatement());
        }
        this.consume('DELIMITER', '}');
        return { type: "BlockStatement", body };
    }

    parseVariableDeclaration() {
        const name = this.consume('IDENTIFIER', null, 'Esperado nome de variável após "let"').value;
        this.consume('OPERATOR', '=', 'Esperado "=" após nome de variável');
        const initializer = this.parseExpression();
        this.consume('DELIMITER', ';', 'Esperado ";" após declaração de variável');
        return { type: "VariableDeclaration", name, initializer };
    }

    parseExpressionStatement() {
        const expr = this.parseExpression();
        this.consume('DELIMITER', ';', 'Esperado ";" após expressão');
        return { type: "ExpressionStatement", expression: expr };
    }

    parseExpression() {
      return this.parseAssignment();
    }


    parseAssignment() {
        let expr = this.parseEquality();

        if (this.match('OPERATOR', '=')) {
            const operator = this.previous().value;
            const right = this.parseAssignment(); // recursivo: suporta encadeamento a = b = 3
            if (expr.type !== 'Identifier') {
                throw new SyntaxError(`Atribuição inválida na linha ${this.peek().line}, coluna ${this.peek().column}`);
            }
            expr = {
                type: 'AssignmentExpression',
                operator,
                left: expr,
                right
            };
        }

        return expr;
    }
    parseEquality() {
        let expr = this.parseComparison();
        while (this.match('OPERATOR', '==') || this.match('OPERATOR', '!=')) {
            const operator = this.previous().value;
            const right = this.parseComparison();
            expr = { type: "BinaryExpression", operator, left: expr, right };
        }
        return expr;
    }

    parseComparison() {
        let expr = this.parseTerm();
        while (this.match('OPERATOR', '<') || this.match('OPERATOR', '>') ||
               this.match('OPERATOR', '<=') || this.match('OPERATOR', '>=')) {
            const operator = this.previous().value;
            const right = this.parseTerm();
            expr = { type: "BinaryExpression", operator, left: expr, right };
        }
        return expr;
    }

    parseTerm() {
        let expr = this.parseFactor();
        while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
            const operator = this.previous().value;
            const right = this.parseFactor();
            expr = { type: "BinaryExpression", operator, left: expr, right };
        }
        return expr;
    }

    parseFactor() {
        let expr = this.parseUnary();
        while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/')) {
            const operator = this.previous().value;
            const right = this.parseUnary();
            expr = { type: "BinaryExpression", operator, left: expr, right };
        }
        return expr;
    }

    parseUnary() {
        if (this.match('OPERATOR', '-') || this.match('OPERATOR', '+')) {
            const operator = this.previous().value;
            const right = this.parseUnary();
            return { type: "UnaryExpression", operator, right };
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        if (this.match('NUMBER')) return { type: "Literal", value: Number(this.previous().value) };
        if (this.match('IDENTIFIER')) return { type: "Identifier", name: this.previous().value };
        if (this.match('DELIMITER', '(')) {
            const expr = this.parseExpression();
            this.consume('DELIMITER', ')', 'Esperado ")" após expressão');
            return expr;
        }
        throw new SyntaxError(`Expressão primária inesperada na linha ${this.peek().line}, coluna ${this.peek().column}. Token: '${this.peek().value}'`);
    }

    parseForStatement() {
        this.consume('DELIMITER', '(');
        this.consume('KEYWORD', 'let');
        const iterator = this.consume('IDENTIFIER').value;
        this.consume('OPERATOR', '=');
        const start = this.parseExpression();
        this.consume('DELIMITER', ';');
        const condition = this.parseExpression();
        this.consume('DELIMITER', ';');
        const updateLeft = this.consume('IDENTIFIER').value;
        this.consume('OPERATOR', '=');
        const updateRight = this.parseExpression();
        this.consume('DELIMITER', ')');
        const body = this.parseBlock();
        return {
            type: "ForStatement",
            iterator,
            start,
            condition,
            update: { left: updateLeft, right: updateRight },
            body
        };
    }

    parseWhileStatement() {
        this.consume('DELIMITER', '(');
        const condition = this.parseExpression();
        this.consume('DELIMITER', ')');
        const body = this.parseBlock();
        return { type: "WhileStatement", condition, body };
    }

    // utilitários
    match(type, value = null) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    consume(type, value = null, message = null) {
        if (this.check(type, value)) return this.advance();
        const token = this.peek();
        throw new SyntaxError(message || `Esperado ${value || type} na linha ${token.line}, coluna ${token.column}`);
    }

    check(type, value = null) {
        if (this.isAtEnd()) return false;
        const token = this.peek();
        if (token.type !== type) return false;
        if (value && token.value !== value) return false;
        return true;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.current >= this.tokens.length;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }
}

if (require.main === module) {
    const filePath = path.join(__dirname, 'sample_code.js');
    const source = fs.readFileSync(filePath, 'utf-8');
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));
}

module.exports = { Parser };
