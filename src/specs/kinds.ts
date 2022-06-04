export enum SyntaxKind {
  ISourceFile = 'ISourceFile',
  ISourceFileImport = 'ISourceFileImport',
  ISourceFileImportElement = 'ISourceFileImportElement',
  IReference = 'IReference',
  IIdentifier = 'IIdentifier',
  IObjectPaterrn = 'IObjectPaterrn',
  IArrayPaterrn = 'IArrayPaterrn',

  IValueDefinition = 'IValueDefinition',
  ITypeDefinition = 'ITypeDefinition',

  ILiteralObject = 'ILiteralObject',
  ILiteralArray = 'ILiteralArray',

  IValueEvaluation = 'IValueEvaluation',
  ITypeEvaluation = 'ITypeEvaluation',

  IFunction = 'IFunction',
  ITypeFunction = 'ITypeFunction',

  IPrimitiveLiteral = 'IPrimitiveLiteral',
  ITypePrimitiveLiteral = 'ITypePrimitiveLiteral',

  ITypeLiteralObject = 'ITypeLiteralObject',
  ITypeLiteralArray = 'ITypeLiteralArray',

  IMacro = 'IMacro',
}
