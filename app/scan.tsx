import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  async function handleBarCodeScanned({ data }: { data: string }) {
    setScanned(true);
    
    if (data !== 'Tevia Energie Pass Ok') {
      Alert.alert('Erreur', 'QR Code invalide');
      router.back();
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];
      const { data: { user } } = await supabase.auth.getUser();

      // Check if there's an entry for today
      const { data: existingEntry } = await supabase
        .from('pointage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingEntry) {
        // Update exit time if already has entry
        await supabase
          .from('pointage')
          .update({ 
            heure_sortie: now,
            statut: 'Rentré',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        // Create new entry
        await supabase
          .from('pointage')
          .insert({
            user_id: user.id,
            date: today,
            heure_entree: now,
            statut: 'Présent',
            localisation: { 
              latitude: 6.8467473, 
              longitude: -5.2840243 
            }
          });
      }

      Alert.alert('Succès', 'Pointage enregistré');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', error.message);
      router.back();
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
