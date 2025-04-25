import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Toulmin Diagram Builder
          </h1>
          <p className="mt-3 text-center text-gray-600">
            Build and export Toulmin argument diagrams with ease
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/signin"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            A tool for creating structured arguments using the Toulmin method
          </p>
        </div>
      </div>
    </div>
  );
}
