// src/parser.js
// ========================================
// Analisador Sintático (Parser) - VERSÃO FINAL E CORRIGIDA
// ========================================

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  // Retorna o token atual sem consumi-lo
  currentToken() {
    return this.tokens[this.position];
  }

  // Avança para o próximo token
  advance() {
    this.position++;
  }

  // Valida e consome o token esperado
  expect(type, value) {
    const token = this.currentToken();
    if (!token || token.type !== type || (value && token.value !== value)) {
      const found = token ? `(tipo: ${token.type}, valor: '${token.value}') na linha ${token.line}, coluna ${token.column}` : 'fim de arquivo';
      throw new Error(`SyntaxError: Esperado ${type} ${value || ''}, mas encontrado ${found}.`);
    }
    this.advance();
    return token;
  }

  // Ponto de entrada para a análise
  parse() {
    const body = [];
    while (this.position < this.tokens.length) {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }
  
  // Analisa uma declaração
  parseStatement() {
    const token = this.currentToken();
    switch (token.value){
        case 'let': case 'const': case 'var': return this.parseVariableDeclaration();
        case 'if': return this.parseIfStatement();
        case 'while': return this.parseWhileStatement();
        case 'for': return this.parseForStatement();
        default: return this.parseExpression();
    }
  }

  parseVariableDeclaration() {
    this.advance(); // consome 'let', 'const' ou 'var'
    const id = this.expect('IDENTIFIER');
    this.expect('OPERATOR', '=');
    const init = this.parseExpression();
    this.expect('DELIMITER', ';');
    return { type: 'VariableDeclaration', identifier: id.value, value: init };
  }

  parseIfStatement() {
    this.advance(); // consome 'if'
    this.expect('DELIMITER', '(');
    const test = this.parseExpression();
    this.expect('DELIMITER', ')');
    const consequent = this.parseBlockStatement();
    let alternate = null;
    if (this.currentToken() && this.currentToken().value === 'else') {
      this.advance(); // consome 'else'
      alternate = this.parseBlockStatement();
    }
    return { type: 'IfStatement', test, consequent, alternate };
  }

  parseWhileStatement() {
    this.advance(); // consome 'while'
    this.expect('DELIMITER', '(');
    const test = this.parseExpression();
    this.expect('DELIMITER', ')');
    const body = this.parseBlockStatement();
    return { type: 'WhileStatement', test, body };
  }

  parseForStatement() {
      this.advance(); // consome 'for'
      this.expect('DELIMITER', '(');

      let init = null;
      if (this.currentToken().value !== ';') {
          init = this.parseVariableDeclaration();
      } else {
          this.expect('DELIMITER', ';');
      }

      let test = null;
      if (this.currentToken().value !== ';') {
          test = this.parseExpression();
      }
      this.expect('DELIMITER', ';');

      let update = null;
      if (this.currentToken().value !== ')') {
          update = this.parseExpression();
      }
      this.expect('DELIMITER', ')');
      
      const body = this.parseBlockStatement();
      return { type: 'ForStatement', init, test, update, body };
  }
  
  parseBlockStatement() {
    this.expect('DELIMITER', '{');
    const body = [];
    while (this.currentToken() && this.currentToken().value !== '}') {
      body.push(this.parseStatement());
    }
    this.expect('DELIMITER', '}');
    return { type: 'BlockStatement', body };
  }
  
  parseExpressionStatement() {
    const expression = this.parseExpression();
    this.expect('DELIMITER', ';');
    return { type: 'ExpressionStatement', expression };
  }

  // --- Análise de Expressão com Precedência de Operador (Pratt Parser) ---

  getPrecedence(token) {
    if (token.type !== 'OPERATOR') return 0;
    switch (token.value) {
      case '*': case '/': return 2;
      case '+': case '-': return 1;
      case '<': case '>': case '==': return 0;
      default: return 0;
    }
  }

  parseExpression(precedence = 0) {
    let left = this.parsePrimaryExpression();

    while (this.position < this.tokens.length) {
      const operatorToken = this.currentToken();
      if (!operatorToken || this.getPrecedence(operatorToken) < precedence) {
        break;
      }
      
      this.advance();
      const right = this.parseExpression(this.getPrecedence(operatorToken) + 1);
      left = { type: 'BinaryExpression', operator: operatorToken.value, left, right };
    }
    return left;
  }
  
  parsePrimaryExpression() {
    const token = this.currentToken();

    switch (token.type) {
      case 'NUMBER':
        this.advance(); // Consome o token AQUI
        return { type: 'NumericLiteral', value: Number(token.value) };
      
      case 'IDENTIFIER':
        this.advance(); // Consome o token AQUI
        if (this.currentToken() && this.currentToken().type === 'OPERATOR' && this.currentToken().value === '=') {
          this.advance();
          const right = this.parseExpression();
          return { type: 'AssignmentExpression', left: { type: 'Identifier', name: token.value }, right };
        }
        return { type: 'Identifier', name: token.value };

      case 'DELIMITER':
        if (token.value === '(') {
          this.advance(); // Consome o '(' AQUI
          const expression = this.parseExpression();
          this.expect('DELIMITER', ')');
          return expression;
        }
      
      default:
        throw new Error(`SyntaxError: Expressão primária inesperada na linha ${token.line}, coluna ${token.column}. Token: '${token.value}'`);
    }
  }

} // <--- Chave de fechamento da classe

module.exports = { Parser };