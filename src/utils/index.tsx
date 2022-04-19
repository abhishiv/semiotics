export * from './example_document'
export * from './language_bridge'

import { FS, copyAsyncToSync, mkdirP, InMemoryAdapter, path } from '@gratico/fs'
import { IFileSystem, IKernel, IProject, FileParams, IFileBuffer } from '@gratico/sdk'
import { createProject, TSSystem } from '../index'
import ts from 'typescript'

export async function getAST(fs: IFileSystem, filePath: string) {
	const rawAST = fs.readFileSync(filePath, 'utf8')
	return JSON.parse(rawAST)
}

export async function dumpAST(fs: IFileSystem, filePath: string, ast: any) {
	const rawAST = JSON.stringify(ast)
	fs.writeFileSync(filePath, rawAST)
}

export async function tempFilePath(filepath: string) {
	const dirname = path.dirname(filepath)
	const basename = path.basename(filepath)
	return path.join(dirname, '#' + basename)
}

export async function getProject(fs: IFileSystem, repoPath: string) {
	const syncFSAdapter = new InMemoryAdapter()
	const syncFS = new FS(syncFSAdapter)
	await mkdirP(syncFS, repoPath)
	await copyAsyncToSync(repoPath, fs.adapter, syncFSAdapter)
	const sys = new TSSystem(syncFS, repoPath, ts)
	const project = await createProject(syncFS, repoPath, ts, sys)

	return { project, syncFS }
}
