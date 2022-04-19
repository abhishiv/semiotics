import crawl, { Options } from 'tree-crawl'
import { JSONSchema4 } from 'json-schema'
import { INode, ISourceFile } from '../specs/index'
import lget from 'lodash.get'

const get = (node: any, path: string[]) => (path.length == 0 ? node : lget(node, path))

export interface NodePath<T = any> {
  parentPath: any[]
  propName?: string
  inList?: boolean
  index?: number
  node: T
}

export function getASTPath(path: NodePath) {
  const astPath = [
    ...(path.parentPath || []),
    ...(path.propName ? [path.propName] : []),
    ...(path.inList ? [path.index] : []),
  ]
  return astPath
}

const getChildren = <T extends Record<any, any>>(
  sourceFile: T,
  schemaGetter: NodeSchemaGetter<T>,
  treePath: NodePath<T>,
) => {
  const node = treePath.node
  const nodeSchema = schemaGetter(node, {} as JSONSchema4)
  if (nodeSchema && nodeSchema.type === 'object') {
    const list = Object.keys(nodeSchema.properties || {}).reduce<NodePath<T>[]>(function (state, propName) {
      const prop = (nodeSchema.properties || {})[propName]
      return [
        ...state,
        ...(prop.type === 'array'
          ? [
              ...((node[propName] || []) as T[]).map((node, i: number) => {
                return {
                  parentPath: getASTPath(treePath),
                  propName,
                  index: i,
                  inList: true,
                  node,
                }
              }),
            ]
          : [
              {
                parentPath: getASTPath(treePath),
                propName: propName,
                node: node[propName],
              },
            ]),
      ]
    }, [])
    //console.debug("list", list);
    return list
  } else {
    //console.debug("no schema", node, nodeSchema);
    return []
  }
}

export function morph<T extends INode>(root: T) {
  const rootPath: NodePath<T> = {
    parentPath: [],
    node: root,
  }
  const schemaGetter = getSchemaGetter()
  crawl(
    rootPath,
    (nodePath, context) => {
      const { node } = nodePath
      if (
        context.parent &&
        node &&
        node.metadata &&
        node.metadata['^transpiler'] == 'co.grati.codemaker.printers.JSX'
      ) {
        if (node.metadata['jsxPragma'] !== 'h') {
          const n = {
            ...nodePath,
            node: {
              ...node,
              metadata: {
                ...(node.metadata || {}),
                jsxPragma: 'h',
                j7: 7,
              },
            },
          }
          setToValue(
            context.parent.node,
            getASTPath({
              ...n,
              parentPath: [],
            }),
            n.node,
          )
          context.replace(n)
        }
      }
    },
    { getChildren: getChildren.bind(null, root, schemaGetter), order: 'pre' },
  )
}

function setToValue(obj: any, path: any[], value: any) {
  const a = path
  let o = obj
  while (a.length - 1) {
    const n = a.shift()
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[a[0]] = value
}

export interface NodeSchemaGetter<AST> {
  (ast: any, schema: JSONSchema4): JSONSchema4 | undefined
}

export function getSchemaGetter<AST>() {
  const getNodeSchema: NodeSchemaGetter<AST> = (node: any, schema: JSONSchema4) => {
    if (node && node.kind && schema && schema.definitions) {
      return (schema.definitions || {})[node.kind]
    }
  }
  return getNodeSchema
}
