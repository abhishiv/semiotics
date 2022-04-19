import { IKernel, IFileBuffer } from '@gratico/sdk'
import EventEmitter from 'emittery'

export interface ILanguageBridge<IntermediateAST> extends EventEmitter {
  fileBuffer: IFileBuffer
  filepath: string
  ast: IntermediateAST | null
  kernel: IKernel
}

export type EditorProps = {}

export interface ILanguageBridgeEditor {
  meta?: any
  renderer: (props: EditorProps) => JSX.Element
}
