import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SocialScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/api/social/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
      const followingRes = await api.get('/api/social/following');
      if (followingRes.data.success) {
        setFollowing(followingRes.data.data.map((u: any) => u._id));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    try {
      await api.post(`/api/social/follow/${userId}`);
      setFollowing([...following, userId]);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      await api.post(`/api/social/unfollow/${userId}`);
      setFollowing(following.filter(id => id !== userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const renderUser = ({ item }: any) => {
    const isFollowing = following.includes(item._id);
    const isMe = item._id === user?._id;

    return (
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userContent}>
            <Avatar.Text 
              size={50} 
              label={item.name.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: '#3b82f6' }}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userRole}>{item.role}</Text>
              <View style={styles.subjects}>
                {item.profile?.subjects?.slice(0, 3).map((s: string) => (
                  <Chip key={s} compact style={styles.subjectChip}>{s}</Chip>
                ))}
              </View>
            </View>
            {!isMe && (
              <Button
                mode={isFollowing ? 'outlined' : 'contained'}
                onPress={() => isFollowing ? unfollowUser(item._id) : followUser(item._id)}
                compact
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
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
  loader: {
    marginTop: 50,
  },
  list: {
    gap: 12,
  },
  userCard: {
    marginBottom: 12,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  subjectChip: {
    height: 24,
  },
});
