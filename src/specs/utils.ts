import { ASTPath } from './language'
export function flattenASTPath(path: ASTPath[]) {
  return path.reduce<string[]>((state, path) => {
    state.push(path.propName)
    if (Number.isFinite(path.index)) {
      state.push(path.index + '')
    }
    return state
  }, [])
}
