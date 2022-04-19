import { SyntaxKind, IFunction, IValueEvaluation, ISourceFile, ISourceFileImport, IDefinition } from '../specs'

import id from 'shortid'

export function getDocument(imports: ISourceFileImport[], defs: IDefinition[]) {
  const exampleDocument: ISourceFile = {
    id: id(),
    kind: SyntaxKind.ISourceFile,
    metadata: {
      '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.ISourceFile
    },
    imports,
    defs
  }
  // console.log(JSON.stringify(exampleDocument, null, 2))
  return exampleDocument
}

export function getExampleDocument() {
  const imports: ISourceFileImport[] = [
    {
      id: id(),
      kind: SyntaxKind.ISourceFileImport,
      elements: [
        {
          id: id(),
          kind: SyntaxKind.ISourceFileImportElement,
          type: 'default' as 'default',
          name: {
            id: id(),
            kind: SyntaxKind.IIdentifier,
            name: 'React'
          },
          as: {
            id: id(),
            kind: SyntaxKind.IIdentifier,
            name: 'React'
          }
        },
        {
          id: id(),
          kind: SyntaxKind.ISourceFileImportElement,
          type: 'normal' as 'normal',
          name: {
            id: id(),
            kind: SyntaxKind.IIdentifier,
            name: 'useState'
          },
          as: {
            id: id(),
            kind: SyntaxKind.IIdentifier,
            name: 'useState'
          }
        }
      ],
      path: {
        id: id(),
        kind: SyntaxKind.IPrimitiveLiteral,
        value: 'react'
      }
    }
  ]
  const defs: IDefinition[] = [
    {
      id: id(),
      kind: SyntaxKind.IValueDefinition,
      metadata: {
        '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IValueDefinition
      },
      name: {
        id: id(),
        kind: SyntaxKind.IIdentifier,
        metadata: {
          '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
        },
        name: 'HomePage'
      },
      value: {
        id: id(),
        kind: SyntaxKind.IFunction,
        metadata: {
          '^printer': 'co.grati.codemaker.printers.ReactFunctionComponent'
        },
        parameters: [],
        paramtersType: [],
        typeParameters: [],
        defaultParameters: [],
        value: [
          {
            id: id(),
            kind: SyntaxKind.IValueDefinition,
            name: {
              id: id(),
              kind: SyntaxKind.IIdentifier,
              name: 'output'
            },
            value: {
              id: id(),
              kind: SyntaxKind.ILiteralArray,
              metadata: {
                '^printer': 'co.grati.codemaker.printers.JSX',
                '^transpiler': 'co.grati.codemaker.printers.JSX',
                jsxPragma: 'React'
              },
              value: [
                {
                  id: id(),
                  kind: SyntaxKind.IReference,
                  link: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'span' }]
                },
                {
                  id: id(),
                  kind: SyntaxKind.ILiteralObject,
                  keys: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'style' }],
                  value: [
                    {
                      id: id(),
                      kind: SyntaxKind.ILiteralObject,
                      keys: [],
                      value: []
                    }
                  ]
                },
                {
                  id: id(),
                  kind: SyntaxKind.IPrimitiveLiteral,
                  value: 'hello world'
                },
                {
                  id: id(),
                  kind: SyntaxKind.ILiteralArray,
                  metadata: {
                    '^printer': 'co.grati.codemaker.printers.JSX',
                    '^transpiler': 'co.grati.codemaker.printers.JSX',
                    jsxPragma: 'React'
                  },
                  value: [
                    {
                      id: id(),
                      kind: SyntaxKind.IReference,
                      link: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'span' }]
                    },
                    {
                      id: id(),
                      kind: SyntaxKind.ILiteralObject,
                      keys: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'style' }],
                      value: [
                        {
                          id: id(),
                          kind: SyntaxKind.ILiteralObject,
                          keys: [],
                          value: []
                        }
                      ]
                    },
                    {
                      id: id(),
                      kind: SyntaxKind.IPrimitiveLiteral,
                      value: 'hello world'
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: id(),
      kind: SyntaxKind.IValueDefinition,
      metadata: {
        '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IValueDefinition
      },
      name: {
        id: id(),
        kind: SyntaxKind.IIdentifier,
        metadata: {
          '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
        },
        name: 'helloWorldFunction'
      },
      value: {
        id: id(),
        kind: SyntaxKind.IFunction,
        parameters: [],
        paramtersType: [],
        typeParameters: [],
        defaultParameters: [],
        value: [
          {
            id: id(),
            kind: SyntaxKind.IValueDefinition,
            metadata: {
              '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IValueDefinition
            },
            name: {
              id: id(),
              kind: SyntaxKind.IIdentifier,
              metadata: {
                '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
              },
              name: 'helloWorldFunction'
            },
            value: {
              id: id(),
              kind: SyntaxKind.IPrimitiveLiteral,
              value: 4
            }
          },
          {
            id: id(),
            kind: SyntaxKind.IValueDefinition,
            metadata: {
              '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IValueDefinition
            },
            name: {
              id: id(),
              kind: SyntaxKind.IIdentifier,
              metadata: {
                '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
              },
              name: 'helloWorld'
            },
            value: {
              id: id(),
              kind: SyntaxKind.IValueEvaluation,
              metadata: {
                '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IValueEvaluation
              },
              object: {
                id: id(),
                link: [
                  { id: id(), name: 'console', kind: SyntaxKind.IIdentifier },
                  { id: id(), name: 'log', kind: SyntaxKind.IIdentifier }
                ],
                kind: SyntaxKind.IReference,
                metadata: {}
              },
              arguments: [
                {
                  id: id(),
                  metadata: {},
                  kind: SyntaxKind.IPrimitiveLiteral,
                  value: 'hey there!'
                },
                {
                  id: id(),
                  metadata: {
                    '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.ILiteralObject
                  },
                  kind: SyntaxKind.ILiteralObject,
                  keys: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'env' }],
                  value: [
                    {
                      id: id(),
                      link: [{ id: id(), name: 'self', kind: SyntaxKind.IIdentifier }],
                      kind: SyntaxKind.IReference
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    }
  ]
  const exampleDocument = getDocument(imports, defs)
  // console.log(JSON.stringify(exampleDocument, null, 2))
  return exampleDocument
}
