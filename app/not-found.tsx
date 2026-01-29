import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
      <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 max-w-md">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-100 mb-2">
          Invalid Address
        </h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for in the CryptoDash domain does not exist.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
        >
          Back to home page
        </Link>
      </div>
    </div>
  );
}
