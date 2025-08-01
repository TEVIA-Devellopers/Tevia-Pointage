import React, { useEffect, useState } from 'react';
import { CheckCircle, LogOut, Clock } from 'lucide-react';

interface ConfirmationModalProps {
  type: 'entry' | 'exit';
  onClose: () => void;
}

export default function ConfirmationModal({ type, onClose }: ConfirmationModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Son de confirmation (optionnel)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBT2X2+PJdihUhgA5...');
    audio.volume = 0.3;
    audio.play().catch(() => {});

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isEntry = type === 'entry';
  const icon = isEntry ? CheckCircle : LogOut;
  const IconComponent = icon;
  const bgColor = isEntry ? 'bg-green-600' : 'bg-blue-600';
  const message = isEntry ? 'Vous êtes bien arrivé(e)' : 'Vous êtes bien sorti(e)';
  const subtitle = isEntry ? 'Bonne journée de travail !' : 'À bientôt !';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-3xl p-8 max-w-sm mx-4 text-center transform transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Animation de succès */}
        <div className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}>
          <IconComponent className="w-10 h-10 text-white" />
        </div>

        {/* Message principal */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {message}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {subtitle}
        </p>

        {/* Heure */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-lg font-mono font-semibold text-gray-900">
            {new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>

        {/* Indicateur de fermeture automatique */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}