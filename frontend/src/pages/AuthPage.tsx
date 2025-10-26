import React from 'react';
import { useAuth } from '../store/auth';

export default function AuthPage(): JSX.Element {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [error, setError] = React.useState<string | null>(null);

  async function handleEmailAuth() {
    try {
      setError(null);
      if (mode === 'signin') await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (e: any) {
      setError(e.message ?? 'Auth failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
      <button onClick={signInWithGoogle} className="w-full px-3 py-2 rounded bg-red-600 text-white">Continue with Google</button>
      <div className="text-center text-sm text-gray-500">or</div>
      <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button onClick={handleEmailAuth} className="w-full px-3 py-2 rounded bg-blue-600 text-white">{mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
      <div className="text-sm text-center">
        {mode === 'signin' ? (
          <button className="underline" onClick={() => setMode('signup')}>Need an account? Sign up</button>
        ) : (
          <button className="underline" onClick={() => setMode('signin')}>Have an account? Sign in</button>
        )}
      </div>
    </div>
  );
}


