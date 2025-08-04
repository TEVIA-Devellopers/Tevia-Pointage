import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

type PointageDetails = {
  id: string;
  date: string;
  heure_entree: string;
  heure_sortie: string;
  statut: string;
  commentaire: string;
  duree_travail: string;
  validated_by: string | null;
};

export default function PointageDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [pointage, setPointage] = useState<PointageDetails | null>(null);
  const [comment, setComment] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPointage();
    checkUserRole();
  }, [id]);

  async function fetchPointage() {
    const { data, error } = await supabase
      .from('pointage')
      .select(`
        id,
        date,
        heure_entree,
        heure_sortie,
        statut,
        commentaire,
        duree_travail,
        validated_by:profiles(username)
      `)
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      router.back();
      return;
    }

    setPointage(data);
    setComment(data.commentaire || '');
  }

  async function checkUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!error && data?.role === 'manager') {
      setIsManager(true);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pointage')
        .update({ 
          commentaire: comment,
          statut: 'Modifié'
        })
        .eq('id', id);

      if (error) throw error;
      Alert.alert('Success', 'Pointage mis à jour');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('pointage')
        .update({ 
          statut: 'Validé',
          validated_by: user.id,
          validation_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      Alert.alert('Success', 'Pointage validé');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!pointage) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du pointage</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Date:</Text>
        <Text>{pointage.date}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Heure d'entrée:</Text>
        <Text>{pointage.heure_entree || '--:--'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Heure de sortie:</Text>
        <Text>{pointage.heure_sortie || '--:--'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Durée:</Text>
        <Text>{pointage.duree_travail || '--:--'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Statut:</Text>
        <Text style={getStatusStyle(pointage.statut)}>{pointage.statut}</Text>
      </View>

      <Text style={styles.label}>Commentaire:</Text>
      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="Ajouter un commentaire..."
        multiline
      />

      <Button
        title="Enregistrer"
        onPress={handleSave}
        disabled={loading}
      />

      {isManager && pointage.statut !== 'Validé' && (
        <Button
          title="Valider"
          onPress={handleValidate}
          disabled={loading}
          color="green"
        />
      )}
    </View>
  );
}

function getStatusStyle(status: string) {
  switch(status) {
    case 'Validé':
      return { color: 'green', fontWeight: 'bold' };
    case 'En attente':
      return { color: 'orange', fontWeight: 'bold' };
    case 'Modifié':
      return { color: 'blue', fontWeight: 'bold' };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
  },
});
