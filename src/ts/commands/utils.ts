import * as typescript from 'typescript'
import { ITSProject, ITSCompiler } from '../types'
import { path } from '@gratico/fs'

export function getFullyQualifiedName(
  project: ITSProject,
  symbol: typescript.Symbol,
): {
  builtin: boolean
  packageName: string | undefined
  fileName: string | undefined
  name: string
} {
  const { ts, compiler } = project
  const declaration = (symbol.declarations || [])[0]
  const declarationFile = declaration.getSourceFile()
  const program = compiler.watchProgram.getProgram()
  const { resolvedModule } = ts.resolveModuleName(
    stripExtension(project, declarationFile.fileName),
    '',
    program.getCompilerOptions(),
    compiler.watchHost,
  )
  let packageName: string | undefined
  let fileName: string | undefined
  const builtin = isTypeDefinitionForBuiltins(declarationFile.fileName)
  if (!builtin) {
    if (resolvedModule && resolvedModule.packageId) {
      packageName = resolvedModule.packageId.name
      fileName = resolvedModule.packageId.subModuleName
    } else {
      // This is either a module inside the project itself, or it's some really
      // weird thing outside the scope of module resolution. Try to guess.
      fileName = relativeToSourceRoot(project, declarationFile.fileName)
    }
  }

  return {
    builtin,
    packageName,
    fileName,
    name: symbol.getName(),
  }
}

function stripExtension(project: ITSProject, fileName: string): string {
  const { ts } = project
  // .d.ts has to be first so we check it before .ts
  for (const extension of [ts.Extension.Dts, ts.Extension.Ts, ts.Extension.Js, ts.Extension.Jsx, ts.Extension.Tsx]) {
    if (fileName.endsWith(extension)) {
      return fileName.slice(0, -extension.length)
    }
  }
  return fileName
}
function isTypeDefinitionForBuiltins(fileName: string): boolean {
  const dir = path.dirname(fileName)
  const parentDir = path.dirname(dir)
  return path.basename(parentDir) === 'typescript' && path.basename(dir) === 'lib'
}
function relativeToSourceRoot(project: ITSProject, fileName: string): string {
  if (!project.rootPath) {
    return fileName
  }
  const relative = path.relative(project.rootPath, fileName)
  if (relative.startsWith('..' + path.sep) || relative == '..') {
    return fileName
  } else {
    return relative
  }
}
