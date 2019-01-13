import { IEmeraltDatabase, CEmeraltDatabase } from '@emeralt/types'
import { path, assocPath, mergeDeepLeft } from 'ramda'

export const EmeraltDatabaseInMemory: IEmeraltDatabase = () => () => {
  return new class Database implements CEmeraltDatabase {
    private storage = {
      metadata: {},
      versions: {},
    }

    listMetadata() {
      return path(['metadata'], this.storage)
    }

    getMetadata(name: string) {
      return path(['metadata', name], this.storage)
    }

    putMetadata(name: string, data: any) {
      const current = this.getMetadata(name) || {}

      this.storage = assocPath(
        ['metadata', name],
        mergeDeepLeft(data, current),
        this.storage,
      )
    }

    listVersions(name: string) {
      return path(['versions', name], this.storage)
    }

    getVersion(name: string, version: string) {
      return path(['versions', name, version], this.storage)
    }

    putVersion(name: string, version: string, data: any) {
      this.storage = assocPath(['versions', name, version], data, this.storage)
    }
  }()
}
