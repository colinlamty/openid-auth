import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
// import nodePolyfills from 'rollup-plugin-node-polyfills';
import pkg from './package.json';

export default {
  input: './src/main.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
    peerDepsExternal(),
    // nodePolyfills(),
    resolve({
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
};
