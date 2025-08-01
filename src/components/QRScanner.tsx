import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanForQR();
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const scanForQR = () => {
    if (!scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Ici, en production, vous utiliseriez une vraie bibliothèque de scan QR
        // Pour la démo, nous simulons un scan réussi après quelques secondes
        setTimeout(() => {
          if (scanning) {
            // Simulation d'un QR code d'entrée
            const mockQRData = {
              type: Math.random() > 0.5 ? 'entry' : 'exit',
              location: 'Bureau principal',
              timestamp: new Date().toISOString()
            };
            onScan(JSON.stringify(mockQRData));
          }
        }, 2000);
      }
    }
  };

  const handleTestScan = (type: 'entry' | 'exit') => {
    const mockQRData = {
      type,
      location: 'Bureau principal',
      timestamp: new Date().toISOString()
    };
    onScan(JSON.stringify(mockQRData));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Scanner QR Code</h2>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Caméra */}
        <div className="relative w-full h-full">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-white p-8">
              <AlertCircle className="w-16 h-16 mb-4 text-red-400" />
              <p className="text-center mb-6">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay de scan */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-2 border-white border-opacity-50 rounded-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>
                  </div>
                  
                  {/* Animation de scan */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="w-full h-1 bg-blue-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Instructions et boutons de test */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
          <p className="text-white text-center mb-4">
            Positionnez le QR code dans le cadre
          </p>
          
          {/* Boutons de test pour la démonstration */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleTestScan('entry')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Test Entrée
            </button>
            <button
              onClick={() => handleTestScan('exit')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Test Sortie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}