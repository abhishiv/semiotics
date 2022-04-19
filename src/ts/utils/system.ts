import ts from 'typescript'
import { DirectoryWatcherCallback, FileWatcher, FileWatcherCallback } from 'typescript'
import { IFileSystem as FS } from '@gratico/sdk'
import { checksum } from '@gratico/checksum'
import { path as nodePath } from '@gratico/fs'
import EventEmitter from 'emittery'

function isAncestorDir(papa: string, child: string) {
  const papaDirs = papa.split('/').filter((dir) => dir !== '')
  const childDirs = child.split('/').filter((dir) => dir !== '')

  return papaDirs.every((dir, i) => childDirs[i] === dir)
}

export function createSHA256Hash(data: string): string {
  return checksum(data)
}

export class TSSystem extends EventEmitter implements ts.System {
  fs: FS
  rootDir: string
  ts: typeof import('typescript')
  watchDirectoryCallbacks: Array<[string, Function]>
  constructor(fs: FS, rootDir: string, ts: typeof import('typescript')) {
    super()
    this.fs = fs
    this.rootDir = rootDir
    console.log(ts)
    this.ts = ts
    this.watchDirectoryCallbacks = []
    //this.on('writeFile', this.handleWriteFile)
  }

  handleWriteFile = ({ path }: any) => {
    this.watchDirectoryCallbacks.forEach(([dirPath, cb]) => {
      if (isAncestorDir(dirPath, path)) {
        console.log('emitting', path)
        cb(path)
      }
      //
    })
  }

  getCompilationSettings() {
    return {}
  }
  getDefaultLibFileName() {}

  watchFile(path: string, callback: FileWatcherCallback, pollingInterval?: number): ts.FileWatcher {
    //   console.log('watchFile', path)
    return { close: function () {} }
  }
  watchDirectory(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher {
    this.watchDirectoryCallbacks.push([path, callback])
    //   console.log('watchDirectory', path)
    return {
      close: () => {
        this.watchDirectoryCallbacks = this.watchDirectoryCallbacks.filter(([path, cb]) => cb !== callback)
      },
    }
  }

  readFile(path: string, encoding?: string): string | undefined {
    return this.fs.readFileSync(path, encoding || 'utf8')
  }
  getFileSize(path: string): number {
    const file = this.fs.readFileSync(path, 'utf8')
    return Buffer.from(file).byteLength
  }
  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
    const r = this.fs.writeFileSync(path, data)
    this.handleWriteFile({ path })
    //    this.emit('writeFile', { type: 'writeFile', path })
    return r
  }
  resolvePath(path: string): string {
    return path
  }
  fileExists(path: string): boolean {
    return this.fs.existsSync(path)
  }

  directoryExists(path: string): boolean {
    return this.fs.existsSync(path)
  }
  createDirectory(path: string): void {
    return this.fs.mkdirSync(path)
  }
  getExecutingFilePath(): string {
    return `${this.rootDir}/node_modules/typescript/lib/tss.ts`
  }
  getCurrentDirectory(): string {
    return this.rootDir
  }
  getDirectories(path: string): string[] {
    return this.fs.readdirSync(path)
  }
  readDirectory = (
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[] => {
    const syncFs = this.fs
    const getFileSystemEntries = (path: string): any => {
      const files: string[] = []
      const directories: string[] = []
      const entries = syncFs.readdirSync(path)
      for (const entry of entries) {
        const node = syncFs.statSync(nodePath.join(path, entry))
        if (node.isFile()) {
          files.push(entry)
        } else if (node.isDirectory()) {
          directories.push(entry)
        }
      }

      return { files, directories }
    }

    return (this.ts as any).matchFiles(
      path,
      extensions,
      exclude,
      include,
      this.useCaseSensitiveFileNames,
      this.rootDir,
      depth,
      getFileSystemEntries,
      this.fs.realpathSync.bind(this.fs),
      (path: string) => true, // directoryExists:
    )
  }
  deleteFile(path: string): void {
    this.fs.unlinkSync(path)
  }
  realpath(path: string): string {
    return path
  }

  getModifiedTime(path: string): Date | undefined {
    console.log('getModifiedTime', path)
    return
  }
  setModifiedTime(path: string, time: Date): void {
    console.log('getModifiedTime', path, time)
  }

  createHash(data: string): string {
    return createSHA256Hash(data)
  }

  getMemoryUsage?(): number {
    return 0
  }
  exit(exitCode?: number) {
    this.off('writeFile', this.handleWriteFile)
    console.error('exitCode', exitCode)
  }
  setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any {
    return setTimeout(callback, ms, ...args)
  }
  clearTimeout(timeoutId: any): void {
    return clearTimeout(timeoutId)
  }
  clearScreen?(): void {}
  base64decode?(input: string): string {
    return Buffer.from(input).toString('utf8')
  }
  base64encode(input: string): string {
    return Buffer.from(input).toString('base64')
  }
  args: string[] = []
  newLine = '\n'

  getScriptFileNames() {
    return []
  }
  writeOutputIsTTY() {
    return false
  }
  useCaseSensitiveFileNames = false
  write(s: string): void {}
}
