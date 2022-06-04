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
import ts from 'typescript'
import { Flex } from '@chakra-ui/react'
import { check } from 'prettier'

const get = (obj: unknown, path: string[]) => (path.length === 0 ? obj : lget(obj, path))

export function getAncestorChain(toolkit: IToolKit, sourceFile: ISourceFile, path: ASTPath[]) {
  const parentNodes = path.reduce((state, stepPath, index) => {
    const ancestorPath = path.slice(0, index + 1)
    const ancestorFlatPath = flattenASTPath(ancestorPath)
    //console.log('ancestorFlatPath', ancestorPath, ancestorFlatPath)
    const node: INode | undefined = get(sourceFile, ancestorFlatPath)
    //    console.log(ancestorFlatPath)
    const thisPath = flattenASTPath(path.slice(0, index))
    //console.log('thisPath', thisPath)
    const parentNode: INode = get(sourceFile, thisPath) || sourceFile

    if (!node) {
      console.error(node, path, ancestorPath, sourceFile)
      throw new Error('no node')
    }

    const transpiler = getTranspiler(toolkit, node)
    if (!transpiler) throw new Error('NO_TRANSPILER')
    const parentTranspiler = getTranspiler(toolkit, parentNode)
    if (!parentTranspiler) throw new Error('NO_TRANSPILER')
    //console.log(parentTranspiler)
    const translatedPath = parentTranspiler.getChildNodePath
      ? parentTranspiler.getChildNodePath(sourceFile, parentNode, path.slice(0, index + 1))
      : undefined
    //console.log('translatedPath', translatedPath)
    state.push({
      node: node,
      parentNode,
      path: path.slice(0, index + 1),
      transpiler,
      translatedPath,
      //
    })
    return state
  }, [] as { node: INode; parentNode: INode; path: ASTPath[]; transpiler: ITranspiler; translatedPath?: string[] }[])
  //console.log('parentNodes', parentNodes)
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

export function reifyType(checker: ts.TypeChecker, type: ts.Symbol) {
  if (!type || !type.declarations || !type.declarations[0]) return null
  const propsType = checker.getTypeOfSymbolAtLocation(type, type.declarations[0] as ts.Node)
  const baseProps = propsType.getApparentProperties()
  let propertiesOfProps = baseProps

  if (propsType.isUnionOrIntersection()) {
    propertiesOfProps = [
      // Resolve extra properties in the union/intersection
      ...(propertiesOfProps = (checker as any).getAllPossiblePropertiesOfTypes(propsType.types)),
      // But props we already have override those as they are already correct.
      ...baseProps,
    ]

    if (!propertiesOfProps.length) {
      const subTypes = (checker as any).getAllPossiblePropertiesOfTypes(
        propsType.types.reduce<ts.Symbol[]>(
          // @ts-ignore
          (all, t) => [...all, ...(t.types || [])],
          [],
        ),
      )

      propertiesOfProps = [...subTypes, ...baseProps]
    }
  }
  return propertiesOfProps
}

export async function getFunctionParameters(
  project: ITSProject,
  fileBuffer: IFileBuffer,
  ast: ISourceFile,
  path: ASTPath[],
) {
  const { sourceFile, translatedPath } = await getTranslateFileAndPath(project, fileBuffer, ast, path)
  const checker = project.compiler.watchProgram.getProgram().getProgram().getTypeChecker()
  //console.log('translatedPath', translatedPath)
  const scopedNode: typescript.CallExpression = get(sourceFile, translatedPath)
  const s = checker.getAliasedSymbol((scopedNode.parent as any).symbol)
  const dec = s.declarations && s.declarations[0]
  const type = checker.getTypeFromTypeNode((dec as any).type)
  const sig = type.getCallSignatures()[0]
  const propsObj = sig.getParameters()[0]

  const propertiesOfProps = reifyType(checker, propsObj)
  if (!propertiesOfProps) return []
  const colorSymbol = propertiesOfProps.find((el) => el.name === 'color')
  if (!colorSymbol || !colorSymbol.declarations) return []
  const colorSymbolType = checker.getTypeOfSymbolAtLocation(colorSymbol, colorSymbol.declarations[0] as ts.Node)
  //console.log(props)
  debugger

  return propertiesOfProps
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
