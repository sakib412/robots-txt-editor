# robots-txt-editor

> CodeMirror-based robots.txt editor with RFC 9309 validation for React

[![npm version](https://img.shields.io/npm/v/robots-txt-editor.svg)](https://www.npmjs.com/package/robots-txt-editor)
[![npm downloads](https://img.shields.io/npm/dm/robots-txt-editor.svg)](https://www.npmjs.com/package/robots-txt-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional robots.txt editor component for React applications with real-time validation, syntax highlighting, and auto-completion.

<!-- ![Demo](https://via.placeholder.com/800x400?text=Add+Screenshot+Here) -->

## ✨ Features

- ✅ **Real-time validation** - RFC 9309 compliant
- ✅ **Syntax highlighting** - Color-coded directives
- ✅ **Auto-completion** - Press `Ctrl+Space` for suggestions
- ✅ **Error detection** - Red squiggly lines for errors
- ✅ **Warning detection** - Orange lines for warnings
- ✅ **Line numbers** - Easy navigation
- ✅ **TypeScript support** - Full type definitions
- ✅ **Lightweight** - ~300KB bundled

## 📦 Installation

```bash
npm install robots-txt-editor
# or
pnpm add robots-txt-editor
# or
yarn add robots-txt-editor
```

## 🚀 Quick Start

```tsx
import { useState } from 'react';
import RobotsTxtEditor from 'robots-txt-editor';

function App() {
  const [content, setContent] = useState(`User-agent: *
Disallow: /admin/
Allow: /admin/public

Sitemap: https://example.com/sitemap.xml
`);
  
  const [isValid, setIsValid] = useState(true);

  return (
    <div>
      <RobotsTxtEditor
        initialValue={content}
        onChange={setContent}
        onValidation={setIsValid}
        height="500px"
      />
      
      <div>
        {isValid ? '✅ Valid' : '❌ Has Errors'}
      </div>
    </div>
  );
}
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `string` | `''` | Initial robots.txt content |
| `onChange` | `(value: string) => void` | - | Called when content changes |
| `onValidation` | `(isValid: boolean) => void` | - | Called when validation state changes |
| `height` | `string` | `'600px'` | Editor height (CSS value) |
| `readOnly` | `boolean` | `false` | Make editor read-only |

### Example with All Props

```tsx
<RobotsTxtEditor
  initialValue="User-agent: *\nDisallow: /admin/"
  onChange={(value) => console.log(value)}
  onValidation={(isValid) => console.log(isValid)}
  height="400px"
  readOnly={false}
/>
```

## 🎨 Advanced Usage

### With Save Functionality

```tsx
import { useState } from 'react';
import RobotsTxtEditor from 'robots-txt-editor';

function RobotsEditor() {
  const [content, setContent] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleSave = async () => {
    if (!isValid) {
      alert('Please fix errors before saving');
      return;
    }

    await fetch('/api/robots-txt', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    
    alert('Saved!');
  };

  return (
    <div>
      <RobotsTxtEditor
        initialValue={content}
        onChange={setContent}
        onValidation={setIsValid}
        height="500px"
      />
      
      <button onClick={handleSave} disabled={!isValid}>
        Save
      </button>
    </div>
  );
}
```

### Using the Validator Separately

```tsx
import { validateRobotsTxt } from 'robots-txt-editor/validator';

const result = validateRobotsTxt('User-agent: *\nDisallow: /admin/');

console.log(result.isValid); // true
console.log(result.errors);  // []
console.log(result.warnings); // []
```

## 🎯 Validation Rules (RFC 9309)

The editor validates according to the official [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309) standard:

- ✅ Proper directive syntax
- ✅ User-agent requirements
- ✅ Path formatting
- ✅ Sitemap URL validation
- ✅ Special characters handling
- ⚠️ Non-standard directives warnings

## ⌨️ Keyboard Shortcuts

- `Ctrl+Space` - Trigger auto-completion
- `Ctrl+Z` - Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` - Redo
- `Ctrl+A` - Select all
- `Ctrl+F` - Find

## 🎨 Styling

The editor uses CodeMirror 6 and can be customized via CSS:

```css
/* Custom theme example */
.cm-editor {
  font-family: 'Fira Code', monospace;
  font-size: 16px;
}

.cm-gutters {
  background-color: #f5f5f5;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT © [Najmus Sakib](https://github.com/sakib412)

## 🙏 Acknowledgments

- Built with [CodeMirror 6](https://codemirror.net/)
- Follows [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309) specification
- Inspired by VS Code's editor experience

## 📧 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/sakib412/robots-txt-editor/issues)
- 💬 Questions: [GitHub Discussions](https://github.com/sakib412/robots-txt-editor/discussions)
- 📧 Email: nazmusakib412@gmail.com

---

Made with ❤️ by [Najmus Sakib](https://github.com/sakib412)