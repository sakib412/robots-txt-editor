/**
 * Robots.txt Validator - RFC 9309 Compliant
 * Validates robots.txt according to the official IETF standard
 * Reference: https://datatracker.ietf.org/doc/html/rfc9309
 */

interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class RobotsTxtValidator {
  // RFC 9309 Section 2.2.2 - Standard directives
  private readonly standardDirectives = new Set([
    'user-agent',
    'disallow',
    'allow',
    'sitemap',
  ]);

  // Common non-standard directives (will generate warnings, not errors)
  private readonly commonNonStandardDirectives = new Set([
    'crawl-delay',
    'request-rate',
    'visit-time',
    'host',
    'clean-param',
  ]);

  /**
   * Main validation method
   * RFC 9309 Section 2.3 - Access Method
   */
  validate(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Empty content check
    if (!content || content.trim().length === 0) {
      errors.push({
        line: 0,
        message: 'Robots.txt file is empty',
        severity: 'error',
      });
      return {isValid: false, errors, warnings};
    }

    // RFC 9309 Section 2.3 - File size limit
    // Crawlers MAY impose a parsing limit that MUST be at least 500 KiB
    const sizeInBytes = new Blob([content]).size;
    if (sizeInBytes > 500 * 1024) {
      warnings.push({
        line: 0,
        message:
          'File exceeds 500 KiB - crawlers may stop parsing beyond this limit (RFC 9309)',
        severity: 'warning',
      });
    }

    // RFC 9309 Section 2.1 - Protocol Definition
    // File should be UTF-8 encoded
    if (!this.isValidUtf8(content)) {
      warnings.push({
        line: 0,
        message: 'File should be UTF-8 encoded (RFC 9309)',
        severity: 'warning',
      });
    }

    const lines = content.split('\n');
    let currentUserAgent: string | null = null;
    let hasUserAgent = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // RFC 9309 Section 2.2.1 - Comments start with #
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return;
      }

      // Check for colon separator
      if (!trimmedLine.includes(':')) {
        errors.push({
          line: lineNumber,
          message: 'Invalid format: directive must contain colon separator',
          severity: 'error',
        });
        return;
      }

      // Split on first colon only
      const colonIndex = trimmedLine.indexOf(':');
      const directive = trimmedLine
        .substring(0, colonIndex)
        .trim()
        .toLowerCase();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      // Validate directive
      if (!this.standardDirectives.has(directive)) {
        if (this.commonNonStandardDirectives.has(directive)) {
          warnings.push({
            line: lineNumber,
            message: `'${directive}' is not part of RFC 9309 standard (may be ignored by some crawlers)`,
            severity: 'warning',
          });
        } else {
          warnings.push({
            line: lineNumber,
            message: `Unknown directive '${directive}' (not in RFC 9309)`,
            severity: 'warning',
          });
        }
      }

      // RFC 9309 Section 2.2.1 - Group structure validation
      switch (directive) {
        case 'user-agent':
          this.validateUserAgent(value, lineNumber, errors, warnings);
          currentUserAgent = value;
          hasUserAgent = true;
          break;

        case 'disallow':
        case 'allow':
          // RFC 9309 Section 2.2.1 - Rules must come after user-agent
          if (!currentUserAgent) {
            errors.push({
              line: lineNumber,
              message: `'${directive}' must follow a user-agent directive (RFC 9309 Section 2.2.1)`,
              severity: 'error',
            });
          } else {
            this.validatePath(directive, value, lineNumber, errors, warnings);
          }
          break;

        case 'sitemap':
          // RFC 9309 - Sitemap can appear anywhere
          this.validateSitemap(value, lineNumber, errors, warnings);
          break;

        case 'crawl-delay':
          this.validateCrawlDelay(value, lineNumber, warnings);
          break;
      }
    });

    // RFC 9309 requires at least one user-agent group
    if (!hasUserAgent) {
      errors.push({
        line: 0,
        message:
          'File must contain at least one user-agent directive (RFC 9309)',
        severity: 'error',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * RFC 9309 Section 2.2.1 - User-agent validation
   */
  private validateUserAgent(
    value: string,
    line: number,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    if (!value) {
      errors.push({
        line,
        message: 'user-agent value cannot be empty',
        severity: 'error',
      });
      return;
    }

    // RFC 9309 Section 2.2.1 - Product token should contain only a-z, A-Z, _, -
    const validPattern = /^[a-zA-Z0-9_\-*]+$/;
    if (!validPattern.test(value)) {
      warnings.push({
        line,
        message:
          'user-agent should contain only letters, numbers, hyphens, underscores, or * (RFC 9309)',
        severity: 'warning',
      });
    }
  }

  /**
   * RFC 9309 Section 2.2.2 - Path validation
   */
  private validatePath(
    directive: string,
    value: string,
    line: number,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    // RFC 9309 - Empty disallow is valid (allows all)
    if (directive === 'disallow' && value === '') {
      return;
    }

    // RFC 9309 - Paths should start with /
    if (value && !value.startsWith('/')) {
      warnings.push({
        line,
        message: 'Path should start with / for proper matching (RFC 9309)',
        severity: 'warning',
      });
    }

    // RFC 9309 Section 2.2.3 - Special characters: *, $, #
    // Check for unencoded special characters that should be percent-encoded
    const needsEncoding = /[^\x21-\x7E]/;
    if (needsEncoding.test(value)) {
      warnings.push({
        line,
        message:
          'Non-ASCII characters should be percent-encoded (RFC 9309 Section 2.2.2)',
        severity: 'warning',
      });
    }

    // Validate wildcard usage
    if (value.includes('*')) {
      // RFC 9309 Section 2.2.3 - * matches 0 or more characters
      // This is valid, just noting it follows the standard
    }

    if (value.includes('$')) {
      // RFC 9309 Section 2.2.3 - $ matches end of URL
      if (!value.endsWith('$')) {
        warnings.push({
          line,
          message: '$ should only appear at the end of the path (RFC 9309)',
          severity: 'warning',
        });
      }
    }
  }

  /**
   * Sitemap validation (mentioned in RFC 9309 but part of sitemaps.org spec)
   */
  private validateSitemap(
    value: string,
    line: number,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    if (!value) {
      errors.push({
        line,
        message: 'sitemap URL cannot be empty',
        severity: 'error',
      });
      return;
    }

    // Must be absolute URL
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push({
          line,
          message: 'sitemap must use HTTP or HTTPS protocol',
          severity: 'error',
        });
      }
    } catch {
      errors.push({
        line,
        message: 'sitemap must be a valid absolute URL',
        severity: 'error',
      });
    }
  }

  /**
   * Crawl-delay validation (non-standard, but commonly used)
   */
  private validateCrawlDelay(
    value: string,
    line: number,
    warnings: ValidationError[],
  ): void {
    const delay = parseFloat(value);

    if (Number.isNaN(delay)) {
      warnings.push({
        line,
        message: 'crawl-delay value should be a number',
        severity: 'warning',
      });
      return;
    }

    if (delay < 0) {
      warnings.push({
        line,
        message: 'crawl-delay should not be negative',
        severity: 'warning',
      });
    }
  }

  /**
   * Basic UTF-8 validation
   */
  private isValidUtf8(str: string): boolean {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8', {fatal: true});
      const encoded = encoder.encode(str);
      decoder.decode(encoded);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Convenience function for validation
 */
export function validateRobotsTxt(content: string): ValidationResult {
  const validator = new RobotsTxtValidator();
  return validator.validate(content);
}

/**
 * Format validation results for display
 */
export function formatValidationResults(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return '✓ Valid robots.txt (RFC 9309 compliant)';
  }

  let output = '';

  if (result.errors.length > 0) {
    output += 'Errors:\n';
    result.errors.forEach((error) => {
      output += `  Line ${error.line}: ${error.message}\n`;
    });
  }

  if (result.warnings.length > 0) {
    if (output) output += '\n';
    output += 'Warnings:\n';
    result.warnings.forEach((warning) => {
      output += `  Line ${warning.line}: ${warning.message}\n`;
    });
  }

  return output;
}
