# Contributing Guide

![GitHub issues by-label](https://img.shields.io/github/issues/enrich-platforms/toppings/good%20first%20issue?color=fe7c01&link=https%3A%2F%2Fgithub.com%2Fenrich-platforms%2Ftoppings%2Fissues%3Fq%3Dis%253Aopen%2Bis%253Aissue%2Blabel%253A%2522good%2Bfirst%2Bissue%2522)

Welcome to the Toppings! We're excited that you're interested in contributing. Before you get started, please take a moment to read this guide, which outlines the contribution process.

## Prerequisites

Before you start contributing, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

## 🏡 Setup for local development

### 🛠️ Install Toppings locally from `main`

- Fork the repository on GitHub.
- Clone your forked repository to your local machine.
- Change to the project's directory.

```bash
cd toppings
```

- Install project dependencies.

```bash
npm install
```

- Build the extension in dev mode:

```bash
npm run build:dev
```

- In your Chrome browser, enable developer mode in the extensions settings and load the built extension from the "build" folder.

## How to Contribute

We welcome contributions from the community! Here are some guidelines to help you get started:

1. **Create an Issue**: Before creating a new issue, please check if a similar issue already exists. If it does, you can join the discussion there. If not, feel free to create a new issue. We encourage you to provide clear and concise details about the bug or feature you want to address. This ensures that your work aligns with the project's goals and prevents duplication of effort.

2. **Fork the Repository**: Click the "Fork" button in the top right corner of the repository to create your copy.

3. **Create a Branch**: Create a new branch for your changes.

```bash
git checkout -b feature/my-new-feature
```

4. **Make Changes**: Make your changes in the new branch. Be sure to follow the project's coding standards and guidelines. Make sure that the code is linted.

5. **Test your Changes**: Verify that your changes work as expected in the extension by interacting with it in your browser.

6. **Commit Changes**: Commit your changes with a clear and concise commit message.

```bash
git commit -m "Add a new feature"
```

7. **Push Changes**: Push your changes to your forked repository.

```bash
git push origin feature/my-new-feature
```

8. **Create a Pull Request (PR)**: Open a PR from your forked repository to the original repository. Provide a clear description of your changes in the PR.

9. **Code Review**: Participate in the code review process. Address any feedback or comments.

10. **Merge**: Once your PR is approved, it will be merged into the main project.

11. **Celebrate**: Your contribution is now part of the project! 🎉

## 📮 Submitting PRs

All PRs should be against `main`, and ideally should address an open issue, unless the change is small. Direct commits to main are blocked, and PRs require an approving review to merge into main. By convention, the Toppings maintainers will review PRs when:

- An initial review has been requested
- A clear, descriptive title has been assigned to the PR
- A maintainer is tagged in the PR comments and asked to complete a review

Don't forget the format your code before pushing:

Thank you for taking the time to contribute to our project!

## ❓ Need help getting started?

- Browse [issues](https://github.com/enrich-platforms/toppings/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) with the "good first issue" label. These are issues we think are good for newcomers.
- Raise an issue for a feature or a bug you want to tackle

Thank you for considering contributing to Toppings! Your involvement helps make this project better for everyone. If you have any questions or need assistance, please reach out to us through GitHub issues.

Happy coding! 😊

_Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!_
