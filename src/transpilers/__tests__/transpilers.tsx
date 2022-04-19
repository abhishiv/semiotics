import { translateNode, transpileTSNode, defaultConfig } from '../index'
import id from 'shortid'
import { SyntaxKind } from '../../specs'

import { getExampleDocument, getDocument } from '../../utils/example_document'

// not working because of issues with ts.createSourceFile
describe('ISourceFile', () => {
  test('print source file', () => {
    const exampleDocument = getExampleDocument()
    const tsNode = translateNode(defaultConfig, exampleDocument, [])
    const text = transpileTSNode(tsNode)
    console.log(text)
  })
  test('print macro', () => {
    const exampleDocument = getDocument(
      [],
      [
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
            kind: SyntaxKind.IMacro,
            metadata: {
              '^printer': 'co.grati.printer.macro.binaryOperator',
              '^transpiler': 'co.grati.macros.binaryOperator'
            },
            payload: [
              {
                id: id(),
                kind: SyntaxKind.IIdentifier,
                metadata: {
                  '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
                },
                name: 'HomePage'
              },
              '+',
              {
                id: id(),
                kind: SyntaxKind.IIdentifier,
                metadata: {
                  '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.IIdentifier
                },
                name: 'HomePage'
              }
            ]
          }
        }
      ]
    )
    const tsNode = translateNode(defaultConfig, exampleDocument, [])
    const text = transpileTSNode(tsNode)
    console.log(text)
  })
})
