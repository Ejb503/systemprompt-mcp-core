# Changelog

All notable changes to this project will be documented in this file.

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
