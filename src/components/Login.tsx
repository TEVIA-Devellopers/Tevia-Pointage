import React, { useState } from 'react';
import { Clock, Shield, Users, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pointage QR
          </h1>
          <p className="text-gray-600">
            Système de présence professionnel
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connexion Entreprise
            </h2>
            <p className="text-sm text-gray-600">
              Utilisez votre compte Google professionnel
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 text-blue-600" />
            )}
            {isLoading ? 'Connexion...' : 'Se connecter avec Google'}
          </button>

          {/* Fonctionnalités */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Fonctionnalités
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Connexion sécurisée</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Pointage automatique</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Suivi en temps réel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note de sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Seuls les comptes Google de l'entreprise sont autorisés
          </p>
        </div>
      </div>
    </div>
  );
}