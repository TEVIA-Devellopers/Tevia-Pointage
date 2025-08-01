import React, { useState, useEffect } from 'react';
import { QrCode, Clock, LogOut, User, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QRScanner from './QRScanner';
import ConfirmationModal from './ConfirmationModal';
import AttendanceLog from './AttendanceLog';

interface AttendanceRecord {
  id: string;
  type: 'entry' | 'exit';
  timestamp: Date;
  location: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'entry' | 'exit'>('entry');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'entry' || qrData.type === 'exit') {
        const record: AttendanceRecord = {
          id: Date.now().toString(),
          type: qrData.type,
          timestamp: new Date(),
          location: qrData.location || 'Bureau principal'
        };

        setAttendanceRecords(prev => [record, ...prev]);
        setConfirmationType(qrData.type);
        setShowScanner(false);
        setShowConfirmation(true);

        // Sauvegarder en localStorage (en production, utiliser une vraie DB)
        const savedRecords = localStorage.getItem('attendance_records');
        const records = savedRecords ? JSON.parse(savedRecords) : [];
        records.unshift(record);
        localStorage.setItem('attendance_records', JSON.stringify(records));
      }
    } catch (error) {
      console.error('Erreur lors du scan QR:', error);
    }
  };

  useEffect(() => {
    // Charger les enregistrements existants
    const savedRecords = localStorage.getItem('attendance_records');
    if (savedRecords) {
      const records = JSON.parse(savedRecords).map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
      setAttendanceRecords(records);
    }
  }, []);

  const todayRecords = attendanceRecords.filter(record => {
    const today = new Date();
    const recordDate = record.timestamp;
    return recordDate.toDateString() === today.toDateString();
  });

  const isCheckedIn = todayRecords.length > 0 && todayRecords[0].type === 'entry';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Pointage QR
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={user?.picture}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Statut actuel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Statut de présence
              </h2>
              <div className="flex items-center gap-2">
                {isCheckedIn ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Présent(e)</span>
                    <span className="text-gray-500 text-sm">
                      depuis {todayRecords[0]?.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="text-gray-600 font-medium">Non pointé(e)</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <QrCode className="w-5 h-5" />
              Scanner QR
            </button>
          </div>
        </div>

        {/* Résumé de la journée */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pointages aujourd'hui</p>
                <p className="text-xl font-semibold text-gray-900">{todayRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Première arrivée</p>
                <p className="text-xl font-semibold text-gray-900">
                  {todayRecords.length > 0 && todayRecords[todayRecords.length - 1].type === 'entry'
                    ? todayRecords[todayRecords.length - 1].timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '--:--'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total cette semaine</p>
                <p className="text-xl font-semibold text-gray-900">
                  {attendanceRecords.filter(record => {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    return record.timestamp >= weekStart;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historique */}
        <AttendanceLog records={attendanceRecords} />
      </div>

      {/* Scanner QR Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Modal de confirmation */}
      {showConfirmation && (
        <ConfirmationModal
          type={confirmationType}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}