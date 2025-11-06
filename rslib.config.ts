import {pluginReact} from '@rsbuild/plugin-react';
import {defineConfig} from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.tsx'],
      validator: ['./src/validator.ts'],
    },
  },
  lib: [
    {
      bundle: true,
      dts: true,
      format: 'esm',
      syntax: 'es2017'
    },
  ],
  output: {
    target: 'web',
    minify: true,
  },
  plugins: [pluginReact()],
});
