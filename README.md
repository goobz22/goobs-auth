# goobs-auth

goobs-auth

The NPM repo is available here - https://www.npmjs.com/package/goobs-auth

## Version

Install will not be working via npm until beta level of stability reached in .5. Massive changes but this worked succesfully in a repo local to the auth need to externalize it and this is part of that process.

## Integrating goobs-auth

This guide explains how to integrate the goobs-auth

**Step 1: Install the project**

In your Next.js project directory, run the following command to install goobs-next-auth

#### npm

```bash
npm i goobs-auth
```

#### yarn

```bash
yarn add goobs-auth
```

**Step 2: Update next.config.js**

We are using SWC; here is the minimum recommended configuration for next.config.js using our repository

```bash
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['goobs-repo, goobs-next-auth'],
};

export default nextConfig;
```

## License

This project is licensed under the MIT License.

## Feedback and Contributions

We welcome feedback, bug reports, and contributions. If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/goobz22/goobs-auth/issues).

If you would like to contribute to the project, please fork the repository and submit a pull request with your changes.

If you would like to request a this ported over to a different design system, a feature/capability or more information on this project please reach out to Matthew Goluba.

## Contact

For any questions or inquiries, please contact Matthew Goluba.

- Email - mkgoluba@technologiesunlimited.net
- LinkedIn - https://www.linkedin.com/in/matthew-goluba/

The website is in progress and will be shared here soon

Please email for the quickest response
