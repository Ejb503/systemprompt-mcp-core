# Changelog

## [1.0.23] - 2025-01-23

### Fixed

- Fixed validation errors with ajv

All notable changes to this project will be documented in this file.



## [1.0.22] - 2025-01-23

### Fixed

- Fixed validation errors with ajv

All notable changes to this project will be documented in this file.


## [1.0.21] - 2025-01-23

### Fixed

- Fixed validation errors with ajv

All notable changes to this project will be documented in this file.

## [1.0.18] - 2025-01-23

### Changed

- Updated commit state and version tracking
- Synchronized version information across package files

## [1.0.17] - 2025-01-13

### Fixed

- Enhanced error handling in SystemPromptService to properly handle 204 No Content responses
- Improved HTTP status code handling with specific error messages for 400, 403, 404, and 409 responses
- Fixed test expectations to match the new error messages
- Improved test consistency by using a consistent base URL configuration

## [1.0.16] - 2025-01-13

### Fixed

- Updated tests to match the correct resource URI format (`resource:///block/{id}`)
- Fixed test expectations in resource handlers and mappers

## [1.0.15] - 2025-01-13

### Fixed

- Fixed resource URI format in list resources response to consistently use `resource:///block/{id}` format
- Improved handling of null descriptions in resource list response

## [1.0.14] - 2025-01-13

### Fixed

- Modified resource handler to accept both plain UUIDs and full resource URIs
- Improved compatibility with MCP resource protocol

## [1.0.13] - 2025-01-13

### Fixed

- Fixed resource response format in `systemprompt_fetch_resource` tool to match MCP protocol requirements
- Updated tests to match the new resource response format

## [1.0.12] - 2025-01-13

### Changed

- Enhanced README with badges, links, and improved documentation structure
- Improved configuration documentation with detailed environment variables and feature flags
- Updated service documentation with comprehensive API integration details
- Enhanced handlers documentation with detailed implementation examples

## [1.0.11] - 2025-01-13

### Changed

- Added comprehensive test coverage for notification handling
- Enhanced test organization for tool handlers and prompt handlers
- Improved test structure with better mocking patterns for resource handlers

## [1.0.10] - 2025-01-13

### Changed

- Enhanced test coverage and organization in prompt and tool handlers
- Updated tsconfig.json to properly exclude test and mock directories
- Improved test structure with better mocking patterns

## [1.0.9] - 2025-01-10

### Added

- Added new `systemprompt_fetch_resource` tool for retrieving resource content
- Added metadata to prompt and resource responses for better debugging

### Changed

- Refactored prompt argument mapping for improved consistency
- Enhanced prompt result mapping with more detailed metadata

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
