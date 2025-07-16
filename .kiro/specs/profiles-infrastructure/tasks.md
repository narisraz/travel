# Implementation Plan

- [x] 1. Create infrastructure directory structure
  - Create the profiles/infrastructure directory structure following auth module patterns
  - Set up persistence and services subdirectories
  - _Requirements: 2.4_

- [x] 2. Extend database schema for hotels
  - Modify the existing database.ts to include hotels table creation
  - Add hotels table with proper columns and constraints
  - Add foreign key relationship to users table
  - Add appropriate indexes for performance
  - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.4, 3.5_

- [x] 3. Implement SQLite hotel repository
  - Create hotel.repository.sqlite.ts with SQLiteHotelRepository class
  - Implement save method with address field handling
  - Implement getById method with proper data reconstruction
  - Handle address serialization and deserialization
  - Use Effect for error handling and composition
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.3_

- [x] 4. Create Effect layers for hotel repository
  - Create layer.ts file for hotel repository layers
  - Implement SQLiteHotelRepositoryLayer for default database
  - Implement SQLiteHotelRepositoryLayerWithPath for custom database path
  - Follow the same patterns as auth module layers
  - _Requirements: 2.2, 2.4_

- [ ] 5. Update database initialization to include hotels table
  - Modify src/auth/infrastructure/persistence/database.ts to create hotels table
  - Ensure hotels table is created during database initialization
  - Add proper foreign key constraints and indexes
  - _Requirements: 1.4, 3.1, 3.2, 3.5_
  