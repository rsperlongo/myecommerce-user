# Code Review Templates

## Template 1: Security-Critical Review

```markdown
# 🔒 Security-Focused Code Review

## 📋 Security Checklist

### Authentication & Authorization
- [ ] Proper authentication implementation
- [ ] Authorization checks in place  
- [ ] Role-based access control (RBAC) compliance
- [ ] JWT token validation
- [ ] Session management security

### Input Validation
- [ ] All user inputs validated
- [ ] SQL injection prevention
- [ ] XSS attack prevention
- [ ] CSRF protection implemented
- [ ] File upload validation

### Data Protection
- [ ] Sensitive data encryption
- [ ] No hardcoded secrets/passwords
- [ ] Proper environment variable usage
- [ ] Database connection security
- [ ] API key management

### Error Handling
- [ ] No sensitive information in error messages
- [ ] Proper error logging
- [ ] Graceful error handling
- [ ] Rate limiting implementation
- [ ] DoS attack prevention

## 🚨 Security Issues Found
[List critical security issues]

## ✅ Security Approvals
- [ ] OWASP Top 10 compliance verified
- [ ] Security scan passed  
- [ ] Penetration testing ready
- [ ] Production deployment approved
```

## Template 2: Performance Review

```markdown
# ⚡ Performance-Focused Code Review

## 📊 Performance Analysis

### Database Performance
- [ ] Query optimization
- [ ] N+1 query prevention
- [ ] Proper indexing usage
- [ ] Connection pooling
- [ ] Transaction management

### Memory & CPU
- [ ] Memory leak prevention
- [ ] Efficient algorithms
- [ ] Resource cleanup
- [ ] Garbage collection optimization
- [ ] CPU-intensive operations

### Caching Strategy
- [ ] Appropriate caching implementation
- [ ] Cache invalidation strategy
- [ ] Redis/Memory cache usage
- [ ] CDN configuration
- [ ] Browser caching headers

### Async Operations
- [ ] Proper async/await usage
- [ ] Promise handling
- [ ] Concurrent operation optimization
- [ ] Timeout implementations
- [ ] Error handling in async code

## 📈 Performance Metrics
- Load time: X ms (Target: <500ms)
- Memory usage: X MB (Target: <100MB)
- Database queries: X (Target: <10 per request)
- Cache hit ratio: X% (Target: >90%)

## ⚡ Optimization Recommendations
[List performance improvements]
```

## Template 3: Architecture Review

```markdown
# 🏛️ Architecture-Focused Code Review

## 🏗️ Architectural Assessment

### Design Patterns
- [ ] Appropriate pattern usage
- [ ] SOLID principles compliance
- [ ] DRY principle adherence
- [ ] Single Responsibility Principle
- [ ] Dependency Injection usage

### Layer Separation
- [ ] Clear domain boundaries
- [ ] Proper layer communication
- [ ] Business logic placement
- [ ] Data access abstraction
- [ ] Presentation layer separation

### Scalability
- [ ] Horizontal scaling readiness
- [ ] Microservice compatibility
- [ ] Load balancing consideration
- [ ] Database partitioning
- [ ] Stateless design

### Maintainability
- [ ] Code organization
- [ ] Module structure
- [ ] Configuration management
- [ ] Logging strategy
- [ ] Monitoring implementation

## 🎯 Architecture Score
- Modularity: X/10
- Scalability: X/10  
- Maintainability: X/10
- Testability: X/10
- Flexibility: X/10

## 📋 Architecture Recommendations
[List architectural improvements]
```

## Template 4: Testing Review

```markdown
# 🧪 Testing-Focused Code Review

## 📋 Test Coverage Analysis

### Unit Tests
- [ ] Critical functions tested
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mock usage appropriate
- [ ] Test isolation maintained

### Integration Tests
- [ ] API endpoints tested
- [ ] Database integration tested
- [ ] External service mocking
- [ ] End-to-end scenarios
- [ ] Error handling tested

### Test Quality
- [ ] Tests are readable
- [ ] Tests are maintainable
- [ ] Fast execution time
- [ ] Reliable (no flaky tests)
- [ ] Good test data setup

### Coverage Metrics
- Line Coverage: X% (Target: >80%)
- Branch Coverage: X% (Target: >70%)
- Function Coverage: X% (Target: >90%)
- Statement Coverage: X% (Target: >85%)

## 🎯 Testing Recommendations
- Add unit tests for [specific functions]
- Improve integration test coverage for [specific areas]
- Mock external dependencies in [specific tests]
- Add performance tests for [critical paths]

## 🚀 Test Strategy
[Recommend testing approach improvements]
```

## Template 5: Documentation Review

```markdown
# 📚 Documentation-Focused Code Review

## 📝 Documentation Assessment

### Code Documentation
- [ ] JSDoc/TSDoc comments present
- [ ] Complex logic explained
- [ ] API documentation complete
- [ ] Type definitions documented
- [ ] Usage examples provided

### Project Documentation
- [ ] README accuracy
- [ ] Installation instructions
- [ ] Configuration guide
- [ ] API reference
- [ ] Troubleshooting guide

### Architecture Documentation
- [ ] System design documented
- [ ] Decision records (ADRs)
- [ ] Database schema documented
- [ ] Integration patterns explained
- [ ] Deployment guide available

## 📊 Documentation Score
- Code Comments: X/10
- API Documentation: X/10
- User Guide: X/10
- Technical Documentation: X/10
- Examples: X/10

## 📋 Documentation Improvements
[List documentation tasks]
```

## Template 6: Quick Review (Small Changes)

```markdown
# ⚡ Quick Code Review

## 🎯 Change Summary
[Brief description of what changed]

## ✅ Quick Checks
- [ ] Builds successfully
- [ ] Tests pass
- [ ] No security issues
- [ ] Follows existing patterns
- [ ] Proper error handling

## 👀 Observations
**Good**: [What's done well]
**Concerns**: [Any issues found]
**Suggestions**: [Minor improvements]

## 🚀 Approval
- [ ] ✅ LGTM (Looks Good To Me)
- [ ] ⚠️ Minor issues (see comments)
- [ ] ❌ Needs revision
```

## Template 7: Major Feature Review

```markdown
# 🚀 Major Feature Code Review

## 🎯 Feature Overview
**Feature**: [Feature name]
**Impact**: [Business/technical impact]
**Complexity**: [Low/Medium/High]
**Risk Level**: [Low/Medium/High]

## 📊 Comprehensive Analysis

### 🔒 Security Assessment (25%)
- Score: X/25
- Critical Issues: [count]
- Recommendations: [list]

### 🏗️ Code Quality Assessment (25%)  
- Score: X/25
- SOLID Compliance: [rating]
- Recommendations: [list]

### ⚡ Performance Assessment (20%)
- Score: X/20
- Bottlenecks: [identified issues]
- Recommendations: [list]

### 🏛️ Architecture Assessment (15%)
- Score: X/15
- Pattern Usage: [evaluation]
- Recommendations: [list]

### 🧪 Testing Assessment (10%)
- Score: X/10
- Coverage: [percentage]
- Recommendations: [list]

### 📚 Documentation Assessment (5%)
- Score: X/5
- Completeness: [rating]
- Recommendations: [list]

## 🎯 Overall Score: X/100

## 🚨 Critical Path Analysis
- [ ] Happy path tested
- [ ] Error scenarios covered  
- [ ] Edge cases handled
- [ ] Performance benchmarked
- [ ] Security validated

## 📋 Pre-Merge Checklist
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Code reviewed by 2+ reviewers

## 🚀 Deployment Readiness
- [ ] Feature flagged
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Documentation deployed

## 📈 Success Metrics
- Performance: [target metrics]
- Quality: [quality gates]
- Security: [security requirements]
- Usability: [user acceptance criteria]
```

## Usage Guidelines

### When to Use Each Template:

1. **Security-Critical**: Authentication, payment, data handling
2. **Performance**: High-traffic features, database operations
3. **Architecture**: Large refactoring, new modules  
4. **Testing**: Test-heavy changes, CI/CD updates
5. **Documentation**: Public APIs, complex features
6. **Quick Review**: Bug fixes, small improvements
7. **Major Feature**: New features, significant changes

### Customization Tips:

- Adjust scoring weights based on project priorities
- Add project-specific checklist items
- Include team-specific standards and guidelines
- Customize for different environments (dev/staging/prod)
- Add compliance requirements (GDPR, HIPAA, etc.)

Remember: These templates are starting points. Adapt them to your team's needs and project requirements!