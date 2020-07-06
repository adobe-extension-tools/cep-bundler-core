import os from 'os'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs-extra'

import manifestTemplate from './templates/manifest'
import panelTemplate from './templates/html'
import debugTemplate from './templates/.debug'

function templateDebug(formatter: any) {
  return [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(formatter).join(os.EOL)
}

export function enablePlayerDebugMode() {
  // enable unsigned extensions
  if (process.platform === 'darwin') {
    execSync(templateDebug((i: number) => `defaults write com.adobe.CSXS.${i} PlayerDebugMode 1`))
  } else {
    execSync(
      templateDebug((i: number) => `REG ADD HKCU\\Software\\Adobe\\CSXS.${i} /f /v PlayerDebugMode /t REG_SZ /d 1`),
    )
  }
}

export function disablePlayerDebugMode() {
  // disable unsigned extensions
  if (process.platform === 'darwin') {
    execSync(templateDebug((i: number) => `defaults write com.adobe.CSXS.${i} PlayerDebugMode 0`))
  } else {
    execSync(templateDebug((i: number) => `REG DELETE HKCU\\Software\\Adobe\\CSXS.${i} /f /v PlayerDebugMode`))
  }
}

function camelToSnake(str: string) {
  return str.replace(/([A-Z])/g, (part) => `_${part.toLowerCase()}`)
}

function isTruthy(str: any) {
  return typeof str === 'string' && (str === '1' || str.toLowerCase() === 'true')
}

function getEnvConfig() {
  const debugPortEnvs = Object.keys(process.env).filter((key) => key.indexOf('CEP_DEBUG_PORT_') === 0)
  return {
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
    devHost: process.env.CEP_DEV_HOST,
    devPort: !process.env.CEP_DEV_PORT ? undefined : Number(process.env.CEP_DEV_PORT),
    debugPorts:
      debugPortEnvs.length > 0
        ? debugPortEnvs.reduce((obj, key) => {
            obj[key.replace('CEP_DEBUG_PORT_', '')] = parseInt(process.env[key] || '', 10)
            return obj
          }, {} as any)
        : undefined,
    debugInProduction: isTruthy(process.env.CEP_DEBUG_IN_PRODUCTION) || undefined,
    cefParams: !process.env.CEP_CEF_PARAMS ? undefined : process.env.CEP_CEF_PARAMS.split(','),
  }
}

function getPkgConfig(pkg: any, env?: string) {
  const pkgConfig = pkg.hasOwnProperty('cep') ? (env && pkg.cep.hasOwnProperty(env) ? pkg.cep[env] : pkg.cep) : {}
  return {
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
    htmlFilename: pkgConfig.htmlFilename,
    extensions: pkgConfig.extensions,
    devHost: pkgConfig.devHost,
    devPort: pkgConfig.devPort,
  }
}

function getConfigDefaults() {
  return {
    bundleName: 'CEP Extension',
    bundleId: 'com.mycompany.myextension',
    hosts: '*',
    debugInProduction: false,
    cepVersion: '8.0',
    panelWidth: 500,
    panelHeight: 500,
    htmlFilename: './index.html',
    devHost: 'localhost',
    devPort: 8080,
    lifecycle: {
      autoVisible: true,
      startOnEvents: [],
    },
    cefParams: ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'],
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
  }
}

function assignDefined(target: any, ...sources: any) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key]
      if (val !== undefined) {
        target[key] = val
      }
    }
  }
  return target
}

export function getConfig(pkg: any, env?: string) {
  const config = assignDefined({}, getConfigDefaults(), getPkgConfig(pkg, env), getEnvConfig())
  // console.log('DEFAULTS', config)
  config.hosts = parseHosts(config.hosts)
  let extensions = []
  if (Array.isArray(config.extensions)) {
    extensions = config.extensions.map((extension: any) => {
      return assignDefined({}, config, extension)
    })
  } else {
    extensions.push({
      id: config.bundleId,
      name: config.bundleName,
      ...config,
    })
  }
  config.extensions = extensions
  // console.log('FINAL', config)
  return config
}

export function objectToProcessEnv(obj: any) {
  // assign object to process.env so they can be used in the code
  Object.keys(obj).forEach((key) => {
    const envKey = camelToSnake(key).toUpperCase()
    const value = typeof obj[key] === 'string' ? obj[key] : JSON.stringify(obj[key])
    process.env[envKey] = value
  })
}

export function writeExtensionTemplates(opts: any) {
  const manifestContents = manifestTemplate(opts)
  const { out, debugInProduction, isDev, extensions } = opts
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
        extensions.forEach((extension: any) => {
          const href = `http://${extension.devHost}:${extension.devPort}`
          const panelContents = panelTemplate({
            title: extension.name,
            href,
          })
          chain = chain.then(() => fs.writeFile(path.join(out, `dev.${extension.id}.html`), panelContents))
        })
      }
      return chain
    })
}

export function parseHosts(hostsString: string) {
  if (hostsString == '*') hostsString = `PHXS, IDSN, AICY, ILST, PPRO, PRLD, AEFT, FLPR, AUDT, DRWV, MUST, KBRG`
  const hosts = hostsString
    .split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/)
    .map((host) => host.trim())
    .map((host) => {
      // @ts-ignore
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

export function getExtensionPath() {
  if (process.platform == 'darwin') {
    return path.join(os.homedir(), '/Library/Application Support/Adobe/CEP/extensions')
  } else {
    return path.join(process.env.APPDATA || '', 'Adobe/CEP/extensions')
  }
}

function getSymlinkExtensionPath({ bundleId }: { bundleId: string }) {
  const extensionPath = getExtensionPath()
  return path.join(extensionPath, bundleId)
}

export function symlinkExtension({ bundleId, out }: { bundleId: string; out: string }) {
  const target = getSymlinkExtensionPath({ bundleId })
  return Promise.resolve()
    .then(() => fs.ensureDir(getExtensionPath()))
    .then(() => fs.remove(target))
    .then(() => {
      if (process.platform === 'win32') {
        return fs.symlink(path.join(out, '/'), target, 'junction')
      } else {
        return fs.symlink(path.join(out, '/'), target)
      }
    })
}

export function copyDependencies({ root, out, pkg }: { root: string; out: string; pkg: any }) {
  const deps = pkg.dependencies || {}
  return Object.keys(deps).reduce((chain, dep) => {
    if (dep.indexOf('/') !== -1) {
      dep = dep.split('/')[0]
    }
    const src = path.join(root, 'node_modules', dep)
    const dest = path.join(out, 'node_modules', dep)
    let exists = false
    try {
      exists = fs.statSync(dest).isFile()
    } catch (err) {}
    if (!exists) {
      chain = chain
        .then(() => fs.copy(src, dest))
        .catch(() => {
          console.error(`Could not copy ${src} to ${dest}. Ensure the path is correct.`)
        })
        .then(() => {
          try {
            const packageJson = fs.readJsonSync(path.join(root, 'node_modules', dep, 'package.json'))
            return copyDependencies({
              root,
              out,
              pkg: packageJson,
            })
          } catch (err) {
            return
          }
        })
      return chain
    }
    return chain
  }, Promise.resolve())
}

export function copyIcons({ root, out, iconNormal, iconRollover, iconDarkNormal, iconDarkRollover }: any) {
  const iconPaths = [iconNormal, iconRollover, iconDarkNormal, iconDarkRollover]
    .filter((icon) => icon !== undefined)
    .map((icon) => ({
      source: path.resolve(root, icon),
      output: path.join(out, path.relative(root, icon)),
    }))
  return Promise.all(
    iconPaths.map((icon) => {
      return fs.copy(icon.source, icon.output).catch(() => {
        console.error(`Could not copy ${icon.source}. Ensure the path is correct.`)
      })
    }),
  )
}

interface CompileOptions {
  env?: string
  root?: string
  htmlFilename?: string
  isDev?: boolean
  pkg?: any
}

export function compile(opts: CompileOptions) {
  opts.env = opts.env ? opts.env : process.env.NODE_ENV
  opts.root = opts.root ? opts.root : process.cwd()
  opts.htmlFilename = opts.htmlFilename ? opts.htmlFilename : './index.html'
  opts.pkg = opts.pkg ? opts.pkg : require(path.join(opts.root, '/package.json'))
  opts.isDev = opts.hasOwnProperty('isDev') ? opts.isDev : false
  const config = getConfig(opts.pkg, opts.env)
  const allOpts = {
    ...opts,
    ...config,
  }
  let chain = Promise.resolve()
  if (opts.isDev) {
    enablePlayerDebugMode()
    if (!config.noSymlink) {
      chain = chain.then(() => symlinkExtension(allOpts))
    }
  }
  chain = chain
    .then(() => copyDependencies(allOpts))
    .then(() => writeExtensionTemplates(allOpts))
    .then(() => copyIcons(allOpts))
    .then(() => {
      // noop
    })
  return chain
}
