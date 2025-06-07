'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante la registrazione');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-900/30 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registrazione completata!</h2>
          <p className="text-gray-300 mb-4">Ti reindirizzeremo alla pagina di login...</p>
        </motion.div>
      </div>
    );
  }
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
            src="/logo.jpg"
            alt="Maskio Barber"
            width={80}
            height={80}
            className="mx-auto rounded-full mb-4 border-2 border-gray-600"
          />
          <h1 className="text-2xl font-bold text-white">Registrati</h1>
          <p className="text-gray-300">Crea il tuo account</p>
        </div>        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="Mario Rossi"
            />
          </div>

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
              placeholder="mario@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Telefono
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="+39 123 456 7890"
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
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Conferma Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </motion.button>
        </form>

        {/* Link to login */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Hai già un account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Accedi
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
