import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Test connection by getting the current user (will be null if not logged in)
  const { data: { user }, error } = await supabase.auth.getUser()

  const connectionStatus = error ? 'Connection error' : 'Connected to Supabase'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold">Pitch Assistant</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Softball Pitch Calling Assistant
        </p>

        <div className="mt-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Database Status</h2>
          <p className={`text-sm ${error ? 'text-red-500' : 'text-green-500'}`}>
            {connectionStatus}
          </p>
          {user && (
            <p className="mt-2 text-sm text-zinc-500">
              Logged in as: {user.email}
            </p>
          )}
          {!user && !error && (
            <p className="mt-2 text-sm text-zinc-500">
              Not logged in
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href="/login"
            className="rounded-lg border border-zinc-200 px-6 py-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Sign Up
          </a>
        </div>
      </main>
    </div>
  )
}
