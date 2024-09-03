import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import pkg from './package.json' assert {type:"json"};

export default [
  // browser-friendly UMD build
  {
    input:'src/index.js',
    output: {
      name: 'sapabase',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      terser(),
      commonjs(),
      nodeResolve({
        browser: true
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input:'src/index.js',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      terser(),
      commonjs(),
      nodeResolve({
        browser: true
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
];