import { auth, signOut } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with sign out */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-primary">ApplicationPoint</h1>
          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{session.user.name}</p>
                <p className="text-gray-500">{session.user.email}</p>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome, {session?.user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Your job application tracker is ready!
          </p>
          <div className="space-y-4">
            <a
              href="/applications"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90"
            >
              View Applications
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p>✅ Authentication working</p>
              <p>✅ Database connected</p>
              <p>✅ Applications API ready</p>
              <p>✅ List View UI ready</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
