import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function StudyPlannerScreen() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'ICT'];

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/personalization/learning-path', {
        subject,
        targetLevel: 'intermediate'
      });
      if (response.data.success) {
        setPlan(response.data.data);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStage = ({ item, index }: any) => (
    <Card style={styles.stageCard}>
      <Card.Content>
        <View style={styles.stageHeader}>
          <View style={styles.stageNumber}>
            <Text style={styles.stageNumberText}>{index + 1}</Text>
          </View>
          <View>
            <Text style={styles.stageName}>{item.name}</Text>
            <Text style={styles.stageDuration}>{item.duration}</Text>
          </View>
        </View>
        
        <Text style={styles.topicsTitle}>Topics:</Text>
        {item.topics.map((topic: string, i: number) => (
          <View key={i} style={styles.topic}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color="#3b82f6" />
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}

        <Text style={styles.assessmentsTitle}>Assessments:</Text>
        {item.assessments.map((a: string, i: number) => (
          <Chip key={i} style={styles.assessmentChip} compact>{a}</Chip>
        ))}
      </Card.Content>
    </Card>
  );

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AI Study Planner</Text>
        <Text style={styles.subtitle}>Generate a personalized learning path</Text>
        
        <View style={styles.subjectsContainer}>
          {subjects.map((s) => (
            <Chip
              key={s}
              selected={subject === s}
              onPress={() => setSubject(s)}
              style={styles.subjectChip}
            >
              {s}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={generatePlan}
          loading={loading}
          disabled={!subject || loading}
          style={styles.generateButton}
        >
          Generate Study Plan
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-check" size={32} color="#3b82f6" />
        <Text style={styles.planTitle}>{plan.subject} Learning Path</Text>
        <Text style={styles.planDuration}>Total: {plan.totalDuration}</Text>
      </View>

      <FlatList
        data={plan.stages}
        renderItem={renderStage}
        keyExtractor={(item: any, index: number) => index.toString()}
        contentContainerStyle={styles.stagesList}
      />

      <Button mode="outlined" onPress={() => setPlan(null)} style={styles.newPlanButton}>
        Create New Plan
      </Button>
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
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  subjectChip: {
    margin: 4,
  },
  generateButton: {
    marginTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  planDuration: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  stagesList: {
    gap: 12,
  },
  stageCard: {
    marginBottom: 12,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  stageDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 14,
    color: '#374151',
  },
  assessmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  assessmentChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  newPlanButton: {
    marginTop: 16,
  },
});
