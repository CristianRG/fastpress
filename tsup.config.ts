import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  shims: true,
  external: ['@prisma/client', '.prisma/client'],
  skipNodeModulesBundle: true,
  clean: true,
});
