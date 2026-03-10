import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import api from '../services/api';

export default function CoursesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/api/marketplace/featured');
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/marketplace/search?q=${search}`);
      if (response.data.success) {
        setCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourse = ({ item }: any) => (
    <Card style={styles.courseCard} onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
      <Card.Cover source={{ uri: item.coverImage || 'https://via.placeholder.com/300x150' }} />
      <Card.Title
        title={item.title}
        subtitle={item.tutor?.name}
      />
      <Card.Content>
        <Text numberOfLines={2}>{item.description}</Text>
        <View style={styles.tags}>
          <Chip compact>{item.subject}</Chip>
          <Chip compact>Grade {item.grade}</Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Text style={styles.price}>LKR {item.price}</Text>
        <Button>View</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search courses..."
        onChangeText={setSearch}
        value={search}
        onSubmitEditing={searchCourses}
        style={styles.searchbar}
      />
      
      <View style={styles.filters}>
        {['all', 'Mathematics', 'Science', 'English'].map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
          >
            {f === 'all' ? 'All' : f}
          </Chip>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={filter === 'all' ? courses : courses.filter((c: any) => c.subject === filter)}
          renderItem={renderCourse}
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
  searchbar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  list: {
    paddingBottom: 20,
  },
  courseCard: {
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
});
