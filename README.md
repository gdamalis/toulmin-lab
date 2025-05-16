# Toulmin Lab

Toulmin Lab is a tool for creating and analyzing Toulmin diagrams.

## Project Architecture

This application is built using Next.js 15 with the App Router architecture. It follows modern React patterns including React Server Components where applicable, and client-side interactivity where needed.

### Key Technologies

- **Next.js 15 (App Router)**: The foundation of the application
- **React 19**: For building the user interface
- **TypeScript**: For type safety throughout the application
- **Tailwind CSS**: For styling
- **Headless UI**: For accessible UI components
- **Next-Auth**: For authentication and session management
- **Firebase**: For backend services
- **MongoDB**: For data storage
- **xyflow**: For diagram creation and interaction

## Authentication

The application uses a dual authentication approach:

1. **NextAuth.js**: For session management and standardized authentication
2. **Firebase Auth**: For the underlying authentication provider

This setup allows the application to leverage Firebase's authentication capabilities while having a unified session experience through NextAuth.js.

### Critical Environment Variables for Auth

The following environment variables are essential for proper authentication:

```
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-chars

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

> **Important**: The `NEXTAUTH_SECRET` must be set to a secure random string (at least 32 characters) and must be the same across all environments (development, staging, production) to ensure token verification works properly.

### Role-Based Access Control

The application implements role-based access control through custom claims in Firebase tokens, which are then passed to NextAuth.js sessions. Available roles are defined in `src/types/roles.ts` and include:

- User
- Student
- Beta Tester
- Professor
- Administrator

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Firebase Emulator

For local development, you can use Firebase Emulators:

```bash
npm run emulators
```

## Contributing

When contributing to this project, please follow these best practices:

1. Write type-safe code with proper TypeScript types
2. Use React Server Components where possible
3. Follow the established project structure
4. Add appropriate tests for new features
5. Update documentation when making significant changes

## Features

- Create Toulmin arguments with six key elements: Claim, Grounds, Backing for Grounds, Warrant, Backing for Warrant, Qualifier, and Rebuttal
- Visualize arguments as node-edge diagrams
- Export diagrams as PNG, JPG, or PDF
- User authentication with Firebase
- Data persistence with MongoDB

## Tech Stack

- **Frontend**: Next.js 15.3, React 19.1, TypeScript, Tailwind CSS
- **Visualization**: @xyflow/react for diagrams, html-to-image for PNG/JPG export, jsPDF for PDF export
- **Authentication**: Firebase Authentication
- **Database**: MongoDB
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18.x or later
- npm 9.x or later
- A Firebase project with Authentication enabled
- A MongoDB database

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/toulmin-diagram.git
cd toulmin-diagram
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following environment variables:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Building for Production

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation. Each commit message should follow this format:

```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect the code's meaning (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
- `feat: add user authentication`
- `fix(sidebar): correct navigation item highlighting`
- `docs: update installation instructions`

### Versioning

The versioning follows [Semantic Versioning](https://semver.org/) and is automatically handled by GitHub Actions:

- Commits with `fix:` will increment the patch version (1.0.0 -> 1.0.1)
- Commits with `feat:` will increment the minor version (1.0.0 -> 1.1.0)
- Commits with `BREAKING CHANGE:` in the body or footer will increment the major version (1.0.0 -> 2.0.0)

The current version is displayed in the sidebar footer.

## Usage

1. Create an account or sign in
2. Fill out the Toulmin argument form with your claim, grounds, warrant, etc.
3. Submit the form to generate the diagram
4. Use the export buttons to download the diagram as PNG, JPG, or PDF

## Known Issues

- The application requires JavaScript to be enabled in the browser
- Mobile support is limited for diagram editing
- The diagram may not render correctly in browsers that don't support modern CSS or JavaScript features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The Toulmin Model was developed by philosopher Stephen Toulmin
- This project uses the @xyflow/react library for diagram visualization
- Thanks to the Next.js team for their excellent framework

## Author

- Gabriel Damalis (gabrieldamalis@gmail.com)
- Made with love ♥️ from Buenos Aires, Argentina
