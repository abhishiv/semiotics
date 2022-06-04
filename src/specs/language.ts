import { SyntaxKind } from './kinds'
export * from './kinds'
// todo: make quicktype is broken
// replace  kinds manually by hand for now
export interface ASTPath {
  propName: string
  index?: number
}

export const ILiteralKinds = [
  SyntaxKind.IPrimitiveLiteral,
  SyntaxKind.IFunction,
  SyntaxKind.ILiteralObject,
  SyntaxKind.ILiteralArray,
]
export const ITypeLiteralKinds = [
  SyntaxKind.ITypePrimitiveLiteral,
  SyntaxKind.ITypeFunction,
  SyntaxKind.ITypeLiteralObject,
  SyntaxKind.ITypeLiteralArray,
]
export const IValueKinds = [
  SyntaxKind.IIdentifier,
  SyntaxKind.IReference,
  ...ILiteralKinds,
  SyntaxKind.IValueEvaluation,
]
export const ITypeKinds = [SyntaxKind.IReference, ...ITypeLiteralKinds, SyntaxKind.ITypeEvaluation]
export const IDefinitionKinds = [SyntaxKind.IValueDefinition, SyntaxKind.ITypeDefinition]

export type ILiteral = IPrimitiveLiteral | IFunction | ILiteralObject | ILiteralArray
export type ITypeLiteral = ITypePrimitiveLiteral | ITypeFunction | ITypeLiteralObject | ITypeLiteralArray
export type ISimpleValue = IReference | ILiteral | IIdentifier
export type IValue = ISimpleValue | IValueEvaluation | IMacro
export type ISimpleType = IReference | ITypeLiteral
export type IType = ISimpleType | ITypeEvaluation
export type IDefinition = IValueDefinition | ITypeDefinition
export type IName = IIdentifier | IObjectPaterrn | IArrayPaterrn

export interface IMacro<T = any, M = any> extends INode {
  kind: SyntaxKind.IMacro
  payload: T
  meta?: M
}

// Transformations
// IValue -> IValueEvaluation / IValueDefinition
// IType -> ITypeEvaluation / ITypeDefinition

export interface INode {
  id: string
  kind: SyntaxKind
  metadata?: any
}
export interface ISourceFileImportElement extends INode {
  type: 'default' | 'normal'
  name: IIdentifier
  as?: IIdentifier
}
export interface ISourceFileImport extends INode {
  elements: ISourceFileImportElement[]
  path: IPrimitiveLiteral
}
export interface ISourceFile extends INode {
  defs: IDefinition[]
  imports: ISourceFileImport[]
}

export interface IIdentifier extends INode {
  kind: SyntaxKind.IIdentifier
  name: string
}
export interface IReference extends INode {
  kind: SyntaxKind.IReference
  link: IIdentifier[]
}

export interface IPrimitiveLiteral extends INode {
  kind: SyntaxKind.IPrimitiveLiteral
  value: string | number | boolean | null
}
export interface ILiteralObject extends INode {
  kind: SyntaxKind.ILiteralObject
  keys: Array<IIdentifier>
  value: Array<IValue>
}
export interface ILiteralArray extends INode {
  kind: SyntaxKind.ILiteralArray
  value: Array<IValue>
}

export interface ITypeLiteralObject extends INode {
  kind: SyntaxKind.ITypePrimitiveLiteral
  keys: Array<IIdentifier>
  value: Array<IType>
}
export interface ITypeLiteralArray extends INode {
  kind: SyntaxKind.ITypePrimitiveLiteral
  value: Array<IType>
}
export interface ITypePrimitiveLiteral extends INode {
  kind: SyntaxKind.ITypePrimitiveLiteral
  type: 'string' | 'number' | 'boolean' | 'null' | 'function'
  value?: string | number | boolean
}

export interface IValueEvaluation extends INode {
  object: IReference
  kind: SyntaxKind.IValueEvaluation
  arguments: ISimpleValue[]
}
export interface ITypeEvaluation extends INode {
  object: IReference
  kind: SyntaxKind.ITypeEvaluation
  arguments: ISimpleType[]
}

export interface IValueDefinition extends INode {
  kind: SyntaxKind.IValueDefinition
  name: IName
  value: IValue
}
export interface ITypeDefinition extends INode {
  kind: SyntaxKind.ITypeDefinition
  name: IIdentifier
  value: IType
}

export interface IFunction extends INode {
  kind: SyntaxKind.IFunction
  parameters: IName[]
  defaultParameters: IValue[]
  paramtersType: IType[]
  typeParameters: IType[]
  returnType?: IType
  value: IDefinition[]
  async?: boolean
}
export interface ITypeFunction extends INode {
  kind: SyntaxKind.ITypeFunction
  params: IIdentifier[]
  paramTypes: IType[]
  returnType: IType
  async?: boolean
}

export interface IObjectPaterrn extends INode {
  kind: SyntaxKind.IObjectPaterrn
  patterns: IName[]
}
export interface IArrayPaterrn extends INode {
  kind: SyntaxKind.IArrayPaterrn
  patterns: IName[]
}
