import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Avatar, Chip, Button } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfileScreen({ route }: any) {
  const { userId } = route.params || {};
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || currentUser?._id;

  useEffect(() => {
    loadProfile();
  }, [targetUserId]);

  const loadProfile = async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        api.get(`/api/social/profile/${targetUserId}`),
        api.get(`/api/gamification/profile`)
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (badgesRes.data.success) {
        setBadges(badgesRes.data.data.badges || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMyProfile = targetUserId === currentUser?._id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={100} 
          label={profile?.name?.substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.role}>{profile?.role}</Text>
        
        {profile?.profile?.subjects && (
          <View style={styles.subjects}>
            {profile.profile.subjects.map((s: string) => (
              <Chip key={s} style={styles.subjectChip}>{s}</Chip>
            ))}
          </View>
        )}

        {!isMyProfile && (
          <Button mode="contained" style={styles.followButton}>
            Follow
          </Button>
        )}
      </View>

      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.stats?.sessions || 0}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.stats?.hours || 0}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.profile?.rating || 0}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.badgesCard}>
        <Card.Title title="Badges" />
        <Card.Content>
          {badges.length === 0 ? (
            <Text style={styles.emptyText}>No badges earned yet</Text>
          ) : (
            <FlatList
              horizontal
              data={badges}
              keyExtractor={(item: any) => item._id}
              renderItem={({ item }: any) => (
                <View style={styles.badgeItem}>
                  <Avatar.Icon 
                    size={60} 
                    icon={item.icon || 'trophy'} 
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  <Text style={styles.badgeName}>{item.name}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Title title="About" />
        <Card.Content>
          <Text style={styles.bio}>{profile?.profile?.bio || 'No bio available'}</Text>
          <Text style={styles.grade}>Grade: {profile?.profile?.grade || 'N/A'}</Text>
          <Text style={styles.school}>School: {profile?.profile?.school || 'N/A'}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  role: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  subjectChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  followButton: {
    marginTop: 16,
  },
  statsCard: {
    margin: 16,
    marginTop: -20,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badgesCard: {
    margin: 16,
    marginTop: 0,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  badgeName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  grade: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  school: {
    fontSize: 14,
    color: '#6b7280',
  },
});
