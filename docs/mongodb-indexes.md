# MongoDB Indexes

This document describes the indexes used in the Toulmin Lab database and how to manage them.

## Index Overview

Indexes are created to optimize common query patterns and improve application performance.

### Users Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `userId_unique` | `userId: 1` | Unique | Fast user lookups, enforce uniqueness |
| `createdAt_desc` | `createdAt: -1` | Regular | Sort users by creation date |

### Arguments Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `author_userId_createdAt` | `author.userId: 1, createdAt: -1` | Compound | Find user's arguments sorted by date |
| `createdAt_desc` | `createdAt: -1` | Regular | Sort all arguments by date |

### Coach Sessions Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `userId_updatedAt` | `userId: 1, updatedAt: -1` | Compound | Find user's sessions sorted by update time |
| `userId_status` | `userId: 1, status: 1` | Compound | Filter sessions by status |

### Coach Messages Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `sessionId_createdAt` | `sessionId: 1, createdAt: 1` | Compound | Load session messages in chronological order |

### Argument Drafts Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `sessionId_userId_unique` | `sessionId: 1, userId: 1` | Unique Compound | Ensure one draft per session, fast lookups |
| `userId_updatedAt` | `userId: 1, updatedAt: -1` | Compound | Find user's drafts sorted by update time |

### Coach Usage Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `userId_month_unique` | `userId: 1, month: 1` | Unique Compound | Track monthly usage per user |

### AI Request Events Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| `uid_timestamp` | `uid: 1, timestamp: -1` | Compound | Analytics by user over time |
| `feature_timestamp` | `feature: 1, timestamp: -1` | Compound | Analytics by feature over time |
| `status_timestamp` | `status: 1, timestamp: -1` | Compound | Error rate tracking |

## Creating Indexes

### During Development

Indexes are created automatically on first use in development.

### For Production

Run the index creation script once during deployment:

```bash
npx tsx src/lib/mongodb/indexes.ts
```

Or add to your deployment pipeline:

```json
{
  "scripts": {
    "db:indexes": "tsx src/lib/mongodb/indexes.ts"
  }
}
```

### Verifying Indexes

Use MongoDB Compass or the shell:

```javascript
// List indexes for a collection
db.users.getIndexes()

// Check if a query uses an index
db.arguments.find({ "author.userId": "user123" }).explain("executionStats")
```

## Performance Impact

- **Query Performance**: Properly indexed queries run 10-100x faster
- **Write Performance**: Each index adds ~5-10% overhead to writes
- **Storage**: Indexes consume ~10-15% of collection size

## Maintenance

- **Monitor**: Check slow query logs regularly
- **Update**: Rebuild indexes after major schema changes
- **Clean**: Remove unused indexes to improve write performance
