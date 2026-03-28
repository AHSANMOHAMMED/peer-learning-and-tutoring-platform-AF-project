import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import api from '../services/api';

export default function VoiceTutorScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState('');
  const [subject, setSubject] = useState('');

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];

  const startVoiceSession = async () => {
    if (!subject) return;
    
    setIsListening(true);
    // Simulate voice recognition - in production use expo-speech-recognition
    setTimeout(() => {
      setIsListening(false);
      processVoiceInput('Explain quadratic equations');
    }, 3000);
  };

  const processVoiceInput = async (input: string) => {
    setIsSpeaking(true);
    try {
      const res = await api.post('/api/ai-homework/start', {
        subject,
        grade: 10
      });

      if (res.data.success) {
        const messageRes = await api.post(`/api/ai-homework/${res.data.data.sessionId}/message`, {
          message: input
        });

        if (messageRes.data.success) {
          const aiResponse = messageRes.data.data.response;
          setResponse(aiResponse);
          
          // Speak the response
          Speech.speak(aiResponse, {
            language: 'en',
            onDone: () => setIsSpeaking(false),
          });
        }
      }
    } catch (error) {
      console.error('Error processing voice:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Tutor</Text>
      <Text style={styles.subtitle}>Learn hands-free with voice</Text>

      {!subject ? (
        <Card style={styles.selectionCard}>
          <Card.Content>
            <Text style={styles.selectionTitle}>Select a subject</Text>
            <View style={styles.subjectsContainer}>
              {subjects.map((s) => (
                <Chip
                  key={s}
                  onPress={() => setSubject(s)}
                  style={styles.subjectChip}
                >
                  {s}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      ) : (
        <>
          <View style={styles.voiceContainer}>
            <MaterialCommunityIcons 
              name={isListening ? "microphone" : "microphone-outline"} 
              size={80} 
              color={isListening ? "#ef4444" : "#3b82f6"} 
            />
            <Text style={styles.voiceStatus}>
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to speak'}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={isSpeaking ? stopSpeaking : startVoiceSession}
            style={styles.actionButton}
            icon={isSpeaking ? "stop" : "microphone"}
          >
            {isSpeaking ? 'Stop' : 'Start Voice Session'}
          </Button>

          {response && (
            <Card style={styles.responseCard}>
              <Card.Content>
                <Text style={styles.responseTitle}>Response:</Text>
                <Text style={styles.responseText}>{response}</Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="outlined"
            onPress={() => {
              setSubject('');
              setResponse('');
              Speech.stop();
            }}
            style={styles.changeSubjectButton}
          >
            Change Subject
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 24,
  },
  selectionCard: {
    width: '100%',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
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
  voiceContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  voiceStatus: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
  actionButton: {
    width: '100%',
    marginBottom: 20,
  },
  responseCard: {
    width: '100%',
    marginBottom: 16,
    maxHeight: 200,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  changeSubjectButton: {
    width: '100%',
  },
});
