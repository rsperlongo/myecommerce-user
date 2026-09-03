#!/usr/bin/env node

/**
 * Code Review Agent Script
 * Automates code review process using the specialized Code Reviewer agent
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeReviewAgent {
  constructor() {
    this.config = this.loadConfig();
    this.reviewTemplates = this.loadTemplates();
    this.currentReview = {
      files: [],
      score: 0,
      issues: [],
      suggestions: []
    };
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'code-reviewer.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load agent config:', error.message);
      return {};
    }
  }

  loadTemplates() {
    try {
      const templatesPath = path.join(__dirname, 'review-templates.md');
      return fs.readFileSync(templatesPath, 'utf8');
    } catch (error) {
      console.error('Failed to load review templates:', error.message);
      return '';
    }
  }

  /**
   * Analyze a single file for code quality issues
   * @param {string} filePath - Path to the file to analyze
   * @returns {Object} Analysis results
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = path.extname(filePath);
    const analysis = {
      file: filePath,
      security: this.analyzeSecurityIssues(content, extension),
      quality: this.analyzeCodeQuality(content, extension),
      performance: this.analyzePerformance(content, extension),
      architecture: this.analyzeArchitecture(content, extension),
      testing: this.analyzeTesting(content, extension),
      documentation: this.analyzeDocumentation(content, extension)
    };

    return analysis;
  }

  /**
   * Security analysis
   */
  analyzeSecurityIssues(content, extension) {
    const issues = [];
    let score = 25;

    // Check for common security issues
    const securityChecks = [
      {
        pattern: /password.*=.*['"][^'"]{1,6}['"]/i,
        issue: 'Weak password detected',
        severity: 'critical',
        points: -10
      },
      {
        pattern: /SELECT.*\+.*\+/i,
        issue: 'Possible SQL injection vulnerability',
        severity: 'critical', 
        points: -15
      },
      {
        pattern: /innerHTML.*=.*\+/i,
        issue: 'Possible XSS vulnerability',
        severity: 'high',
        points: -8
      },
      {
        pattern: /process\.env\.[A-Z_]+.*console\.log/i,
        issue: 'Environment variable logged (potential secret exposure)',
        severity: 'medium',
        points: -5
      },
      {
        pattern: /\.replace\(['"]<script['"]/i,
        issue: 'Basic XSS protection detected (consider using proper sanitizer)',
        severity: 'low',
        points: -2
      }
    ];

    securityChecks.forEach(check => {
      if (check.pattern.test(content)) {
        issues.push({
          type: 'security',
          severity: check.severity,
          message: check.issue,
          suggestion: this.getSecuritySuggestion(check.issue)
        });
        score += check.points;
      }
    });

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Code quality analysis
   */
  analyzeCodeQuality(content, extension) {
    const issues = [];
    let score = 25;

    const qualityChecks = [
      {
        pattern: /function\s+\w+\([^)]*\)\s*{[\s\S]{500,}/,
        issue: 'Large function detected (>500 chars)',
        severity: 'medium',
        points: -3
      },
      {
        pattern: /if\s*\([^)]+\)\s*{\s*if\s*\([^)]+\)\s*{\s*if/,
        issue: 'Deep nesting detected (>3 levels)',
        severity: 'medium',
        points: -2
      },
      {
        pattern: /console\.log|console\.error|console\.warn/g,
        issue: 'Console statements found (should use proper logging)',
        severity: 'low',
        points: -1
      },
      {
        pattern: /TODO:|FIXME:|HACK:/gi,
        issue: 'Technical debt markers found',
        severity: 'low',
        points: -1
      },
      {
        pattern: /any/g,
        issue: 'TypeScript "any" type used (reduces type safety)',
        severity: 'medium',
        points: -2
      }
    ];

    qualityChecks.forEach(check => {
      const matches = content.match(check.pattern);
      if (matches) {
        issues.push({
          type: 'quality',
          severity: check.severity,
          message: check.issue,
          count: matches.length,
          suggestion: this.getQualitySuggestion(check.issue)
        });
        score += check.points * (matches.length || 1);
      }
    });

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Performance analysis
   */
  analyzePerformance(content, extension) {
    const issues = [];
    let score = 20;

    const performanceChecks = [
      {
        pattern: /for\s*\([^)]*\)\s*{\s*[\s\S]*?await\s+/,
        issue: 'Await inside loop detected (potential performance issue)',
        severity: 'high',
        points: -5
      },
      {
        pattern: /\.map\s*\([^)]*\)\s*\.map/,
        issue: 'Chained map operations (could be optimized)',
        severity: 'medium',
        points: -2
      },
      {
        pattern: /JSON\.parse\(JSON\.stringify\(/,
        issue: 'Deep clone via JSON (inefficient for large objects)',
        severity: 'medium',
        points: -2
      },
      {
        pattern: /setInterval|setTimeout.*0/,
        issue: 'Zero-delay timer detected',
        severity: 'low',
        points: -1
      }
    ];

    performanceChecks.forEach(check => {
      if (check.pattern.test(content)) {
        issues.push({
          type: 'performance',
          severity: check.severity,
          message: check.issue,
          suggestion: this.getPerformanceSuggestion(check.issue)
        });
        score += check.points;
      }
    });

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Architecture analysis
   */
  analyzeArchitecture(content, extension) {
    const issues = [];
    let score = 15;

    // Check for architectural patterns
    const hasProperDI = /@Injectable|@Inject/.test(content);
    const hasProperErrorHandling = /try\s*{[\s\S]*catch|\.catch\(/.test(content);
    const hasLogging = /@Log|logger\.|this\.log/.test(content);

    if (!hasProperDI && extension === '.ts') {
      issues.push({
        type: 'architecture',
        severity: 'medium',
        message: 'Consider using dependency injection',
        suggestion: 'Use @Injectable and @Inject decorators for better testability'
      });
      score -= 2;
    }

    if (!hasProperErrorHandling) {
      issues.push({
        type: 'architecture', 
        severity: 'medium',
        message: 'Missing error handling',
        suggestion: 'Add proper try/catch blocks or .catch() handlers'
      });
      score -= 3;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Testing analysis
   */
  analyzeTesting(content, extension) {
    const issues = [];
    let score = 10;

    if (content.includes('.spec.ts') || content.includes('.test.ts')) {
      // This is a test file
      const hasDescribe = /describe\s*\(/.test(content);
      const hasIt = /it\s*\(/.test(content);
      const hasBefore = /before|setUp/.test(content);
      
      if (hasDescribe && hasIt) score += 2;
      if (hasBefore) score += 1;
    } else {
      // Check if production code has corresponding test
      const testFile = content.replace(/\.ts$/, '.spec.ts');
      if (!fs.existsSync(testFile)) {
        issues.push({
          type: 'testing',
          severity: 'medium', 
          message: 'Missing test file',
          suggestion: 'Create corresponding test file'
        });
        score -= 3;
      }
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Documentation analysis
   */
  analyzeDocumentation(content, extension) {
    const issues = [];
    let score = 5;

    const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);
    const hasComments = /\/\//.test(content);
    const hasExamples = /@example/.test(content);

    if (!hasJSDoc && extension === '.ts') {
      issues.push({
        type: 'documentation',
        severity: 'low',
        message: 'Missing JSDoc comments',
        suggestion: 'Add JSDoc comments for public methods and classes'
      });
      score -= 2;
    }

    if (!hasComments) {
      issues.push({
        type: 'documentation',
        severity: 'low', 
        message: 'No inline comments found',
        suggestion: 'Add comments for complex logic'
      });
      score -= 1;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Generate comprehensive review report
   */
  generateReport(analyses) {
    const totalScore = analyses.reduce((sum, analysis) => {
      return sum + 
        analysis.security.score + 
        analysis.quality.score +
        analysis.performance.score + 
        analysis.architecture.score +
        analysis.testing.score +
        analysis.documentation.score;
    }, 0);

    const maxScore = analyses.length * 100; // 100 points per file
    const percentage = Math.round((totalScore / maxScore) * 100);

    let approval = '❌ Needs Work';
    if (percentage >= 90) approval = '🌟 Excellent';
    else if (percentage >= 80) approval = '✅ Approved';
    else if (percentage >= 70) approval = '⚠️ Conditional Approval';

    const report = `
# 🔍 Code Review Report

## 📊 Overall Score: ${totalScore}/${maxScore} (${percentage}%)

### Breakdown by Category:
${analyses.map(analysis => `
### 📁 ${analysis.file}
- 🔒 Security: ${analysis.security.score}/25
- 🏗️ Code Quality: ${analysis.quality.score}/25
- ⚡ Performance: ${analysis.performance.score}/20
- 🏛️ Architecture: ${analysis.architecture.score}/15
- 🧪 Testing: ${analysis.testing.score}/10
- 📚 Documentation: ${analysis.documentation.score}/5

#### Issues Found:
${[...analysis.security.issues, ...analysis.quality.issues, ...analysis.performance.issues, ...analysis.architecture.issues, ...analysis.testing.issues, ...analysis.documentation.issues]
  .map(issue => `- **${issue.severity.toUpperCase()}**: ${issue.message}`)
  .join('\n')}
`).join('\n')}

## ✅ Approval Status
${approval}

## 📋 Summary
- **Files Analyzed**: ${analyses.length}
- **Critical Issues**: ${this.countIssuesBySeverity(analyses, 'critical')}
- **High Priority Issues**: ${this.countIssuesBySeverity(analyses, 'high')}
- **Medium Priority Issues**: ${this.countIssuesBySeverity(analyses, 'medium')}
- **Low Priority Issues**: ${this.countIssuesBySeverity(analyses, 'low')}

## 🎯 Recommendations
${this.generateRecommendations(analyses)}

---
*Generated by Code Reviewer Agent v${this.config.version}*
`;

    return report;
  }

  countIssuesBySeverity(analyses, severity) {
    return analyses.reduce((count, analysis) => {
      return count + 
        [...analysis.security.issues, ...analysis.quality.issues, ...analysis.performance.issues, ...analysis.architecture.issues, ...analysis.testing.issues, ...analysis.documentation.issues]
        .filter(issue => issue.severity === severity).length;
    }, 0);
  }

  generateRecommendations(analyses) {
    const recommendations = [];
    
    // Security recommendations
    const criticalSecurityIssues = this.countIssuesBySeverity(analyses, 'critical');
    if (criticalSecurityIssues > 0) {
      recommendations.push('🚨 **URGENT**: Fix critical security vulnerabilities before deployment');
    }

    // Quality recommendations
    const qualityScore = analyses.reduce((sum, a) => sum + a.quality.score, 0) / analyses.length;
    if (qualityScore < 20) {
      recommendations.push('🏗️ **Code Quality**: Focus on refactoring for better maintainability');
    }

    // Performance recommendations
    const performanceScore = analyses.reduce((sum, a) => sum + a.performance.score, 0) / analyses.length;
    if (performanceScore < 15) {
      recommendations.push('⚡ **Performance**: Optimize critical performance bottlenecks');
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '✅ No major recommendations - code quality looks good!';
  }

  getSecuritySuggestion(issue) {
    const suggestions = {
      'Weak password detected': 'Use strong password validation with complexity requirements',
      'Possible SQL injection vulnerability': 'Use parameterized queries or ORM methods',
      'Possible XSS vulnerability': 'Use proper sanitization libraries like DOMPurify',
      'Environment variable logged': 'Remove console.log statements with sensitive data'
    };
    return suggestions[issue] || 'Review security best practices';
  }

  getQualitySuggestion(issue) {
    const suggestions = {
      'Large function detected': 'Break down into smaller, focused functions',
      'Deep nesting detected': 'Use early returns or extract methods to reduce nesting',
      'Console statements found': 'Replace with proper logging framework',
      'Technical debt markers found': 'Address TODO/FIXME items or create issues',
      'TypeScript "any" type used': 'Use specific types or interfaces instead of any'
    };
    return suggestions[issue] || 'Follow clean code principles';
  }

  getPerformanceSuggestion(issue) {
    const suggestions = {
      'Await inside loop detected': 'Use Promise.all() for parallel execution',
      'Chained map operations': 'Combine operations into single map call',
      'Deep clone via JSON': 'Use proper cloning library like lodash.cloneDeep',
      'Zero-delay timer detected': 'Consider using requestAnimationFrame or proper delays'
    };
    return suggestions[issue] || 'Review for performance optimization opportunities';
  }

  /**
   * Review files in a directory
   */
  reviewFiles(filePatterns) {
    const analyses = [];
    
    filePatterns.forEach(pattern => {
      const files = this.getFilesByPattern(pattern);
      files.forEach(file => {
        console.log(`📁 Analyzing: ${file}`);
        analyses.push(this.analyzeFile(file));
      });
    });

    const report = this.generateReport(analyses);
    
    // Save report
    const reportPath = path.join(process.cwd(), 'code-review-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log('\n' + report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

    return analyses;
  }

  getFilesByPattern(pattern) {
    try {
      // Check if it's a direct file path
      if (fs.existsSync(pattern)) {
        return [pattern];
      }
      
      // Simple glob implementation
      const command = `find . -path "${pattern}" -type f 2>/dev/null || find . -name "${pattern}" -type f 2>/dev/null`;
      const output = execSync(command, { encoding: 'utf8' });
      const files = output.trim().split('\n').filter(f => f && !f.includes('node_modules') && f !== '.');
      
      console.log(`Found ${files.length} files matching pattern: ${pattern}`);
      return files;
    } catch (error) {
      console.error(`Error finding files with pattern ${pattern}:`, error.message);
      return [];
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Code Reviewer Agent

Usage:
  node review-script.js <file-patterns...>

Examples:
  node review-script.js "*.ts"              # Review all TypeScript files
  node review-script.js "src/**/*.ts"       # Review TypeScript files in src
  node review-script.js "*.dto.ts" "*.service.ts"  # Review specific types

Options:
  --help        Show this help message
  --config      Show current configuration
  --templates   Show available templates
`);
    return;
  }

  if (args[0] === '--help') {
    return main();
  }

  const reviewer = new CodeReviewAgent();
  
  if (args[0] === '--config') {
    console.log('📋 Current Configuration:');
    console.log(JSON.stringify(reviewer.config, null, 2));
    return;
  }

  if (args[0] === '--templates') {
    console.log('📝 Available Templates:');
    console.log(reviewer.reviewTemplates);
    return;
  }

  console.log('🚀 Starting Code Review...\n');
  reviewer.reviewFiles(args);
}

if (require.main === module) {
  main();
}

module.exports = CodeReviewAgent;