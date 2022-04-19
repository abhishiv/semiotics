import { IFileSystem } from '@gratico/kernel'
import ts from 'typescript'
import fs from 'fs'
import path from 'path'
import { load as yamlLoad } from 'js-yaml'
import { ISourceFile } from '../../specs'
import { createProject, getScopeCompletions, getFunctionParameters, getPropertiesCompletions } from '../../index'

export function repoPath() {
  return path.join(__dirname, '..', '..', '__fixtures__', 'testrepo')
}

export async function getProject() {
  const project = createProject(fs as unknown as IFileSystem, repoPath(), ts, ts.sys)
  return project
}

export async function getAST(filePath = 'src/index.maker') {
  const rawAST = fs.readFileSync(path.join(repoPath(), filePath), 'utf8')
  const ast: ISourceFile = yamlLoad(rawAST) as ISourceFile
  return ast
}

describe('Semiotics', () => {
  test('get variables in scope', async () => {
    const project = await getProject()
    const filePath = 'src/index.maker'
    const ast = await getAST(filePath)
    const completions = await getScopeCompletions(
      project,
      {
        id: filePath,
        filePath,
      } as any,
      ast,
      [
        { propName: 'defs', index: 1 },
        { propName: 'value' },
        { propName: 'value', index: 1 },
        { propName: 'value' },
        { propName: 'object' },
      ],
      'Docu',
    )
    //    console.log(completions.length)
    //   console.log(completions[3])

    project.compiler.watchProgram.close()

    expect(completions.length).toBeGreaterThan(0)
  }, 5000)

  test('get properies completion scope', async () => {
    const project = await getProject()
    const filePath = 'src/index.maker'
    const ast = await getAST(filePath)
    const completions = await getPropertiesCompletions(
      project,
      {
        id: filePath,
        filePath,
      } as any,
      ast,
      [
        { propName: 'defs', index: 1 },
        { propName: 'value' },
        { propName: 'value', index: 1 },
        { propName: 'value' },
        { propName: 'object' },
      ],
      'c',
    )
    //console.log(completions.length)
    //console.log(completions)

    project.compiler.watchProgram.close()

    expect(completions.length).toBeGreaterThan(0)
  }, 5000)

  test('get function parameters type', async () => {
    const project = await getProject()
    const filePath = 'src/index.maker'
    const ast = await getAST(filePath)

    //    window.getComputedStyle()

    const completions = await getFunctionParameters(
      project,
      {
        id: filePath,
        filePath,
      } as any,
      ast,
      [
        { propName: 'defs', index: 1 },
        { propName: 'value' },
        { propName: 'value', index: 1 },
        { propName: 'value' },
        { propName: 'object' },
      ],
    )
    console.log(completions)
    //    console.log(completions.parameters[2].type.types[0])
    project.compiler.watchProgram.close()

    expect(completions).toBeDefined()
  }, 5000)
})
