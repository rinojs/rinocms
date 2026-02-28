## About Crumbdb.js
### What it is
CrumbDB is a lightweight file-based JSON document store.
- Storage model: filesystem
- Document unit: one .json file per document
- Concurrency model:
  - per-file lock (getFileLock) to prevent simultaneous writes/reads on the same file
  - global IO semaphore (Semaphore(iomax)) to limit total concurrent I/O

This makes it safe for multi-request workloads (e.g., Express + backoffice + cron jobs) without corrupting files.

### Important Notes for AI
When writing code that uses CrumbDB:
1. Do not invent new DB methods. Use only the commands listed above.
2. Treat get() missing/error as "" (empty string).
3. Prefer dbCommandWithTimeout() in web routes to avoid hanging requests.
4. Maintain the path convention:
  - dirname = db root directory (e.g. dbDir)
  - databasename = app namespace (e.g. "rinocms")
  - collectionname = collection folder (e.g. "account")
  - documentname = identifier (e.g. email)
5. Do not read/write .json files directly in app code if dbProxy exists—route all DB access through dbProxy.

### Data Layout (On Disk)
1. A document is stored at:
```
{dirname}/{databasename}/{collectionname}/{documentname}.json
```
2. Example:
```
/db/rinocms/account/test@example.com.json
```

Notes:
- `dirname`, `databasename`, `collectionname` are directory segments
- `documentname` becomes the filename (plus .json)
- The library does not enforce JSON validity — it stores raw string content as-is

### Core API (Direct CrumbDB)
All functions are async.
1. add(dirname, databasename, collectionname, documentname, value, encoding = "utf8") → boolean
Creates a new document file.
- Ensures collection directory exists (mkdir -p)
- If file already exists → returns false
- Otherwise writes the file → returns true
- On any error → returns false
Important behavior:
- Uses per-file lock + IO semaphore
2. update(dirname, databasename, collectionname, documentname, value, encoding = "utf8") → boolean
Updates an existing document file.
- Ensures collection directory exists
- If file exists → writes and returns true
- If file does not exist → returns false
- On error → returns false
3. get(dirname, databasename, collectionname, documentname, encoding = "utf8") → string
Reads a document file.
- Returns file content as string
- If missing/error → returns empty string "" (not null/undefined)
4. remove(dirname, databasename, collectionname, documentname) → boolean
Deletes a document file.
- On success → true
- On error (missing, permissions, etc.) → false
5. getAll(dirname, databasename, collectionname, encoding = "utf8") → object
Reads all .json documents in a collection directory.
Returns:
```
{
  [documentname]: "file content string",
  ...
}
```
Behavior:
- Only reads files ending with .json
- If a specific file fails to read, that key maps to empty string ""
- If collection directory missing or error → returns {}

### Pagination APIs
These return a structure:
```
{
  data: { [documentname]: "content string" },
  meta: { DBNextPosition: number, DBEnd: boolean }
}
```
1. getMultiple(dirname, databasename, collectionname, position, count, encoding = "utf8")
- Iterates directory entries in order returned by opendir()
- Skips until position
- Takes up to count
- DBNextPosition is set to seen count after scanning
- DBEnd indicates whether there are no more .json files beyond returned set
Guard:
- If position < 0 or count <= 0 → returns { data: {}, meta: { DBNextPosition: position, DBEnd: true } }
Implementation note:
- Uses IO semaphore while scanning directory
- Locks each file when reading it

2. getMultipleByKeyword(dirname, databasename, collectionname, keyword, position, count, encoding = "utf8")
Same as getMultiple, but filters by:
- documentname (filename without .json)
- case-insensitive containment
- keyword.trim().toLowerCase()

3. getMultipleByKeywords(dirname, databasename, collectionname, keywords, position, count, encoding = "utf8")
Filters by multiple keywords:
- Accepts array or single value
- Normalizes:
  - trims
  - lowercases
  - removes null/empty
  - de-duplicates with Set

Match rule:
- Include document if documentname contains any keyword (OR semantics)

If no valid keywords → returns empty result.

### Backup / Restore
1. backup(sourceDir, zipPath) → boolean
Creates a zip backup (using yazl) containing only .json files inside sourceDir.
- Deletes existing zip at zipPath (rm --force)
- Recursively walks directories
- Adds .json files to zip with relative paths (relative to sourceDir)
- Locks each file before reading
- Returns true on success, false otherwise

2. restore(zipPath, destDir) → boolean

Restores a zip backup (using yauzl) into destDir.

Behavior:
- Creates directories for folder entries
- For file entries:
  - creates parent dirs
  - locks destination file path
  - streams zip entry into destination file (pipeline)
- Resolves to true on complete, otherwise returns false

Important:
- Restore is streaming-based, safe for large backups
- Uses lock + IO semaphore per destination file


### RinoCMS Integration Pattern (IPC Child Process)
In RinoCMS, CrumbDB is wrapped into a child-process DB worker.

#### /src/server/db/db.js (child worker)
- Instantiates:
```
const db = new CrumbDB(512);
```
- Listens for:
```
process.on("message", async ({ cmd, id, args }) => ...)
```
- Supported cmd values (case-insensitive):
```
get
add
update
remove
getall
getmultiple
getmultiplebykeyword
getmultiplebykeywords
backup
restore
```
- Replies:
```
process.send({ id, result })
process.send({ id, error: err.message })
```

1. dbProxy.js (parent proxy)
Forks the child worker and exposes promise-based commands.

2. dbCommand(cmd, ...args) → Promise<any>
- Sends { cmd, id, args }
- Resolves with result or rejects with Error

3. dbCommandWithTimeout(ms, cmd, ...args) → Promise<any>
Adds timeout via Promise.race().
- Rejects with: Error("dbCommand timeout: <cmd>") after ms

ID system:
- timestamp-counter unique IDs ("${lastTimestamp}-${idCounter++}")
- pendingMap stores {resolve,reject}

### Usage Example (RinoCMS)
```
const result = await dbCommandWithTimeout(
  10000,
  "get",
  dbDir,
  "rinocms",
  "account",
  email
);

if (!result) { ... } // note: get() returns "" on missing
```

Important:
- get() returns "" on missing/error, so truthy check is used.
- If you need to distinguish “missing” vs “error”, current API does not expose that — it always returns "" on error.