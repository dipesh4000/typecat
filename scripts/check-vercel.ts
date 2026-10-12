import ts from 'typescript'
import { resolve } from 'node:path'

// Vercel compiles API entrypoints with the ROOT config, not server/tsconfig.json.
// Check emit-compatible options too, without writing files or needing Vercel credentials.
const configPath = resolve('tsconfig.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, resolve('.'))
const program = ts.createProgram(['api/health.ts', 'api/verify.ts'], {
  ...parsed.options, noEmit: false, allowImportingTsExtensions: false,
})
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => '\n',
  }))
  process.exit(1)
}
console.log('Vercel API entrypoints type-check with the root compiler configuration')
