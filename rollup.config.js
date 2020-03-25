import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
	input: './src/index.js',
	plugins: [
    babel({
      babelrc: false,
      presets: [
        ['@babel/preset-env', {
          modules: false
        }]
      ],
    })
  ],
  external: [
    'os',
    'path',
    'fs-extra',
    'child_process',
  ],
	output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
  ]
}
