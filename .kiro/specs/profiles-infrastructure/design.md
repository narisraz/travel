# Design Document

## Overview

The profiles infrastructure layer will implement SQLite-based persistence for hotel profiles, following the established patterns from the auth module. The implementation will include a concrete hotel repository, database schema management, and Effect layers for dependency injection.

## Architecture

The infrastructure layer follows the clean architecture pattern with these key components:

- **SQLite Hotel Repository**: Concrete implementation of the HotelRepository interface
- **Database Schema**: SQLite table structure for hotels with address handling
- **Effect Layers**: Dependency injection layers for the hotel repository
- **Database Management**: Initialization and connection management

The design integrates with the existing Effect-based architecture and maintains consistency with the auth module patterns.

## Components and Interfaces

### SQLiteHotelRepository

```typescript
class SQLiteHotelRepository implements HotelRepository {
  constructor(private readonly database: SQLiteDatabase)
  
  save(hotel: Hotel): Effect.Effect<void>
  getById(id: string): Effect.Effect<Hotel | null>
}
```

**Responsibilities:**
- Implement hotel persistence operations using SQLite
- Handle address serialization/deserialization
- Provide error handling through Effect

### Database Schema

**Hotels Table Structure:**
```sql
CREATE TABLE hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  auth_id TEXT NOT NULL,
  address_street TEXT,
  address_zip_code TEXT,
  address_city TEXT,
  address_country TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auth_id) REFERENCES users(id)
);
```

**Design Decisions:**
- Address fields stored as separate columns for queryability
- Foreign key relationship to users table via auth_id
- Created timestamp for audit purposes
- Index on auth_id for efficient user-based queries

### Effect Layers

```typescript
// Layer for hotel repository with default database
export const SQLiteHotelRepositoryLayer: Layer.Layer<HotelRepository>

// Layer for hotel repository with custom database path
export const SQLiteHotelRepositoryLayerWithPath: (dbPath: string) => Layer.Layer<HotelRepository>
```

## Data Models

### Hotel Persistence Mapping

**Domain to Database:**
- `hotel.id` → `hotels.id`
- `hotel.name` → `hotels.name`
- `hotel.description` → `hotels.description`
- `hotel.authId` → `hotels.auth_id`
- `hotel.address.street` → `hotels.address_street`
- `hotel.address.zipCode` → `hotels.address_zip_code`
- `hotel.address.city` → `hotels.address_city`
- `hotel.address.country` → `hotels.address_country`

**Database to Domain:**
- Reconstruct Address value object from separate columns
- Handle null address fields appropriately
- Use Effect Schema for validation during reconstruction

## Error Handling

### Database Operation Errors

**Strategy:** Use Effect's error handling capabilities
- Catch SQLite exceptions and convert to Effect errors
- Provide graceful fallbacks for non-critical operations
- Log errors for debugging while maintaining application stability

**Error Types:**
- Database connection errors
- Constraint violation errors
- Data validation errors during reconstruction

### Implementation Pattern

```typescript
save = (hotel: Hotel): Effect.Effect<void, never, never> =>
  Effect.try(() => {
    // SQLite operations
  }).pipe(
    Effect.catchAll(() => Effect.succeed(void 0))
  )
```

## Implementation Considerations

### Database Migration

**Initial Implementation:**
- Create hotels table during database initialization
- Add to existing database.ts initialization logic
- Ensure backward compatibility with existing auth tables

### Performance Optimization

**Indexing Strategy:**
- Primary index on hotel.id (automatic)
- Index on auth_id for user-based queries
- Consider composite indexes for common query patterns

### Address Data Handling

**Storage Strategy:**
- Separate columns for each address field
- Allows for efficient querying by location
- Maintains data normalization
- Handles optional fields with NULL values

### Consistency with Auth Module

**Pattern Alignment:**
- Same file structure and naming conventions
- Identical Effect usage patterns
- Consistent error handling approach
- Similar layer composition patterns