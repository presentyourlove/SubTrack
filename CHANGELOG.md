# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Git Hooks (Husky + lint-staged) for automated code quality checks
- GitHub Actions CI/CD workflow for continuous integration
- `.env.example` template for environment configuration
- Comprehensive ESLint and Prettier configuration
- Type checking script (`npm run type-check`)

### Changed

- Updated `.gitignore` to ensure `.env` file security
- Enhanced ESLint rules (unused variables now treated as errors)
- Prettier configuration with consistent line endings (LF)

### Fixed

- All ESLint and Prettier formatting issues
- Removed unused imports from test files

## [1.0.0] - Initial Release

### Added

- Subscription management functionality
- Budget tracking with charts and analytics
- Multi-currency support (TWD, USD, JPY, CNY, HKD, MOP, GBP, KRW)
- Firebase integration for cloud sync
- Dark/Light theme support
- Notification and calendar integration (Native)
- Data export (JSON, CSV)
- Web, iOS, and Android support
