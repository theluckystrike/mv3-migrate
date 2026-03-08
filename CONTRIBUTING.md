# Contributing to mv3-migrate

Thank you for your interest in contributing to mv3-migrate! This guide will help you get started with development and ensure your contributions align with our project standards.

## How to Fork and Clone

1. **Fork the repository**: Click the "Fork" button on the [mv3-migrate GitHub page](https://github.com/theluckystrike/mv3-migrate)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mv3-migrate.git
   cd mv3-migrate
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/theluckystrike/mv3-migrate.git
   ```

## Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run the linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Watch mode for development
npm run dev
```

### Prerequisites

- Node.js 18+ 
- npm 9+

## Code Style Guidelines

We use TypeScript with strict typing and follow these guidelines:

- **No `any` types** - Use proper TypeScript types or `unknown` when necessary
- **Use ESLint and Prettier** - Run `npm run lint` and `npm run format` before committing
- **Keep functions small and focused** - Aim for single responsibility
- **Write descriptive variable and function names**
- **Comment complex logic** - Explain the "why", not the "what"

### TypeScript Best Practices

```typescript
// ✅ Good: Explicit types
function migrateManifest(manifest: ManifestV2): MigrationResult {
  // ...
}

// ❌ Avoid: Using 'any'
function process(data: any): any {
  // ...
}
```

## How to Submit Pull Requests

1. **Create a feature branch** from the latest main:
   ```bash
   git fetch upstream
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Write tests** for new features or bug fixes

4. **Run the full check**:
   ```bash
   npm run build
   npm test
   npm run lint
   npm run format
   ```

5. **Commit with a clear message**:
   ```bash
   git commit -m "feat: add support for declarativeNetRequest conversion"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, no logic change)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** against the `master` branch

8. **Fill out the PR template** with:
   - Description of changes
   - Related issues
   - Testing steps

## Issue Reporting Guidelines

When reporting bugs or requesting features:

1. **Search existing issues** before creating a new one
2. **Use the issue templates** - They help us gather the necessary information
3. **For bugs, include**:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Node.js version and OS
   - Extension manifest (if applicable)
4. **For feature requests**:
   - Describe the use case
   - Suggest a solution
   - Consider alternatives

## Reference Documentation

For Chrome Extension development best practices and Manifest V3 specifics, refer to the [Chrome Extension Guide (chrome-extension-guide)](https://github.com/theluckystrike/chrome-extension-guide).

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
