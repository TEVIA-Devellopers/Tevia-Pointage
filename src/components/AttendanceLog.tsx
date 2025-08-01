import React from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  type: 'entry' | 'exit';
  timestamp: Date;
  location: string;
}

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

export default function AttendanceLog({ records }: AttendanceLogProps) {
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.timestamp.toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Historique des pointages
        </h2>
      </div>

      {Object.keys(groupedRecords).length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun pointage enregistré</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, 7) // Afficher seulement les 7 derniers jours
            .map(([date, dayRecords]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                <div className="space-y-2">
                  {dayRecords
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.type === 'entry' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {record.type === 'entry' ? (
                              <LogIn className="w-4 h-4" />
                            ) : (
                              <LogOut className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.type === 'entry' ? 'Arrivée' : 'Départ'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {record.location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono font-semibold text-gray-900">
                            {record.timestamp.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.timestamp.toLocaleTimeString('fr-FR', {
                              second: '2-digit'
                            }).split(':')[2]}s
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}