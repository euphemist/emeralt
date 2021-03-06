import {
  IEmeraltDatabase,
  CEmeraltDatabase,
  TMetadata,
  TVersion,
} from '@emeralt/types'
import {
  Firestore,
  CollectionReference,
  DocumentReference,
} from '@google-cloud/firestore'

type Options = {
  prefix?: {
    collection: string
    document: string
  }
  firestore?: FirebaseFirestore.Settings
}

class CEmeraltDatabaseCloudFirestore implements CEmeraltDatabase {
  db: {
    metadatas: CollectionReference
    versions: CollectionReference
    // used for healtz
    ping: DocumentReference
  }

  constructor(private options: Options) {
    const { document, collection } = this.options.prefix || {
      document: 'emeralt-test',
      collection: 'emeralt-test',
    }

    let firestore = new Firestore(this.options.firestore)
      .collection(collection)
      .doc(document)

    this.db = {
      metadatas: firestore.collection('metadatas'),
      versions: firestore.collection('versions'),
      ping: firestore.collection('ping').doc('ping'),
    }
  }

  private encode(n: string) {
    return encodeURIComponent(n)
  }

  private decode(n: string) {
    return decodeURIComponent(n)
  }

  private reduceCollection = <T>(col: CollectionReference) =>
    col.get().then((collection) =>
      collection.docs.reduce(
        (acc, cur) => ({
          ...acc,
          [this.decode(cur.id)]: cur.data() as T,
        }),
        {},
      ),
    )

  public getMetadatas() {
    return this.reduceCollection(this.db.metadatas)
  }

  public hasMetadata(name: string) {
    return this.db.metadatas
      .doc(this.encode(name))
      .get()
      .then((d) => d.exists)
  }

  public getMetadata(name: string) {
    return this.db.metadatas
      .doc(this.encode(name))
      .get()
      .then((d) => d.data() as TMetadata)
  }

  public putMetadata(name: string, data: TMetadata) {
    this.db.metadatas.doc(this.encode(name)).set(data, {
      merge: true,
    })
  }

  public getVersions(name: string) {
    return this.reduceCollection(
      this.db.versions.doc(this.encode(name)).collection('versions'),
    )
  }

  public hasVersion(name: string, version: string) {
    return this.db.versions
      .doc(this.encode(name))
      .collection('versions')
      .doc(this.encode(version))
      .get()
      .then((d) => d.exists)
  }

  public getVersion(name: string, version: string) {
    return this.db.versions
      .doc(this.encode(name))
      .collection('versions')
      .doc(this.encode(version))
      .get()
      .then((d) => d.data() as TVersion)
  }

  public putVersion(name: string, version: string, data: TVersion) {
    return this.db.versions
      .doc(this.encode(name))
      .collection('versions')
      .doc(this.encode(version))
      .set(data, {
        merge: true,
      })
  }

  public async dropData() {
    await this.db.metadatas
      .listDocuments()
      .then((metadatas) => Promise.all(metadatas.map((d) => d.delete())))

    await this.db.versions.listDocuments().then((names) =>
      Promise.all(
        names.map(async (d) => {
          await d
            .collection('versions')
            .listDocuments()
            .then((versions) =>
              Promise.all(versions.map((doc) => doc.delete())),
            )

          await d.delete()
        }),
      ),
    )
  }

  public async healthz() {
    try {
      await this.db.ping.set({ lastUpdated: Date.now() })

      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        error: error,
      }
    }
  }
}

export const EmeraltDatabaseCloudFirestore: IEmeraltDatabase<Options> = (
  options,
) => () => new CEmeraltDatabaseCloudFirestore(options)
