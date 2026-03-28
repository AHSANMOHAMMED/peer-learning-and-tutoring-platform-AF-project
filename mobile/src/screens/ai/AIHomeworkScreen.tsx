import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIHomeworkScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'ICT'];

  const startSession = async (selectedSubject: string) => {
    setSubject(selectedSubject);
    setLoading(true);
    try {
      const response = await api.post('/api/ai-homework/start', {
        subject: selectedSubject,
        grade: 10
      });
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        setMessages([{
          _id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your AI homework assistant for ${selectedSubject}. What would you like help with?`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      _id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post(`/api/ai-homework/${sessionId}/message`, {
        message: input
      });

      if (response.data.success) {
        const aiMessage: Message = {
          _id: response.data.data.messageId,
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select a Subject</Text>
        <View style={styles.subjectGrid}>
          {subjects.map((s) => (
            <Chip
              key={s}
              onPress={() => startSession(s)}
              style={styles.subjectChip}
              icon="book"
            >
              {s}
            </Chip>
          ))}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot" size={24} color="#3b82f6" />
        <Text style={styles.headerText}>{subject} Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.role === 'user' ? styles.userMessage : styles.aiMessage
          ]}>
            <Card style={{
              maxWidth: '80%',
              backgroundColor: item.role === 'user' ? '#3b82f6' : 'white'
            }}>
              <Card.Content>
                <Text style={item.role === 'user' ? styles.userText : styles.aiText}>
                  {item.content}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask your question..."
          style={styles.input}
          mode="outlined"
          multiline
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          loading={loading}
          disabled={loading || !input.trim()}
          style={styles.sendButton}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  subjectChip: {
    margin: 8,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
  },
  userCard: {
    backgroundColor: '#3b82f6',
  },
  aiCard: {
    backgroundColor: 'white',
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#1f2937',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 8,
  },
});
