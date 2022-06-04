import { SyntaxKind, IFunction, IValueEvaluation, ISourceFile, ISourceFileImport, IDefinition } from '../specs'
import fs from 'fs'
import path from 'path'
import { load as yamlLoad } from 'js-yaml'

import id from 'shortid'
export function repoPath() {
  return path.join(__dirname, '..', '__fixtures__', 'testrepo')
}

export function getDocument(imports: ISourceFileImport[], defs: IDefinition[]) {
  const exampleDocument: ISourceFile = {
    id: id(),
    kind: SyntaxKind.ISourceFile,
    metadata: {
      '^printer': 'co.grati.codemaker.printers.' + SyntaxKind.ISourceFile,
    },
    imports,
    defs,
  }
  // console.log(JSON.stringify(exampleDocument, null, 2))
  return exampleDocument
}

export function getExampleDocument(filePath = 'src/index.maker') {
  const rawAST = fs.readFileSync(path.join(repoPath(), filePath), 'utf8')
  const ast: ISourceFile = yamlLoad(rawAST) as ISourceFile
  return ast
}
