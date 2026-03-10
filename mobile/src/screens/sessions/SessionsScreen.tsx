import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Avatar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SessionsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/api/sessions/my-sessions');
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSession = ({ item }: any) => {
    const isTutor = item.tutor?._id === user?._id;
    const otherUser = isTutor ? item.student : item.tutor;

    return (
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.time}>
                {new Date(item.scheduledFor).toLocaleDateString()} at{' '}
                {new Date(item.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Chip style={styles.statusChip}>{item.status}</Chip>
          </View>
          
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={40} 
              label={otherUser?.name?.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: '#8b5cf6' }}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherUser?.name}</Text>
              <Text style={styles.userRole}>{isTutor ? 'Student' : 'Tutor'}</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          {item.status === 'accepted' && (
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('SessionRoom', { sessionId: item._id })}
            >
              Join
            </Button>
          )}
          {item.status === 'requested' && !isTutor && (
            <Button onPress={() => acceptSession(item._id)}>Accept</Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const acceptSession = async (sessionId: string) => {
    try {
      await api.post(`/api/peer/sessions/${sessionId}/accept`);
      loadSessions();
    } catch (error) {
      console.error('Error accepting session:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('PeerMatching')}
        style={styles.newButton}
      >
        Find New Tutor
      </Button>
      
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newButton: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 50,
  },
  list: {
    gap: 12,
  },
  sessionCard: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
  },
});
