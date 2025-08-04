import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';

type Pointage = {
  id: string;
  date: string;
  heure_entree: string;
  heure_sortie: string;
  statut: string;
};

export default function HomeScreen() {
  const [todayStatus, setTodayStatus] = useState<string>('Jour non scanné');
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPointages();
    checkTodayStatus();
  }, []);

  async function fetchPointages() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('pointage')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) console.error(error);
    else setPointages(data || []);
  }

  async function checkTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('pointage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (data) {
      setTodayStatus(data.statut);
    }
  }

  async function handleScanQR() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      const isInZone = verifyLocation(
        location.coords.latitude,
        location.coords.longitude
      );

      if (!isInZone) {
        throw new Error('Localisation invalide');
      }

      router.push('/scan');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function verifyLocation(lat: number, lon: number): boolean {
    const targetLat = 6.8467473;
    const targetLon = -5.2840243;
    const radius = 0.0002; // ~20 meters in degrees
    
    return (
      Math.abs(lat - targetLat) <= radius && 
      Math.abs(lon - targetLon) <= radius
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Statut: {todayStatus}</Text>
      
      <Button
        title="Scanner QR Code"
        onPress={handleScanQR}
        disabled={loading}
      />

      <Text style={styles.historyTitle}>Historique des pointages:</Text>
      <FlatList
        data={pointages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.pointageItem}>
            <Text>Date: {item.date}</Text>
            <Text>Entrée: {item.heure_entree || '--:--'}</Text>
            <Text>Sortie: {item.heure_sortie || '--:--'}</Text>
            <Text>Statut: {item.statut}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  pointageItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
