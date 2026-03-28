import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import api from '../services/api';

export default function PeerMatchingScreen() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const findMatches = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/peer/match', { subject, grade: 10 });
      if (response.data.success) {
        setMatches(response.data.data);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestSession = async (tutorId: string) => {
    try {
      await api.post('/api/peer/request', { 
        tutorId, 
        subject,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      alert('Session request sent!');
    } catch (error) {
      console.error('Error requesting session:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="What subject do you need help with?"
        onChangeText={setSearch}
        value={search}
        style={styles.searchbar}
      />
      
      <View style={styles.filters}>
        {['Mathematics', 'Science', 'English', 'History'].map((s) => (
          <Chip 
            key={s} 
            selected={subject === s}
            onPress={() => setSubject(s)}
            style={styles.chip}
          >
            {s}
          </Chip>
        ))}
      </View>

      <Button 
        mode="contained" 
        onPress={findMatches}
        loading={loading}
        style={styles.button}
      >
        Find Tutors
      </Button>

      <FlatList
        data={matches}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <Card style={styles.matchCard}>
            <Card.Title
              title={item.name}
              subtitle={`Subjects: ${item.profile?.subjects?.join(', ') || 'N/A'}`}
            />
            <Card.Content>
              <Text>Rating: {item.profile?.rating || 0}/5</Text>
              <Text>Match Score: {item.matchScore || 0}%</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => requestSession(item._id)}>Request Session</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.empty}>No matches found. Try searching!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  searchbar: { marginBottom: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: { margin: 4 },
  button: { marginBottom: 16 },
  matchCard: { marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
