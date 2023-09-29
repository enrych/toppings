# Contributing Guide

Welcome to the Toppings! We're excited that you're interested in contributing. Before you get started, please take a moment to read this guide, which outlines the contribution process.

## Table of Contents

1. [Getting Started](#getting-started)
2. [How to Contribute](#how-to-contribute)
3. [Code of Conduct](#code-of-conduct)
4. [License](#license)

## Getting Started

### Prerequisites

Before you start contributing, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Installation

1. Fork the repository on GitHub.
2. Clone your forked repository to your local machine.

```bash
git clone https://github.com/your-username/toppings.git
```

3. Change to the project's directory.

```bash
cd toppings
```

4. Install project dependencies.

```bash
npm install
```

## How to Contribute

We welcome contributions from the community! Here are some guidelines to help you get started:

1. **Create an Issue**: Before making any changes, create an issue to discuss what you'd like to contribute. This ensures that your work aligns with the project's goals and prevents duplication of effort.

2. **Fork the Repository**: Click the "Fork" button in the top right corner of the repository to create your copy.

3. **Create a Branch**: Create a new branch for your changes.

```bash
git checkout -b feature/my-new-feature
```

4. **Make Changes**: Make your changes in the new branch. Be sure to follow the project's coding standards and guidelines.

5. **Build and Test the Extension**: To build and test the extension with your changes, use the following script:

```bash
npm run build:dev
```

6. **Load the Extension**: In your Chrome browser, enable developer mode in the extensions settings and load the built extension from the "build" folder.

7. **Commit Changes**: Commit your changes with a clear and concise commit message.

```bash
git commit -m "Add a new feature"
```

8. **Push Changes**: Push your changes to your forked repository.

```bash
git push origin feature/my-new-feature
```

9. **Create a Pull Request (PR)**: Open a PR from your forked repository to the original repository. Provide a clear description of your changes in the PR.

10. **Code Review**: Participate in the code review process. Address any feedback or comments.

11. **Merge**: Once your PR is approved, it will be merged into the main project.

12. **Celebrate**: Your contribution is now part of the project! 🎉

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to follow the code of conduct to maintain a positive and inclusive community.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [License](LICENSE).

---

Thank you for considering contributing to Toppings! Your involvement helps make this project better for everyone. If you have any questions or need assistance, please reach out to us through GitHub issues.

Happy coding! 😊

---
