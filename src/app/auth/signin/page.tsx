'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o password non corretti');
      } else {
        // Redirect after successful login
        router.push('/admin');
      }
    } catch (err) {
      setError('Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/LogoSimboloNome_Bianco(1).png"
            alt="Maskio Barber"
            width={160}
            height={40}
            className="mx-auto mb-4 filter brightness-110"
          />
          <h1 className="text-2xl font-bold text-white">Accedi</h1>
          <p className="text-gray-300">Accedi al tuo account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="la.tua@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </motion.button>
        </form>

        {/* Link to register */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Non hai un account?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Registrati
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
