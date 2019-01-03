module.exports = {
  productionSourceMap: false,

  pwa: {
    name: 'NodeTracing',
    msTileColor: '#4DBA87'
  },

  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      }
    }
  },

  baseUrl: '/nodetracing/web/',
  outputDir: '../server/web/',
  assetsDir: undefined,
  runtimeCompiler: undefined,
  parallel: undefined,
  css: undefined
}