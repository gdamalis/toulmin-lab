# Toulmin Diagram Builder

A web application for creating, visualizing, and exporting Toulmin argument diagrams.

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
