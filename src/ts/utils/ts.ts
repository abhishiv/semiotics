import { IFileSystem as FS } from '@gratico/sdk'
import * as ts from 'typescript'
import { TSSystem } from './system'
import { ITSProject, ITSCompiler } from '../types'

export async function createProject(
  fs: FS,
  rootPath: string,
  ts: typeof import('typescript'),
  sys: ts.System = new TSSystem(fs, rootPath, ts),
): Promise<ITSProject> {
  const compiler = await createTSCompiler(rootPath, sys)

  const project = {
    compiler,

    fs,
    rootPath,
    ts,
    sys,
  }

  return project
}

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: () => '/',
  getNewLine: () => TSSystem.prototype.newLine,
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  //console.info(ts.formatDiagnostic(diagnostic, formatHost))
}
// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher
export async function createTSCompiler(rootDir: string, sys: ts.System): Promise<ITSCompiler> {
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram
  const configPath = `${rootDir}/tsconfig.json`
  console.log('configPath', configPath)
  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged,
  )
  // https://github.com/microsoft/TypeScript/issues/29176#issuecomment-450232791
  host.afterProgramCreate = (program) => {
    console.log('** We finished making the program! **')
  }
  const p = ts.createWatchProgram(host)

  //   const p = project.compiler.watchHost.createProgram([filePath], {}, project.ts.createIncrementalCompilerHost({}, project.sys))

  return { watchProgram: p, watchHost: host }
}
