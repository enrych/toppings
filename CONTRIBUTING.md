# Contributing Guide

![GitHub issues by-label](https://img.shields.io/github/issues/enrych/toppings/good%20first%20issue?color=fe7c01&link=https%3A%2F%2Fgithub.com%2Fenrych%2Ftoppings%2Fissues%3Fq%3Dis%253Aopen%2Bis%253Aissue%2Blabel%253A%2522good%2Bfirst%2Bissue%2522)

Welcome to the Toppings! We're excited that you're interested in contributing. Before you get started, please take a moment to read this guide, which outlines the contribution process.

## Prerequisites

Before you start contributing, ensure you have the following installed:

- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- [Go](https://golang.org/) (for running the server locally)
- [Google API Key](https://console.developers.google.com/) with access to YouTube API

## 📁 Project Structure

The project is divided into several components:

1. **App**: Contains all the extension logic.
2. **Server**: Contains the server written in Golang, hosted on Render.
3. **Docs**: Contains the deployed website of the extension, built using a combination of Next.js App Router and Nextra.

## 🏡 Setup for local development

### App

#### 🛠️ Install App Dependencies

- Fork the repository on GitHub.
- Clone your forked repository to your local machine.
- Change to the `app` directory.

```bash
cd app
```

- Install project dependencies.

```bash
bun install
```

#### Build the Extension

- Build the extension in dev mode:

```bash
bun run dev
```

### Server

#### 🛠️ Run the Go Server

- Make sure you have Go installed (`go version` should display the version).
- Start the server located in `server/cmd/main/main.go`.
- This step is required for full functionality of the extension in local development mode.

```bash
cd server/cmd/main
go run main.go
```

### Docs

#### 📚 Install Docs Dependencies

- Change to the `docs` directory.

```bash
cd docs
```

- Install project dependencies.

```bash
bun install
```

#### Run Docs Server

- Run the documentation website in dev mode:

```bash
bun run dev
```

## How to Contribute

We welcome contributions to different parts of the project! Here are some guidelines to help you get started:

### Contributing to App

1. **Create an Issue**: Before creating a new issue, please check if a similar issue already exists. If it does, you can join the discussion there. If not, feel free to create a new issue. Provide clear and concise details about the bug or feature you want to address.

2. **Fork the Repository**: Click the "Fork" button in the top right corner of the repository to create your copy.

3. **Create a Branch**: Create a new branch for your changes related to the app.

```bash
git checkout -b feature/app-feature
```

4. **Make Changes**: Implement your changes in the app directory. Follow the project's coding standards and guidelines.

5. **Test your Changes**: Verify that your changes work as expected in the extension.

6. **Commit Changes**: Commit your changes with a clear and concise commit message.

```bash
git commit -m "Implement feature in app"
```

7. **Push Changes**: Push your changes to your forked repository.

```bash
git push origin feature/app-feature
```

8. **Create a Pull Request (PR)**: Open a PR from your forked repository to the original repository. Describe your changes in the PR.

9. **Code Review**: Participate in the code review process. Address any feedback or comments.

10. **Merge**: Once your PR is approved, it will be merged into the main project.

**For contributing to the server or documentation, follow similar steps specific to those directories.**

### General Notes

- You can contribute to any part of the project independently.
- Contributions without Go and Google API key are welcome but may limit the full functionality of the extension in local development.

## 📮 Submitting PRs

All PRs should be against `main`, and ideally should address an open issue, unless the change is small. Direct commits to main are blocked, and PRs require an approving review to merge into main. Toppings maintainers will review PRs when:

- An initial review has been requested
- A clear, descriptive title has been assigned to the PR
- A maintainer is tagged in the PR comments and asked to complete a review

Thank you for taking the time to contribute to our project! Your involvement helps make this project better for everyone.

## ❓ Need help getting started?

- Browse [issues](https://github.com/enrych/toppings/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) with the "good first issue" label. These are issues we think are good for newcomers.
- Raise an issue for a feature or a bug you want to tackle

If you have any questions or need assistance, please reach out to us through GitHub issues.

Happy coding! 😊

_Could these guidelines be clearer? Feel free to open a PR to help us facilitate open-source contributions!_
