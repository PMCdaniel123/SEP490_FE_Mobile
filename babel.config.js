module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-env'
  ],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        '@components': './src/components',
        
        
      }
    }]
  ]
};
