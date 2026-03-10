import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      const response = await api.get(`/api/marketplace/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const enroll = async () => {
    setEnrolling(true);
    try {
      const response = await api.post(`/api/marketplace/courses/${courseId}/purchase`);
      if (response.data.success) {
        alert('Successfully enrolled!');
        navigation.goBack();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.center}>
        <Text>Course not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card.Cover source={{ uri: course.coverImage || 'https://via.placeholder.com/400' }} />
      
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.tutor}>by {course.tutor?.name}</Text>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="star" size={20} color="#eab308" />
              <Text>{course.stats?.averageRating || 0}/5</Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="account-group" size={20} color="#6b7280" />
              <Text>{course.stats?.totalEnrollments || 0} students</Text>
            </View>
          </View>

          <View style={styles.tags}>
            <Chip>{course.subject}</Chip>
            <Chip>Grade {course.grade}</Chip>
            <Chip>{course.level}</Chip>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{course.description}</Text>

          <Text style={styles.sectionTitle}>What you'll learn</Text>
          {course.learningOutcomes?.map((outcome: string, index: number) => (
            <View key={index} style={styles.outcome}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
              <Text style={styles.outcomeText}>{outcome}</Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.priceSection}>
            <Text style={styles.price}>LKR {course.price}</Text>
            <Button 
              mode="contained" 
              onPress={enroll}
              loading={enrolling}
              style={styles.enrollButton}
            >
              Enroll Now
            </Button>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    margin: 16,
    marginTop: -40,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tutor: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  outcome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  outcomeText: {
    fontSize: 15,
    color: '#374151',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  enrollButton: {
    paddingHorizontal: 24,
  },
});
