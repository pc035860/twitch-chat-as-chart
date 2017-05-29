/**
 * 這個 config 支援三種 NODE_ENV
 *
 * local 本地開發用
 *   - dev-server @ localhost:8080
 *   - mocked data
 *
 * developement 本地 build
 *   - uglified
 *   - mocked data
 *
 * production - 線上 build
 *   - uglified
 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'developement';
const IS_LOCAL = !IS_PRODUCTION && !IS_DEVELOPMENT;

/**
 * ENV options for local
 */
const DEV_HOST = process.env.WEBPACK_DEV_HOST || '127.0.0.1';

/**
 * ENV options for production
 */
const SOURCEMAP = process.env.WEBPACK_SOURCEMAP == 1;
const NO_COMPRESS = process.env.WEBPACK_NO_COMPRESS == 1;
const OUTPUT_FILENAME = (function () {
  return process.env.WEBPACK_OUTPUT_FILENAME || '[name].[hash]';
}());

const myPath = {
  app: path.resolve(__dirname, 'app')
};

const params = {
  sass: {
    outputStyle: IS_LOCAL ? 'expanded' : 'compressed',
    sourceComments: IS_LOCAL ? 'true' : 'false',
    sourceMap: 'true',
    sourceMapContents: 'true',
    includePaths: [
      encodeURIComponent(
        path.resolve(
          __dirname,
          'node_modules',
          'angular-bootstrap-colorpicker',
          'css'
        )
      ),
      encodeURIComponent(
        path.resolve(__dirname, 'node_modules', 'angularjs-slider', 'dist')
      )
    ]
  },
  url: {
    // and file
    name: '[hash].[ext]',
    limit: 10
  }
};

const config = {
  context: myPath.app,
  entry: {
    app: ['webpack/hot/dev-server', './index.js']
    // stripe: [
    //   'webpack/hot/dev-server', './stripe.js'
    // ]
  },
  output: {
    path: path.join(myPath.app, 'assets'),
    publicPath: `http://${DEV_HOST}:8080/assets/`,
    filename: '[name].js'
  },
  devtool: 'source-map',
  devServer: {
    host: DEV_HOST,
    contentBase: myPath.app,
    stats: {
      colors: true
    }
  },
  externals: {
    angular: 'angular',
    jquery: 'jQuery',
    firebase: 'firebase',
    Chart: 'Chart',
    moment: 'moment',
    lazy: 'Lazy',
    Twitch: 'Twitch',
    // 'lazy'          : 'Lazy',
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: [/node_modules/, path.join(myPath.app, 'lib')]
      }
    ],
    loaders: [
      { test: /\.json$/, loader: 'json', exclude: /node_modules/ },
      { test: /\.js$/, loader: 'ng-annotate', exclude: /node_modules/ },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: !IS_PRODUCTION,
          presets: ['es2015', 'stage-1']
        }
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: (function () {
          const baseLoader = `css?sourceMap!postcss!sass?${toQuery(params.sass)}`;
          if (IS_PRODUCTION) {
            return ExtractTextPlugin.extract('style', baseLoader);
          }
          return `style!${baseLoader}`;
        }())
      },
      {
        test: /\.(png|jpg|gif)$/,
        exclude: /node_modules/,
        loader: `url?${toQuery(params.url)}`
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: `url?${toQuery(params.url)}`
      }
    ]
  },
  postcss() {
    return [
      // custom version of postcss-transform-shortcut
      // https://github.com/jonathantneal/postcss-transform-shortcut/issues/3
      require('postcss-transform-shortcut'),
      require('autoprefixer')('last 2 versions')
    ];
  },
  resolve: {
    alias: {
      _images: path.join(myPath.app, 'images'),
      _utils: path.join(myPath.app, 'utils'),
      _libs: path.join(myPath.app, 'libs'),
      _npm: path.resolve(__dirname, 'node_modules')
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(IS_PRODUCTION ? 'production' : 'development')
      }
    }),
    new webpack.ProvidePlugin({
      angular: 'angular',
      $: 'jquery'
    }),
    new CopyPlugin([
      { from: './libs/bootstrap.min.css', to: './bootstrap.min.css' }
    ])
  ]
};

if (!SOURCEMAP && !IS_LOCAL) {
  // no source map
  delete config.devtool;
}

if (IS_PRODUCTION || IS_DEVELOPMENT) {
  // shift off dev-server
  config.entry.app.shift();

  // no cache
  config.cache = false;

  if (IS_PRODUCTION) {
    // setup filename
    config.output.filename = `${OUTPUT_FILENAME}.js`;

    // setup public path
    config.output.publicPath = './';

    // resolve null mock data
    config.resolve.alias['mock-data'] = '../empty';

    // set extract text plugin -> index: 1
    config.plugins.push(new ExtractTextPlugin(`${OUTPUT_FILENAME}.css`));

    // add asset plugin
    config.plugins.push(
      new AssetsPlugin({
        path: path.join(__dirname, 'build'),
        filename: 'assets.json'
      })
    );
  }

  if (!NO_COMPRESS) {
    // add uglify plugin -> index: 1 or 2
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: !!SOURCEMAP
      })
    );
  }
}

module.exports = config;

function toQuery(params) {
  let l = [],
    __toString = Object.prototype.toString,
    k,
    v;
  for (k in params) {
    v = params[k];

    if (__toString.call(v) === '[object Array]') {
      l.push(`${k}[]=${v}`);
    }
    else if (typeof v === 'boolean') {
      if (v) {
        l.push(k);
      }
    }
    else {
      l.push(`${k}=${v}`);
    }
  }
  return l.join('&');
}
