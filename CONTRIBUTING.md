# Contributing to React GalliMaps

We love your input! We want to make contributing to React GalliMaps as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### Pull Request Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/react-gallimaps.git
cd react-gallimaps

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build
```

## 📝 Code Style

- We use ESLint and TypeScript for code quality
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new functionality

### Code Quality Commands

```bash
# Lint and fix code
npm run lint:fix

# Type checking
npm run type-check

# Run all quality checks
npm run lint && npm run type-check && npm test
```

## 🧪 Testing

- Write unit tests for all new functionality
- Use React Testing Library for component tests
- Mock external dependencies appropriately
- Ensure accessibility in component tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AutocompleteInput.test.tsx
```

## 📋 Pull Request Guidelines

### Before submitting a pull request:

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes made to documentation
- [ ] Changes generate no new warnings
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged and published

### Pull Request Template

When creating a pull request, please include:

1. **Description**: Clear description of what this PR does
2. **Motivation**: Why is this change needed?
3. **Testing**: How has this been tested?
4. **Screenshots**: For UI changes
5. **Breaking Changes**: List any breaking changes

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/rudalkunwar/react-gallimaps/issues).

### Great Bug Reports Include:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Feature Requests

Feature requests are welcome! Please provide:

- Clear description of the feature
- Use case scenarios
- Possible implementation approach
- Any alternative solutions considered

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## 📞 Questions?

Feel free to contact the maintainers if you have any questions:

- Open an issue for technical questions
- Email: support@gallimaps.com for other inquiries

## 🙏 Recognition

Contributors will be recognized in our README and releases. Thank you for making React GalliMaps better!
