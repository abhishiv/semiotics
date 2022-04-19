import {
  SyntaxKind,
  INode,
  IIdentifier,
  ISourceFile,
  IValueDefinition,
  ILiteralObject,
  IReference,
  IValueEvaluation,
  ITranspiler,
  IPrimitiveLiteral,
  ILiteralArray,
  IFunction,
  IToolKit,
  TranspilerOptions,
  TranspilerNodePath,
  ISourceFileImport,
  ISourceFileImportElement
} from '../specs/index'
import ts from 'typescript'

console

export const importElementTranspiler: ITranspiler<ISourceFileImportElement> = {
  syntaxKind: SyntaxKind.ISourceFileImportElement,
  transpile: (toolkit, node: ISourceFileImportElement) => {
    const factory = ts.factory
    return factory.createImportSpecifier(
      false,
      translateNode(toolkit, node.name, ['name']),
      translateNode(toolkit, node.name, ['name'])
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    return []
  }
}

export const importTranspiler: ITranspiler<ISourceFileImport> = {
  syntaxKind: SyntaxKind.ISourceFileImport,
  transpile: (toolkit, node: ISourceFileImport) => {
    const factory = ts.factory
    const defImportIndex = node.elements.findIndex((el) => el.type === 'default')
    const namedImports = node.elements
      .map((el, i) => {
        if (el.type !== 'default') return i
      })
      .filter((el) => Number.isFinite(el)) as number[]
    return factory.createImportDeclaration(
      [],
      [],
      factory.createImportClause(
        false,
        defImportIndex > -1
          ? translateNode(toolkit, node.elements[defImportIndex].name, ['elements', defImportIndex + '', 'name'])
          : undefined,
        factory.createNamedImports(
          namedImports.map((namedImportsIndex) => {
            return translateNode(toolkit, node.elements[namedImportsIndex], ['elements', namedImportsIndex + ''])
          })
        )
      ),
      factory.createStringLiteral(node.path.value as string)
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    // todo implement it
    return ['statements', propIndex + '']
  }
}
export const sourceFileTranspiler: ITranspiler<ISourceFile> = {
  syntaxKind: SyntaxKind.ISourceFile,
  transpile: (toolkit, node: ISourceFile) => {
    const transpiledNodes = [
      ...[...node.imports].map((node, i) => translateNode(toolkit, node, ['imports', i + ''])),
      ...[...node.defs].map((node, i) => translateNode(toolkit, node, ['defs', i + '']))
    ]

    const sourceText = transpiledNodes.map(transpileTSNode).join('\n')

    const sourceFile = ts.createSourceFile('index.tsx', sourceText, ts.ScriptTarget.ES2020)
    return sourceFile
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    const index = propName === 'imports' ? (propIndex as number) : node.imports.length + (propIndex as number)
    return ['statements', index + '']
  }
}

export const valueDefinitionTranspiler: ITranspiler<IValueDefinition> = {
  syntaxKind: SyntaxKind.IValueDefinition,
  transpile: (toolkit, node, path) => {
    const topLevel = path?.length === 2
    const factory = ts.factory
    return factory.createVariableStatement(
      topLevel ? factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export) : [],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            translateNode(toolkit, node.name, [...path, 'name']) as
              | ts.Identifier
              | ts.ObjectBindingPattern
              | ts.ArrayBindingPattern,
            undefined,
            undefined,
            translateNode(toolkit, node.value, [...path, 'value']) as unknown as ts.Expression
          )
        ],
        ts.NodeFlags.Const
      )
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    if (propName === 'name') {
      return ['declarationList', 'declarations', '0', 'name']
    } else if (propName == 'value') {
      return ['declarationList', 'declarations', '0', 'initializer']
    }
    console.log(doc, node, nodePath, childPath)
    throw new Error('INVALID_PATH')
  }
}

export const primitiveLiteralTranspiler: ITranspiler<IPrimitiveLiteral> = {
  syntaxKind: SyntaxKind.IPrimitiveLiteral,
  transpile: (toolkit, node) => {
    const factory = ts.factory
    const type = typeof node.value
    if (type === 'string') {
      return factory.createStringLiteral(node.value as string)
    } else if (type === 'number') {
      return factory.createNumericLiteral(node.value as number)
    } else if (type === 'boolean') {
      return node.value === true ? factory.createTrue() : factory.createFalse()
    } else if (node.value === null) {
      return factory.createNull()
    }
  }
}

export const identifierTranspiler: ITranspiler<IIdentifier> = {
  syntaxKind: SyntaxKind.IIdentifier,
  transpile: (toolkit, node) => {
    const factory = ts.factory
    return factory.createIdentifier(node.name)
  }
}
export const literalObjectTranspiler: ITranspiler<ILiteralObject> = {
  syntaxKind: SyntaxKind.ILiteralObject,
  transpile: (toolkit, node, path) => {
    const factory = ts.factory
    return factory.createObjectLiteralExpression(
      node.keys.map((key, i) => {
        const value = node.value[i]
        return factory.createPropertyAssignment(
          translateNode(toolkit, key, [...path, 'key', i + '']) as ts.Identifier,
          translateNode(toolkit, value, [...path, 'value', i + '']) as ts.Identifier
        )
      })
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    if (propName === 'keys') {
      return ['properties', propIndex + '', 'name']
    } else if (propName == 'value') {
      return ['properties', propIndex + '', 'initializer']
    }
    throw new Error('INVALID_PATH')
  }
}
export const literalArrayTranspiler: ITranspiler<ILiteralArray> = {
  syntaxKind: SyntaxKind.ILiteralArray,
  transpile: (toolkit, node, path) => {
    const factory = ts.factory
    return factory.createNodeArray(
      node.value.map((v) => {
        return translateNode(toolkit, v, [...path]) as ts.Identifier
      })
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    if (propName == 'value') {
      return ['elements', propIndex + '']
    }
    throw new Error('INVALID_PATH')
  }
}
export const valueEvaluationTranspiler: ITranspiler<IValueEvaluation> = {
  syntaxKind: SyntaxKind.IValueEvaluation,
  transpile: (toolkit, node, path) => {
    const factory = ts.factory

    const target = translateNode(toolkit, node.object, [...path, 'object']) as ts.Identifier

    return factory.createCallExpression(
      target,
      [],
      node.arguments.map((arg, i) => translateNode(toolkit, arg, [...path, 'arguments', i + '']) as ts.Expression)
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    if (propName == 'object') {
      return ['expression']
    } else if (propName === 'arguments') {
      return ['arguments', propIndex + '']
    }
    throw new Error('INVALID_PATH')
  }
}
export const referenceTranspiler: ITranspiler<IReference> = {
  syntaxKind: SyntaxKind.IReference,
  transpile: (toolkit, node, path) => {
    const factory = ts.factory
    const obj = node.link
      .reverse()
      .reduce((state: ts.Identifier | ts.PropertyAccessExpression | undefined, record, i) => {
        const n = translateNode(toolkit, record, [...path, 'link', i + '']) as ts.Identifier
        if (!state) {
          return n
        } else {
          return factory.createPropertyAccessExpression(n, state as unknown as ts.Identifier)
        }
      }, undefined)
    return obj
  }
}

export const functionTranspiler: ITranspiler<IFunction> = {
  syntaxKind: SyntaxKind.IFunction,
  transpile: (toolkit, node, path) => {
    const factory = ts.factory
    const [last, ...previous] = [...node.value].reverse()
    return factory.createArrowFunction(
      [],
      [],
      [],
      undefined,
      undefined,
      factory.createBlock(
        [
          ...node.value.map((node, i) => translateNode(toolkit, node, [...path, 'value', i + '']) as ts.Statement),
          ...(last
            ? [
                factory.createReturnStatement(
                  translateNode(toolkit, (last as IValueDefinition).name, [
                    ...path,
                    'value',
                    node.value.length + 1 + ''
                  ]) as ts.Expression
                )
              ]
            : [])
        ],
        true
      )
    )
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath
    if (propName == 'parameters') {
      return ['parameters', propIndex + '', 'name']
    } else if (propName === 'defaultParameters') {
      return ['parameters', propIndex + '', 'initializer']
    } else if (propName === 'paramtersType') {
      return ['parameters', propIndex + '', 'type']
    } else if (propName === 'typeParameters') {
      return ['typeParameters', propIndex + '', 'name']
    } else if (propName === 'returnType') {
      return ['type']
    } else if (propName === 'value') {
      return ['body', 'statements', propIndex + '']
    }
    throw new Error('INVALID_PATH')
  }
}

const jsxTranspiler: ITranspiler<ILiteralArray> = {
  id: 'co.grati.codemaker.printers.JSX',
  transpile: (toolkit, node, path) => {
    const tag = node.value[0] as IReference
    const properties = node.value[1] as ILiteralObject
    const [, , ...children] = node.value as [any, any, ...(ILiteralArray | IPrimitiveLiteral | IReference)[]]
    const factory = ts.factory
    const jsx = factory.createJsxElement(
      factory.createJsxOpeningElement(
        translateNode(toolkit, tag, [...path, 'value', '0']) as ts.Identifier,
        [],
        factory.createJsxAttributes(
          properties.keys.map((prop, i) => {
            const initializerNode = properties.value[i]
            return factory.createJsxAttribute(
              translateNode(toolkit, prop, [...path, 'value', '1', 'keys', `${i}`]) as ts.Identifier,
              factory.createJsxExpression(
                undefined,
                translateNode(toolkit, initializerNode, [...path, 'value', '1', 'value', `${i}`]) as ts.Expression
              )
            )
          })
        )
      ),
      (children || []).reduce<ts.JsxChild[]>((state, el, i) => {
        const jsx = (() => {
          const key = `${2 + i}`
          if (el.kind === SyntaxKind.IPrimitiveLiteral) {
            return factory.createJsxExpression(
              undefined,
              translateNode(toolkit, el, [...path, 'value', key]) as ts.Identifier
            )
          } else if (el.kind === SyntaxKind.ILiteralArray) {
            return translateNode(toolkit, el, [...path, 'value', key]) as ts.JsxElement
          } else if (el.kind === SyntaxKind.IReference) {
            return factory.createJsxExpression(
              undefined,
              translateNode(toolkit, el, [...path, 'value', key]) as ts.Identifier
            )
          } else {
            throw new Error('error')
          }
        })()
        return state.concat([factory.createJsxText('\n', true)], jsx, factory.createJsxText('\n', true))
      }, []),

      factory.createJsxClosingElement(translateNode(toolkit, tag, [...path, 'value', '0']) as ts.Identifier)
    )
    return jsx
  },
  getChildNodePath: (doc, node, nodePath) => {
    const childPath = nodePath[nodePath.length - 1]
    if (!childPath) throw new Error('NO_CHILD')
    const { propName, index: propIndex } = childPath

    throw new Error('INVALID_PATH')
  }
}

export const transpilers = [
  sourceFileTranspiler,
  importTranspiler,
  importElementTranspiler,
  identifierTranspiler,
  referenceTranspiler,
  primitiveLiteralTranspiler,
  literalObjectTranspiler,
  literalArrayTranspiler,
  valueDefinitionTranspiler,
  valueEvaluationTranspiler,
  functionTranspiler,
  jsxTranspiler
]

export const binaryOperatorMacroTranspiler: ITranspiler<IIdentifier> = {
  id: 'co.grati.macros.binaryOperator',
  transpile: (toolkit, node) => {
    const factory = ts.factory
    return factory.createIdentifier('g')
  },
  getChildNodePath: (doc, node, nodePath) => {
    throw new Error('INVALID_PATH')
  }
}

const macroTranspilers = [binaryOperatorMacroTranspiler]

export const defaultTooklikt: IToolKit = {
  transpilers: [...transpilers, ...macroTranspilers],
  printers: [],
  printerGroups: [],
  macroTranspilers
}

export const defaultConfig: TranspilerOptions = {
  toolkit: defaultTooklikt
}

export function getTranspiler(toolkit: IToolKit, node: INode) {
  if (node.metadata && node.metadata['^transpiler']) {
    return toolkit.transpilers.find((el) => node && node.metadata && el.id === node.metadata['^transpiler'])
  }
  return toolkit.transpilers.find((el) => el.syntaxKind === node.kind)
}

export function translateNode(opts: TranspilerOptions, node: INode, path: TranspilerNodePath): any {
  const transpiler = getTranspiler(opts.toolkit, node)
  if (transpiler) {
    return transpiler.transpile(opts, node as any, path)
  }
  throw new Error('no transpileer found  - ' + node.kind)
}

export function transpileTSNode(node: ts.Node) {
  const printer: ts.Printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false
  })
  const sourceFile = ts.createSourceFile('destFile.tsx', '', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS)
  const text = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
  return text
} //
