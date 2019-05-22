import os from 'os'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import { range, defaultsDeep } from 'lodash'

import manifestTemplate from './templates/manifest'
import panelTemplate from './templates/html'
import debugTemplate from './templates/.debug'

function templateDebug(formatter) {
  return range(4, 16)
    .map(formatter)
    .join(os.EOL)
}

export function enablePlayerDebugMode() {
  // enable unsigned extensions for the foreseable future
  if (process.platform === 'darwin') {
    execSync(
      templateDebug(i => `defaults write com.adobe.CSXS.${i} PlayerDebugMode 1`)
    )
  } else if (process.platform === 'win32') {
    execSync(
      templateDebug(
        i => `REG ADD HKCU\\Software\\Adobe\\CSXS.${i} /f /v PlayerDebugMode /t REG_SZ /d 1`
      )
    )
  }
}

export function disablePlayerDebugMode() {
  // disable unsigned extensions for the foreseable future
  if (process.platform === 'darwin') {
    execSync(
      templateDebug(i => `defaults write com.adobe.CSXS.${i} PlayerDebugMode 0`)
    )
  } else if (process.platform === 'win32') {
    execSync(
      templateDebug(
        i => `REG DELETE HKCU\\Software\\Adobe\\CSXS.${i} /f /v PlayerDebugMode`
      )
    )
  }
}

function camelToSnake(str) {
  return str.replace(/([A-Z])/g, (part) => `_${part.toLowerCase()}`)
}

function isTruthy(str) {
  return typeof str === 'string' && (str === '1' || str.toLowerCase() === 'true')
}

export function getConfig(pkg, env) {
  const debugPortEnvs = Object.keys(process.env)
    .filter((key) => key.indexOf('CEP_DEBUG_PORT_') === 0)
  const pkgConfig = pkg.hasOwnProperty('cep')
    ? (
      pkg.cep.hasOwnProperty(env)
        ? pkg.cep[env]
        : pkg.cep
      )
    : {}
  const config = defaultsDeep(
    {
      bundleName: process.env.CEP_NAME,
      bundleId: process.env.CEP_ID,
      bundleVersion: process.env.CEP_VERSION,
      cepVersion: process.env.CEP_CEP_VERSION,
      hosts: process.env.CEP_HOSTS,
      iconNormal: process.env.CEP_ICON_NORMAL,
      iconRollover: process.env.CEP_ICON_ROLLOVER,
      iconDarkNormal: process.env.CEP_ICON_DARK_NORMAL,
      iconDarkRollover: process.env.CEP_ICON_DARK_ROLLOVER,
      panelWidth: process.env.CEP_PANEL_WIDTH,
      panelHeight: process.env.CEP_PANEL_HEIGHT,
      panelMinWidth: process.env.CEP_PANEL_MIN_WIDTH,
      panelMinHeight: process.env.CEP_PANEL_MIN_HEIGHT,
      panelMaxWidth: process.env.CEP_PANEL_MAX_WIDTH,
      panelMaxHeight: process.env.CEP_PANEL_MAX_HEIGHT,
      debugPorts: debugPortEnvs.length > 0
        ? debugPortEnvs.reduce((obj, key) => {
          obj[key] = parseInt(process.env[key], 10)
          return obj
        }, {})
        : undefined,
      debugInProduction: isTruthy(process.env.CEP_DEBUG_IN_PRODUCTION) || undefined,
      cefParams: !process.env.CEP_CEF_PARAMS ? undefined : process.env.CEP_CEF_PARAMS.split(',')
    },
    {
      bundleName: pkgConfig.name,
      bundleId: pkgConfig.id,
      bundleVersion: pkgConfig.version,
      cepVersion: pkgConfig.cepVersion,
      hosts: pkgConfig.hosts,
      iconNormal: pkgConfig.iconNormal,
      iconRollover: pkgConfig.iconRollover,
      iconDarkNormal: pkgConfig.iconDarkNormal,
      iconDarkRollover: pkgConfig.iconDarkRollover,
      panelWidth: pkgConfig.panelWidth,
      panelHeight: pkgConfig.panelHeight,
      panelMinWidth: pkgConfig.panelMinWidth,
      panelMinHeight: pkgConfig.panelMinHeight,
      panelMaxWidth: pkgConfig.panelMaxWidth,
      panelMaxHeight: pkgConfig.panelMaxHeight,
      debugPorts: pkgConfig.debugPorts,
      debugInProduction: pkgConfig.debugInProduction,
      lifecycle: pkgConfig.lifecycle,
      cefParams: pkgConfig.cefParams,
      extensions: pkgConfig.extensions
    },
    {
      bundleVersion: pkg.version,
    },
    {
      ...mergeExtensionDefaults({}),
      bundleName: 'CEP Extension',
      bundleId: 'com.mycompany.myextension',
      bundleVersion: '0.0.1',
      hosts: '*',
      debugInProduction: false,
      cepVersion: '6.0'
    }
  )
  return config
}

export function objectToProcessEnv(obj) {
  // assign object to process.env so they can be used in the code
  Object.keys(obj).forEach(key => {
    const envKey = camelToSnake(key).toUpperCase()
    const value = typeof obj[key] === 'string'
      ? obj[key]
      : JSON.stringify(obj[key])
    process.env[envKey] = value
  })
}

export function writeExtensionTemplates(opts) {
  const manifestContents = manifestTemplate(opts)
  const {
    out,
    debugInProduction,
    isDev,
    extensions
  } = opts
  const manifestDir = path.join(out, 'CSXS')
  const manifestFile = path.join(manifestDir, 'manifest.xml')
  return Promise.resolve()
    .then(() => fs.ensureDir(manifestDir))
    .then(() => fs.writeFile(manifestFile, manifestContents))
    .then(() => {
      let chain = Promise.resolve()
      if (debugInProduction || isDev) {
        const debugContents = debugTemplate(opts)
        chain = chain.then(() => fs.writeFile(path.join(out, '.debug'), debugContents))
      }
      if (isDev) {
        extensions.forEach(extension => {
          const href = `http://${extension.devHost}:${extension.devPort}`
          const panelContents = panelTemplate({
            title: extension.name,
            href
          })
          chain = chain.then(() => fs.writeFile(path.join(out, `dev.${extension.id}.html`), panelContents))
        })
      }
      return chain
    })
}

export function parseHosts(hostsString) {
  if (hostsString == '*')
    hostsString = `PHXS, IDSN, AICY, ILST, PPRO, PRLD, AEFT, FLPR, AUDT, DRWV, MUST, KBRG`
  const hosts = hostsString
    .split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/)
    .map(host => host.trim())
    .map(host => {
      let [name, version] = host.split('@')
      if (version == '*' || !version) {
        version = '[0.0,99.9]'
      } else if (version) {
        version = version
      }
      return {
        name,
        version,
      }
    })
  return hosts
}

export function getExtenstionPath() {
  if (process.platform == 'darwin') {
    return path.join(
      os.homedir(),
      '/Library/Application Support/Adobe/CEP/extensions'
    )
  } else if (process.platform == 'win32') {
    return path.join(process.env.APPDATA, 'Adobe/CEP/extensions')
  }
}

function getSymlinkExtensionPath({ bundleId }) {
  const extensionPath = getExtenstionPath()
  return path.join(extensionPath, bundleId)
}

export function symlinkExtension({ bundleId, out }) {
  const target = getSymlinkExtensionPath({ bundleId })
  return Promise.resolve()
    .then(() => fs.ensureDir(getExtenstionPath()))
    .then(() => fs.remove(target))
    .then(() => {
      if (process.platform === 'win32') {
        return fs.symlink(path.join(out, '/'), target, 'junction')
      } else {
        return fs.symlink(path.join(out, '/'), target)
      }
    })
}

export function copyDependencies({ root, out, pkg }) {
  const deps = pkg.dependencies || {}
  return Object.keys(deps).reduce((chain, dep) => {
    const src = path.join(root, 'node_modules', dep)
    const dest = path.join(out, 'node_modules', dep)
    let exists = false
    try {
      exists = fs.statSync(dest).isFile();
    }
    catch (err) {}
    if (!exists) {
      chain = chain
        .then(() => fs.copy(src, dest))
        .catch(() => {
          console.error(
            `Could not copy ${src} to ${dest}. Ensure the path is correct.`
          )
        })
        .then(() => copyDependencies({
          root,
          out,
          pkg: fs.readJsonSync(path.join(root, 'node_modules', dep, 'package.json'))
        }))
      return chain
    }
    return chain
  }, Promise.resolve())
}

export function copyIcons({
  root,
  out,
  iconNormal,
  iconRollover,
  iconDarkNormal,
  iconDarkRollover
}) {
  const iconPaths = [
    iconNormal,
    iconRollover,
    iconDarkNormal,
    iconDarkRollover,
  ]
    .filter(icon => icon !== undefined)
    .map(icon => ({
        source: path.resolve(root, icon),
        output: path.join(out, path.relative(root, icon)),
    }))
  return Promise.all(
    iconPaths.map(icon => {
      return fs.copy(icon.source, icon.output)
        .catch(() => {
          console.error(
            `Could not copy ${icon.source}. Ensure the path is correct.`
          )
        })
    })
  )
}

function mergeExtensionDefaults(extension) {
  return {
    panelWidth: 500,
    panelHeight: 500,
    htmlFilename: 'index.html',
    devPort: 8080,
    devHost: 'localhost',
    lifecycle: {
      autoVisible: true,
      startOnEvents: []
    },
    cefParams: [
      '--allow-file-access-from-files',
      '--allow-file-access',
      '--enable-nodejs',
      '--mixed-context'
    ],
    debugPorts: {
      PHXS: 3001,
      IDSN: 3002,
      AICY: 3003,
      ILST: 3004,
      PPRO: 3005,
      PRLD: 3006,
      AEFT: 3007,
      FLPR: 3008,
      AUDT: 3009,
      DRWV: 3010,
      MUST: 3011,
      KBRG: 3012,
    },
    ...extension
  }
}

export function compile(opts) {
  opts.env = opts.env ? opts.env : process.env.NODE_ENV
  opts.root = opts.root ? opts.root : process.cwd()
  opts.htmlFilename = opts.htmlFilename ? opts.htmlFilename : 'index.html'
  opts.pkg = opts.pkg ? opts.pkg : require(path.join(opts.root, '/package.json'))
  opts.devHost = opts.devHost ? opts.devHost : 'localhost'
  opts.devPort = opts.devPort ? opts.devPort : 8080
  opts.isDev = opts.hasOwnProperty('isDev') ? opts.isDev : false
  const config = getConfig(opts.pkg, opts.env)
  const hosts = parseHosts(config.hosts)
  const allOpts = {
      ...opts,
      ...config,
      hosts,
  }
  let extensions = []
  if (Array.isArray(config.extensions)) {
    extensions = config.extensions.map(extension =>
      mergeExtensionDefaults(extension)
    )
  } else {
    extensions.push({
      id: allOpts.bundleId,
      name: allOpts.bundleName,
      ...allOpts
    })
  }
  allOpts.extensions = extensions

  let chain = Promise.resolve()
  if (opts.isDev) {
    enablePlayerDebugMode()
    if (!config.noSymlink) {
      chain = chain.then(() =>
        symlinkExtension(allOpts)
      )
    }
  }
  chain = chain.then(() =>
    copyDependencies(allOpts)
  ).then(() =>
    writeExtensionTemplates(allOpts)
  )
  .then(() =>
    copyIcons(allOpts)
  )
  return chain
}