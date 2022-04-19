import { morph } from '../utils/tree'
import { INode, ISourceFile } from '../specs/index'
import { defaultConfig } from '../transpilers/index'

export function transform(document: ISourceFile, node?: INode) {
  return morph(document)
}
