# Contributing to GeoFlags

Thank you for your interest in contributing to GeoFlags! We welcome contributions from the community and are excited to work with you.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots or animated GIFs** if applicable
- **Include your environment details** (OS, Node.js version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any similar features** in other applications (if applicable)
- **Include mockups or examples** if possible

### Your First Code Contribution

Unsure where to begin? You can start by looking through issues tagged with:

- `good-first-issue` - Simple issues perfect for beginners
- `help-wanted` - Issues that need attention
- `documentation` - Improvements to documentation

## 🚀 Getting Started

### Prerequisites

- **Node.js** v24.11.1 or higher
- **PostgreSQL** v14.0 or higher (for backend)
- **npm** or **yarn**
- **Git**

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/GeoFlags.git
   cd GeoFlags
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Lukas200301/GeoFlags.git
   ```

4. **Install dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

5. **Set up environment variables**

   See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed configuration.

6. **Start the development servers**
   ```bash
   # Both frontend and backend
   npm run dev:all

   # Or separately:
   npm run dev              # Frontend only
   cd backend && npm run dev  # Backend only
   ```

## 🔄 Development Workflow

1. **Create a new branch** for your work
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the project's coding standards
   - Add or update tests as needed
   - Update documentation if required

3. **Test your changes**
   ```bash
   npm run lint        # Check code style
   npm run format      # Format code
   npm run build       # Verify production build
   ```

4. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))

5. **Keep your fork up-to-date**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

## 💻 Coding Standards

### General Principles

- Write clear, self-documenting code
- Keep functions small and focused
- Follow the Single Responsibility Principle
- Use meaningful variable and function names
- Comment complex logic, not obvious code

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (`strict: true`)
- Define proper types and interfaces
- Avoid using `any` - use `unknown` if type is truly unknown
- Use type inference where appropriate

### Vue/Nuxt

- Use Composition API (`<script setup>`)
- Keep components small and reusable
- Use composables for shared logic
- Follow Vue.js style guide recommendations

### Backend (Express)

- Use async/await instead of callbacks
- Implement proper error handling
- Validate all user inputs with Zod schemas
- Use Prisma for database queries (no raw SQL)
- Follow RESTful API conventions

### Code Formatting

The project uses **ESLint** and **Prettier** for consistent formatting:

```bash
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format with Prettier
```

**Configuration:**
- Indentation: 2 spaces
- Quotes: Single quotes for JavaScript/TypeScript
- Semicolons: Required
- Line length: 100 characters (soft limit)

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring (no feature change or bug fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates, etc.
- **ci**: CI/CD configuration changes

### Examples

```bash
feat(auth): add password reset functionality

Implement password reset flow with email verification
- Add reset password endpoint
- Create reset token generation
- Send email with reset link
- Add password reset form

Closes #123
```

```bash
fix(leaderboard): correct score sorting order

Scores were sorted ascending instead of descending.
Fixed comparison function in leaderboard query.

Fixes #456
```

```bash
docs(readme): update installation instructions

Add Node.js version requirement and clarify setup steps
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep the subject line under 72 characters
- Separate subject from body with a blank line
- Use the body to explain *what* and *why*, not *how*
- Reference issues and pull requests in the footer

## 🔀 Pull Request Process

### Before Submitting

1. **Update documentation** if you changed functionality
2. **Run all checks**
   ```bash
   npm run lint
   npm run format
   npm run build
   ```
3. **Test your changes** thoroughly
4. **Rebase on latest main** to avoid merge conflicts

### PR Title

Follow the same format as commit messages:
```
feat(scope): description of change
```

### PR Description

Include:
- **Summary**: Brief description of changes
- **Motivation**: Why is this change needed?
- **Changes**: List of specific changes made
- **Testing**: How did you test these changes?
- **Screenshots**: If applicable, add before/after screenshots
- **Breaking Changes**: List any breaking changes
- **Related Issues**: Link to related issues

### PR Template

```markdown
## Description
<!-- Brief description of changes -->

## Motivation
<!-- Why is this change needed? -->

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
<!-- How did you test these changes? -->

## Screenshots
<!-- If applicable -->

## Breaking Changes
<!-- List any breaking changes -->

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** must pass (linting, building)
2. **Code review** by at least one maintainer
3. **Address feedback** and make requested changes
4. **Approval** from maintainer
5. **Merge** (squash and merge preferred)

### After Merge

- Delete your feature branch
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

## 🐛 Reporting Bugs

Use the **Bug Report** issue template and include:

- **Environment** (OS, Node.js version, browser)
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Error messages** or logs
- **Screenshots** or video recordings

## ✨ Suggesting Enhancements

Use the **Feature Request** issue template and include:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: Your idea for solving it
- **Alternatives**: Other solutions you've considered
- **Additional context**: Mockups, examples, etc.

## 🔒 Security Vulnerabilities

**Do NOT** create public issues for security vulnerabilities.

Instead, please use GitHub's private security advisory feature to report vulnerabilities:
1. Go to the repository's Security tab
2. Click "Report a vulnerability"
3. Provide detailed information

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

See [SECURITY.md](./SECURITY.md) for more details on reporting security issues.

## 📚 Additional Resources

- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [SECURITY.md](./SECURITY.md) - Security documentation
- [README.md](./README.md) - Project overview
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines

## 🙏 Thank You!

Your contributions make GeoFlags better for everyone. We appreciate your time and effort!

---

**Questions?** Feel free to open a discussion on GitHub or reach out to the maintainers.
