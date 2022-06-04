import { morph, NodePath, NodePathContext, setToValue, getASTPath } from './tree'
import { INode, ISourceFile } from '../specs/index'
import { SyntaxKind, ILiteralKinds } from '../specs'
import id from 'shortid'

export function transformJSX(doc: ISourceFile, node?: INode) {
  const walker = (nodePath: NodePath, context: NodePathContext<INode>) => {
    const { node } = nodePath
    if (
      node?.kind &&
      node?.metadata &&
      node.metadata['^transpiler'] == 'co.grati.codemaker.printers.JSX' &&
      !node.metadata.interfaceBuilderWrapped &&
      !context.parent?.node?.metadata?.interfaceBuilderWrapped
    ) {
      const newNode = {
        id: id(),
        kind: SyntaxKind.ILiteralArray,
        metadata: {
          '^printer': 'co.grati.codemaker.printers.JSX',
          '^transpiler': 'co.grati.codemaker.printers.JSX',
          interfaceBuilderWrapped: true,
          jsxPragma: 'React',
        },
        value: [
          {
            id: id(),
            kind: SyntaxKind.IReference,
            link: [
              { id: id(), kind: SyntaxKind.IIdentifier, name: 'React' },
              { id: id(), kind: SyntaxKind.IIdentifier, name: 'Fragment' },
            ],
          },
          {
            id: id(),
            kind: SyntaxKind.ILiteralObject,
            keys: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'key' }],
            value: [{ id: id(), kind: SyntaxKind.IPrimitiveLiteral, value: '#gratico.jsx ' + node.id }],
          },
          node,
        ],
      }
      const n = {
        ...nodePath,
        node: newNode as INode,
      }
      const newASTPath = getASTPath({
        ...n,
        parentPath: [],
      })
      context.parent && setToValue(context.parent.node, newASTPath, n.node)
      context.replace(n as any)
    } else if (
      node?.kind &&
      // todo: add SyntaxKind.IReference
      [SyntaxKind.IPrimitiveLiteral, SyntaxKind.IIdentifier, SyntaxKind.IReference].indexOf(node.kind) > -1 &&
      context.parent?.node?.metadata &&
      context.parent?.node?.metadata['^transpiler'] == 'co.grati.codemaker.printers.JSX' &&
      node.metadata?.interfaceBuilderWrapped !== true &&
      !context.parent?.node.metadata?.interfaceBuilderWrapped
    ) {
      const newNode = {
        id: id(),
        kind: SyntaxKind.ILiteralArray,
        metadata: {
          '^printer': 'co.grati.codemaker.printers.JSX',
          '^transpiler': 'co.grati.codemaker.printers.JSX',
          interfaceBuilderWrapped: true,
          jsxPragma: 'React',
        },
        value: [
          {
            id: id(),
            kind: SyntaxKind.IReference,
            link: [
              { id: id(), kind: SyntaxKind.IIdentifier, name: 'React' },
              { id: id(), kind: SyntaxKind.IIdentifier, name: 'Fragment' },
            ],
          },
          {
            id: id(),
            kind: SyntaxKind.ILiteralObject,
            keys: [{ id: id(), kind: SyntaxKind.IIdentifier, name: 'key' }],
            value: [{ id: id(), kind: SyntaxKind.IPrimitiveLiteral, value: '#gratico.jsx ' + node.id }],
          },
          node,
        ],
      }
      const n = {
        ...nodePath,
        node: newNode as INode,
      }
      const newASTPath = getASTPath({
        ...n,
        parentPath: [],
      })
      if (newASTPath[newASTPath.length - 1] >= 2) {
        context.parent && setToValue(context.parent.node, newASTPath, n.node)
        context.replace(n as any)
      }
    }
  }
  return morph(doc, walker)
}
