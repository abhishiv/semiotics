import { INode, ILiteralObject, ISourceFile, ASTPath } from './language'
import { SyntaxKind } from './kinds'
import React from 'react'
import { IKernel } from '@gratico/sdk'
import { ILanguageBridge } from './language_bridge'
// PRINTER
// modes(summary, edit, preview)
// matcher(ast, typechecker)

export enum ISuggestionType {
  'FEATURED_BLOCK' = 'FEATURED_BLOCK',
  'BLOCK' = 'BLOCK',
  'CODE_MUTATION' = 'CODE_MUTATION',
  'TREE_OP' = 'TREE_OP',
  'METADATA_OP' = 'METADATA_OP',
}

// SUGGESTIONS LIST
// featured block types
// block types
// computed suggestions
// tree ops
// metadata ops
export interface ISuggestionBasePayload {
  id: string
  text: string
  description: string
  icon: string
  priority: number
  update: (atts: { document: INode; parent: INode; attrName: string; index: number }) => void
}

export interface ISuggestion {
  type: ISuggestionType
  payload: ISuggestionBasePayload
}

export enum IPrinterMode {
  'SYMBOL',
  'SUMMARY',
  'EDIT',
  'VIEW',
}

export interface IPrinterProps<T extends INode = any> {
  node: T
  document: INode
  path: ASTPath[]
  mode: IPrinterMode
  kernel: IKernel
  languageBridge: ILanguageBridge<any>
  renderNode: (
    mode: IPrinterMode,
    path: ASTPath[],
    node: INode,
    onRequestMode: (mode: IPrinterMode) => void,
  ) => React.ReactNode
  onRequestMode?: (mode: IPrinterMode) => void
}
export interface IPrinter {
  id: string
  name?: string
  icon?: string
  // todo simplify this
  syntaxKind?: SyntaxKind
  matchFilter?: object
  matcher?: (node: INode, document: INode, path: ASTPath[]) => boolean
  renderer: (props: IPrinterProps) => React.ReactNode
  transpilers?: ITranspiler
}

export interface IPrinterGroup {
  id: string
  printerIds: string[]
  renderer: (nodes: INode[], document: INode, path: ASTPath[], mode: IPrinterMode) => React.ReactNode
}

export interface IAutoCompleteOptionsProducer {
  nodes: (string | number)[]
  producer: () => any[]
}
export interface IToolKit {
  printers: IPrinter[]
  printerGroups: IPrinterGroup[]
  transpilers: ITranspiler[]
  macroTranspilers: ITranspiler[]
}
export interface TranspilerOptions {
  toolkit: IToolKit
}

export type TranspilerNodePath = string[]
export interface ITranspiler<T extends INode = any> {
  syntaxKind?: SyntaxKind
  id?: string
  transpile: (opts: TranspilerOptions, node: T, path: TranspilerNodePath) => any
  getChildNodePath?: (document: ISourceFile, node: T, nodePath: ASTPath[]) => string[]
}
