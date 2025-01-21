require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  inputSourceMap: true,
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@vue/babel-preset-jsx',
  ],
})
