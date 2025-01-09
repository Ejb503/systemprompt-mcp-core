# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2025-01-09

### Changed

- Enhanced README with comprehensive agent management capabilities
- Added API key requirement notice and link to console
- Updated tools section with accurate tool names and descriptions
- Improved documentation structure and readability
- Removed redundant testing documentation

## [1.0.5] - 2025-01-09

### Changed

- Made description field nullable in resource types for better type safety
- Improved error handling for null descriptions in resource handlers
- Enhanced test coverage for empty API key initialization and null descriptions
- Refactored test mocks for better type safety

## [1.0.4] - 2025-01-09

### Added

- Added CLI support through npx with proper binary configuration
- Added shebang line for direct script execution

### Changed

- Improved server process handling with proper stdin management
- Removed unnecessary console logging for better stdio transport compatibility

## [1.0.3] - 2025-01-09

### Changed

- Refactored SystemPromptService to use singleton pattern consistently
- Improved test implementations with better mocking and error handling
- Enhanced type definitions and schema validation in handlers

## [1.0.2] - 2025-01-09

### Fixed

- Rebuilt package to ensure latest changes are included in the published version

## [1.0.1] - 2025-01-09

### Changed

- Updated package metadata with proper repository, homepage, and bug tracker URLs
- Added keywords for better npm discoverability
- Added engine requirement for Node.js >= 18.0.0
- Added MIT license specification

## [1.0.0] - 2025-01-09

### Breaking Changes

- Renamed `content` property to `contentUrl` in `SystemPromptResource` interface and all implementations to better reflect its purpose
