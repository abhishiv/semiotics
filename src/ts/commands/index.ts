import {
  IToolKit,
  INode,
  translateNode,
  transpileTSNode,
  defaultConfig,
  getTranspiler,
  ASTPath,
  flattenASTPath,
  ITranspiler,
  ISourceFile,
} from '../../index'
import { IFileBuffer } from '@gratico/sdk'
// import { getFullyQualifiedName } from './utils'
import { path as nodePath } from '@gratico/fs'
import lget from 'lodash.get'
import typescript, { SymbolFlags } from 'typescript'
import { toSimpleType } from 'ts-simple-type'
import { ITSProject } from '../types'

const get = (obj: unknown, path: string[]) => (path.length === 0 ? obj : lget(obj, path))

export function getAncestorChain(toolkit: IToolKit, sourceFile: ISourceFile, path: ASTPath[]) {
  const parentNodes = path.reduce((state, stepPath, index) => {
    const ancestorPath = path.slice(0, index + 1)
    const ancestorFlatPath = flattenASTPath(ancestorPath)
    const node: INode | undefined = get(sourceFile, ancestorFlatPath)
    //    console.log(ancestorFlatPath)
    const parentNode: INode = get(sourceFile, flattenASTPath(path.slice(0, index))) || sourceFile

    if (!node) {
      console.error(node, path, ancestorPath, sourceFile)
      throw new Error('no node')
    }

    const transpiler = getTranspiler(toolkit, node)
    if (!transpiler) throw new Error('NO_TRANSPILER')
    const parentTranspiler = getTranspiler(toolkit, parentNode)
    if (!parentTranspiler) throw new Error('NO_TRANSPILER')
    state.push({
      node: node,
      parentNode,
      path: path.slice(0, index + 1),
      transpiler,
      translatedPath: parentTranspiler.getChildNodePath
        ? parentTranspiler.getChildNodePath(sourceFile, parentNode, path.slice(0, index + 1))
        : undefined,
      //
    })
    return state
  }, [] as { node: INode; parentNode: INode; path: ASTPath[]; transpiler: ITranspiler; translatedPath?: string[] }[])

  return parentNodes
}
export function getTranslatedPath(toolkit: IToolKit, sourceFile: ISourceFile, path: ASTPath[]) {
  const chain = getAncestorChain(toolkit, sourceFile, path)
  return chain
}

export async function getTSSourceFile(project: ITSProject, fileBuffer: IFileBuffer, path: ASTPath[], ast: ISourceFile) {
  const id = nodePath.parse(nodePath.basename(fileBuffer.id)).name
  const tsSourceFile = translateNode(defaultConfig, ast, [])
  const fileText = transpileTSNode(tsSourceFile)
  const fileLocalPath = nodePath.join(nodePath.dirname(fileBuffer.filePath as string), id + '.tsx')
  const filePath = nodePath.join(project.rootPath, fileLocalPath)
  project.sys.writeFile(filePath, fileText)
  const sourceFile = project.compiler.watchProgram.getProgram().getSourceFile(filePath)
  return sourceFile
}

export async function getTranslateFileAndPath(
  project: ITSProject,
  fileBuffer: IFileBuffer,
  ast: ISourceFile,
  path: ASTPath[],
) {
  const sourceFile = await getTSSourceFile(project, fileBuffer, path, ast)
  const translatedPaths = getTranslatedPath(defaultConfig.toolkit, ast, path)
  const translatedPath = translatedPaths.reduce<string[]>((state, item) => {
    if (!Array.isArray(item.translatedPath)) throw new Error('NO_PATH')
    return state.concat(item.translatedPath)
  }, [])
  return { sourceFile, translatedPath }
}

export async function getFunctionParameters(
  project: ITSProject,
  fileBuffer: IFileBuffer,
  ast: ISourceFile,
  path: ASTPath[],
) {
  const { sourceFile, translatedPath } = await getTranslateFileAndPath(project, fileBuffer, ast, path)
  const checker = project.compiler.watchProgram.getProgram().getProgram().getTypeChecker()

  const scopedNode: typescript.CallExpression = get(sourceFile, translatedPath)
  //  const l = scopedNode.name
  //  const sym = checker.getSymbolAtLocation(l)
  //  console.log(sym)
  //  const signature = checker.getSignatureFromDeclaration(sym?.declarations[0])
  //  console.log(signature)

  const type = checker.getTypeAtLocation(scopedNode)
  //  const signature = checker.getSignatureFromDeclaration(scopedNode)

  if (!type) throw new Error('NO_TYPE')
  const simpleType = toSimpleType(type as any, checker as any)

  return simpleType
}

export async function getScopeCompletions(
  project: ITSProject,
  fileBuffer: IFileBuffer,
  ast: ISourceFile,
  path: ASTPath[],
  value?: string,
) {
  if (!value || value.length < 2) return []
  //  console.log('fileBuffer', fileBuffer)

  const { sourceFile, translatedPath } = await getTranslateFileAndPath(project, fileBuffer, ast, path)

  const checker = project.compiler.watchProgram.getProgram().getProgram().getTypeChecker()
  if (!sourceFile) throw new Error('no sourcefile')
  const { SymbolFlags } = project.ts
  const scopedNode = get(sourceFile, translatedPath)

  const syms = checker.getSymbolsInScope(scopedNode, SymbolFlags.Value)

  const input = value ? value.split('.') : []
  const key = input[0]
  if (key) {
    const filtered = filterString(syms, 'escapedName', key)
    const results = filtered.map((el) => ({ label: el.obj.escapedName, completionType: SymbolFlags[el.obj.flags] }))
    return results
  } else if (value) {
    return [{ label: value }]
  }
  return []
}

export async function getPropertiesCompletions(
  project: ITSProject,
  fileBuffer: IFileBuffer,
  ast: ISourceFile,
  path: ASTPath[],
  value?: string,
) {
  const { sourceFile, translatedPath } = await getTranslateFileAndPath(project, fileBuffer, ast, path)
  const checker = project.compiler.watchProgram.getProgram().getProgram().getTypeChecker()

  const scopedNode: typescript.CallExpression = get(sourceFile, translatedPath)

  //  console.log(scopedNode)

  const type = checker.getTypeAtLocation(scopedNode)
  //console.log(type)
  if (!type) throw new Error('NO_TYPE')
  const list = type.getApparentProperties()
  //console.log(list)
  const input = value ? value.split('.') : []
  const key = input[0]
  if (key) {
    const filtered = filterString(list, 'escapedName', key)
    const results = filtered.map((el) => ({ label: el.obj.escapedName, completionType: SymbolFlags[el.obj.flags] }))
    return results
  } else {
    const results = list.map((el) => ({ label: el.escapedName, completionType: SymbolFlags[el.flags] }))
    return results
  }
  return []
}

export function filterString(list: any[], key: string, input: string) {
  const regex = new RegExp(`^${input}`, ``)

  const matches = list.map(function (item) {
    const suggestion = item[key]
    return {
      suggestion: suggestion,
      obj: item,
    }
  })
  return matches.filter((x) => regex.test(x.suggestion)).sort((a, b) => a.suggestion.localeCompare(input))
}
