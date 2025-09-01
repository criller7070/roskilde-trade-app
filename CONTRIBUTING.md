# Contributing to RosSwap

Thank you for your interest in contributing to RosSwap! This document provides guidelines for contributing to this project.

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Firebase CLI 12.0.0 or higher

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/roskilde-trade-webapp.git`
3. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../functions && npm install
   ```
4. Create your environment file: `cp frontend/.env.example frontend/.env.local`
5. Set up your Firebase project (see README.md for detailed instructions)

## Development Workflow

### Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Commit with a descriptive message: `git commit -m "feat: add new feature"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Code Style
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript-style JSDoc comments for complex functions

### Testing
- Test your changes in development mode
- Test with Firebase emulators if making backend changes
- Ensure all existing functionality still works
- Test on different screen sizes for UI changes

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile/desktop
- [ ] Firebase security rules are considered for any data changes

### PR Description
Please include:
- Description of the changes
- Screenshots if UI changes
- Testing steps
- Any breaking changes
- Related issues

## Security Considerations

### Never Commit
- API keys or secrets
- Environment files (.env)
- Firebase service account keys
- Private keys or certificates
- Database dumps

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] XSS protection in place
- [ ] Rate limiting considered
- [ ] Firebase security rules updated if needed

## Areas for Contribution

### Frontend
- UI/UX improvements
- Performance optimizations
- Accessibility enhancements
- New features
- Bug fixes

### Backend
- Firebase Functions improvements
- Security rule enhancements
- Database optimization
- API improvements

### Documentation
- README improvements
- Code documentation
- Setup guides
- Tutorials

## Getting Help

- Check existing issues for similar problems
- Ask questions in GitHub Discussions
- Review the README.md for setup instructions
- Check Firebase documentation for backend questions

## Code of Conduct

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow the project's coding standards

Thank you for contributing to RosSwap! 🚀 