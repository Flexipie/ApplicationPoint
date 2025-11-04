import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function ApplicationNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <FileQuestion className="h-8 w-8 text-gray-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Application Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          The application you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          href="/applications"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Applications
        </Link>
      </div>
    </div>
  );
}
