import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Pointage = {
  id: string;
  date: string;
  heure_entree: string;
  heure_sortie: string;
  statut: string;
  duree_travail: string;
};

export default function PointageListScreen() {
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');

  useEffect(() => {
    fetchPointages();
  }, [filter]);

  async function fetchPointages() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('pointage')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (filter === 'pending') {
        query = query.neq('statut', 'Validé');
      } else if (filter === 'validated') {
        query = query.eq('statut', 'Validé');
      }

      const { data, error } = await query;

      if (error) throw error;
      setPointages(data || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  function renderFilterButtons() {
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text>En attente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'validated' && styles.activeFilter]}
          onPress={() => setFilter('validated')}
        >
          <Text>Validés</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterButtons()}

      <FlatList
        data={pointages}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchPointages}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.pointageItem}
            onPress={() => router.push(`/pointage/${item.id}`)}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={getStatusStyle(item.statut)}>{item.statut}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text>Entrée: {item.heure_entree || '--:--'}</Text>
              <Text>Sortie: {item.heure_sortie || '--:--'}</Text>
              <Text>Durée: {item.duree_travail || '--:--'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun pointage trouvé</Text>
        }
      />
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
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeFilter: {
    backgroundColor: '#e0e0e0',
  },
  pointageItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dateText: {
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
