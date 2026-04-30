import { FormEvent, useState } from "react";

type LoginPageProps = {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
};

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onLogin({
        username: username.trim(),
        password,
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f2] px-4 py-10 text-mist-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/90 shadow-soft">
          <section className="px-6 py-10 sm:px-10 sm:py-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Savorybase</p>
              <h2 className="mt-3 font-serif text-3xl text-mist-900">Welcome to Savorybase</h2>
              <p className="mt-3 text-sm leading-6 text-mist-600">
                Enter your username and password to open the Savorybase dashboard.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Username</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    disabled={isSubmitting}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-mist-200 bg-[#f5f6f7] px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                    placeholder="chef.manager"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    disabled={isSubmitting}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-mist-200 bg-[#f5f6f7] px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                    placeholder="Enter your password"
                    required
                  />
                </label>

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-mist-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-mist-700 disabled:cursor-not-allowed disabled:bg-mist-400"
                >
                  {isSubmitting ? "Signing in..." : "Login"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
