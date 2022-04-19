import ts from 'typescript'
import { IKernel, IFileSystem as FS } from '@gratico/sdk'

export interface ITSProject {
  compiler: ITSCompiler
  fs: FS
  rootPath: string
  ts: typeof import('typescript')
  sys: ts.System
}
export interface ITSCompiler {
  watchProgram: ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>
  watchHost: ts.WatchCompilerHostOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>
}
