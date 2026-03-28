import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Badge, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        api.get('/api/gamification/profile'),
        api.get('/api/sessions/upcoming')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      
      if (sessionsRes.data.success) {
        setUpcomingSessions(sessionsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Avatar.Text 
            size={60} 
            label={user?.name?.substring(0, 2).toUpperCase()} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Ready to learn today?</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="fire" size={24} color="#f97316" />
            <Text style={styles.statValue}>{stats?.streak?.current || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="star" size={24} color="#eab308" />
            <Text style={styles.statValue}>{stats?.level?.current || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="trophy" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{stats?.points?.lifetime || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <View style={styles.actionRow}>
            <Button 
              mode="contained" 
              icon="account-search"
              onPress={() => navigation.navigate('PeerMatching')}
              style={styles.actionButton}
            >
              Find Tutor
            </Button>
            <Button 
              mode="outlined" 
              icon="robot"
              onPress={() => navigation.navigate('AIHomework')}
              style={styles.actionButton}
            >
              AI Help
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Upcoming Sessions */}
      <Card style={styles.sectionCard}>
        <Card.Title 
          title="Upcoming Sessions"
          right={() => <Button onPress={() => navigation.navigate('Sessions')}>View All</Button>}
        />
        <Card.Content>
          {upcomingSessions.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming sessions</Text>
          ) : (
            upcomingSessions.slice(0, 3).map((session: any) => (
              <View key={session._id} style={styles.sessionItem}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionSubject}>{session.subject}</Text>
                  <Text style={styles.sessionTime}>
                    {new Date(session.scheduledFor).toLocaleDateString()} at{' '}
                    {new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Button 
                  mode="contained" 
                  compact
                  onPress={() => navigation.navigate('SessionRoom', { sessionId: session._id })}
                >
                  Join
                </Button>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Badges */}
      {stats?.badges?.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Recent Badges"
            right={() => <Button onPress={() => navigation.navigate('Main', { screen: 'Settings' })}>View All</Button>}
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {stats.badges.slice(0, 5).map((badge: any) => (
                <View key={badge.badge} style={styles.badgeItem}>
                  <Avatar.Icon 
                    size={50} 
                    icon={badge.icon || 'medal'} 
                    style={{ backgroundColor: badge.color || '#3b82f6' }}
                  />
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 60,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'white',
    marginRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  badgeName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
