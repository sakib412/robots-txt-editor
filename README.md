# Robots.txt Editor

A React component for editing and validating `robots.txt` files using CodeMirror 6.

## Features

- Syntax highlighting for `robots.txt` files.
- Real-time validation (RFC 9309-aware) with editor diagnostics.
- Autocomplete suggestions for directives, user-agents and common paths.
- Easy to drop into React apps; lightweight validator utilities included.

## Installation

Install from npm (or your preferred package manager):

```bash
npm install robots-txt-editor
# or
pnpm add robots-txt-editor
```

## Usage

- The editor is the default export of the package.
- Validator utilities are exported from the `validator` entry.

```tsx
import React from 'react';
import RobotsTxtEditor from 'robots-txt-editor';
import {
  validateRobotsTxt,
  RobotsTxtValidator,
  formatValidationResults,
} from 'robots-txt-editor/validator';

const MyComponent = () => {
  const handleChange = (value: string) => {
    // handle editor value changes
    console.log('content changed', value);
  };

  const handleValidation = (isValid: boolean) => {
    // simple boolean indicating whether any errors were found
    console.log('is valid:', isValid);
  };

  // Using the standalone validator utility
  const runValidation = (content: string) => {
    const result = validateRobotsTxt(content);
    console.log(formatValidationResults(result));
    // result: { isValid, errors, warnings }
  };

  return (
    <RobotsTxtEditor
      initialValue={"User-agent: *\nDisallow: /admin/"}
      onChange={handleChange}
      onValidation={handleValidation}
      height="400px"
      readOnly={false}
    />
  );
};

export default MyComponent;
```

## API

### `RobotsTxtEditor` (default export)

- Props:
  - `initialValue?: string` — initial editor content (default: `''`).
  - `onChange?: (value: string) => void` — called when editor content changes.
  - `onValidation?: (isValid: boolean) => void` — called after validation runs; receives a boolean indicating whether the file has no errors.
  - `height?: string` — CSS height for the editor container (default: `'600px'`).
  - `readOnly?: boolean` — render editor read-only.

Notes: the editor provides inline diagnostics (errors/warnings) produced by the built-in validator.

### Validator utilities (`robots-txt-editor/validator`)

The validator module exports the following:

- `class RobotsTxtValidator` — full-featured validator you can instantiate and run `.validate(content)` on.
- `function validateRobotsTxt(content: string): ValidationResult` — convenience function that creates a `RobotsTxtValidator` and returns a `ValidationResult`.
- `function formatValidationResults(result: ValidationResult): string` — helper to format errors/warnings as a readable string.

ValidationResult shape:

- `isValid: boolean` — true when no errors are present (warnings may still exist).
- `errors: Array<{ line: number; message: string; severity: 'error' }>` — array of error objects.
- `warnings: Array<{ line: number; message: string; severity: 'warning' }>` — array of warning objects.

The validator aims to follow RFC 9309 (Robots Exclusion Protocol) and emits errors/warnings consistent with that spec.

## License

MIT License. See the `LICENSE` file for details.