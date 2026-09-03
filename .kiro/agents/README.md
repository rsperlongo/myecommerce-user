# Code Reviewer Agent

Um agent especializado em code review que segue as melhores práticas da indústria para análise de código.

## 🎯 Objetivo

Este agent foi projetado para automatizar e padronizar o processo de code review, fornecendo análises abrangentes que cobrem:

- **Segurança** (25%): Vulnerabilidades e práticas seguras
- **Qualidade de Código** (25%): Clean Code, SOLID, DRY
- **Performance** (20%): Otimizações e gargalos
- **Arquitetura** (15%): Padrões e separação de responsabilidades
- **Testes** (10%): Cobertura e qualidade dos testes
- **Documentação** (5%): Comentários e documentação

## 📁 Estrutura de Arquivos

```
.kiro/agents/
├── code-reviewer.json          # Configuração do agent
├── code-reviewer-prompt.md     # Prompt detalhado do sistema
├── review-templates.md         # Templates para diferentes tipos de review
├── code-review-example.md      # Exemplo prático de review
├── review-script.js           # Script automático de análise
└── README.md                  # Esta documentação
```

## 🚀 Como Usar

### 1. Via Script Automático

```bash
# Revisar todos os arquivos TypeScript
node .kiro/agents/review-script.js "*.ts"

# Revisar arquivos específicos
node .kiro/agents/review-script.js "src/**/*.dto.ts" "src/**/*.service.ts"

# Revisar todo o diretório src
node .kiro/agents/review-script.js "src/**/*.ts"

# Ver configuração
node .kiro/agents/review-script.js --config

# Ver templates disponíveis
node .kiro/agents/review-script.js --templates

# Ver ajuda
node .kiro/agents/review-script.js --help
```

### 2. Via Kiro Agent (quando disponível)

```bash
# Ativar o agent de code review
/agent code-reviewer

# Fazer review de arquivos específicos
/review src/modules/auth/dtos/create-user.dto.ts

# Review completo do projeto
/review-project --scope=security --threshold=80
```

### 3. Integração com CI/CD

```yaml
# .github/workflows/code-review.yml
name: Automated Code Review
on: [pull_request]

jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Code Review Agent
        run: |
          node .kiro/agents/review-script.js "src/**/*.ts" > review-report.md
          cat review-report.md >> $GITHUB_STEP_SUMMARY
```

## 📊 Exemplo de Saída

```markdown
# 🔍 Code Review Report

## 📊 Overall Score: 75/100 (75%)

### Breakdown by Category:
### 📁 src/modules/auth/dtos/create-user.dto.ts
- 🔒 Security: 15/25
- 🏗️ Code Quality: 20/25
- ⚡ Performance: 18/20
- 🏛️ Architecture: 13/15
- 🧪 Testing: 8/10
- 📚 Documentation: 1/5

#### Issues Found:
- **CRITICAL**: Weak password validation detected
- **HIGH**: Missing JSDoc documentation
- **MEDIUM**: No input sanitization

## ✅ Approval Status
⚠️ Conditional Approval

## 📋 Summary
- **Files Analyzed**: 1
- **Critical Issues**: 1
- **High Priority Issues**: 1
- **Medium Priority Issues**: 2
- **Low Priority Issues**: 0

## 🎯 Recommendations
🚨 **URGENT**: Fix critical security vulnerabilities before deployment
🏗️ **Code Quality**: Focus on refactoring for better maintainability
```

## 🔧 Configuração

### Personalizar Critérios de Avaliação

Edite `.kiro/agents/code-reviewer.json`:

```json
{
  "reviewCriteria": {
    "security": {
      "weight": 30,  // Aumentar peso da segurança
      "checks": [
        "Custom security check",
        // ... outras verificações
      ]
    }
  }
}
```

### Adicionar Verificações Personalizadas

Edite `review-script.js`:

```javascript
// Adicionar nova verificação de segurança
{
  pattern: /your-custom-pattern/i,
  issue: 'Your custom security issue',
  severity: 'critical',
  points: -15
}
```

## 📋 Templates Disponíveis

### 1. Security-Critical Review
Para mudanças em autenticação, autorização, pagamentos.

### 2. Performance Review
Para otimizações, consultas de banco, cache.

### 3. Architecture Review
Para refatorações, novos módulos, padrões.

### 4. Testing Review
Para mudanças em testes, CI/CD, qualidade.

### 5. Documentation Review
Para APIs públicas, features complexas.

### 6. Quick Review
Para bug fixes, mudanças pequenas.

### 7. Major Feature Review
Para features grandes, releases importantes.

## 🎓 Melhores Práticas

### Para Reviewers

1. **Use o template apropriado** para o tipo de mudança
2. **Foque nos pontos críticos** primeiro (segurança, performance)
3. **Seja construtivo** e educativo nos comentários
4. **Explique o "porquê"** das recomendações
5. **Reconheça o bom trabalho** além de apontar problemas

### Para Developers

1. **Execute o script** antes de abrir PR
2. **Enderece issues críticos** primeiro
3. **Documente decisões** complexas
4. **Mantenha PRs pequenos** e focados
5. **Inclua testes** adequados

## 🔍 Verificações Implementadas

### Segurança
- ✅ Validação de senha fraca
- ✅ SQL Injection
- ✅ XSS vulnerabilities
- ✅ Exposição de secrets
- ✅ Configurações inseguras

### Qualidade de Código
- ✅ Funções muito grandes
- ✅ Aninhamento profundo
- ✅ Console statements
- ✅ Technical debt markers
- ✅ Uso de "any" em TypeScript

### Performance
- ✅ Await em loops
- ✅ Map operations encadeadas
- ✅ Deep cloning ineficiente
- ✅ Timers com zero delay

### Arquitetura
- ✅ Dependency Injection
- ✅ Error handling
- ✅ Logging appropriado
- ✅ Separação de responsabilidades

### Testes
- ✅ Arquivos de teste ausentes
- ✅ Estrutura de testes
- ✅ Cobertura adequada

### Documentação
- ✅ JSDoc comments
- ✅ Inline comments
- ✅ Exemplos de uso

## 📈 Roadmap

### Versão 2.0
- [ ] Integração com ESLint/TSLint
- [ ] Suporte a mais linguagens (Python, Java)
- [ ] Análise de dependências
- [ ] Métricas de complexidade ciclomática
- [ ] Integração com SonarQube

### Versão 2.1
- [ ] AI-powered suggestions
- [ ] Automated fix suggestions
- [ ] Performance benchmarking
- [ ] Security scan integration
- [ ] Custom rule engine

## 🤝 Contribuição

Para adicionar novas verificações ou melhorar o agent:

1. **Fork** o projeto
2. **Adicione** suas verificações em `review-script.js`
3. **Teste** com diferentes cenários
4. **Documente** as novas funcionalidades
5. **Submeta** um Pull Request

## 📞 Suporte

- **Issues**: Reporte bugs ou solicite features
- **Documentação**: Consulte este README
- **Examples**: Veja `code-review-example.md`
- **Templates**: Use os templates em `review-templates.md`

---

**Code Reviewer Agent v1.0.0** - Automatizando qualidade de código com inteligência! 🚀