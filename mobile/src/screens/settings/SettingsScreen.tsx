import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Avatar, Divider, List } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import i18n, { LANGUAGES, changeLanguage, getCurrentLanguage } from '../../i18n';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fixed: removed redundant '/api' prefix — axios baseURL already includes it
      const response = await api.get('/gamification/profile');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLanguageChange = async (code: string) => {
    await changeLanguage(code);
    setCurrentLang(code);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Title title={i18n.t('settings.your_progress')} />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.level?.current || 1}</Text>
              <Text style={styles.statLabel}>{i18n.t('settings.level')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.points?.lifetime || 0}</Text>
              <Text style={styles.statLabel}>{i18n.t('settings.points')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.streak?.current || 0}</Text>
              <Text style={styles.statLabel}>{i18n.t('settings.streak')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Language Selection */}
      <Card style={styles.langCard}>
        <Card.Title title={i18n.t('settings.language')} />
        <Card.Content>
          <Text style={styles.langHint}>{i18n.t('settings.choose_language')}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                style={[styles.langBtn, currentLang === lang.code && styles.langBtnActive]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, currentLang === lang.code && styles.langLabelActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <List.Section>
          <List.Item
            title={i18n.t('settings.my_badges')}
            description={i18n.t('settings.badges_earned', { count: stats?.badges?.length || 0 })}
            left={props => <List.Icon {...props} icon="medal" />}
            onPress={() => navigation.navigate('Profile')}
          />
          <Divider />
          <List.Item
            title={i18n.t('settings.ai_study_planner')}
            description={i18n.t('settings.plan_schedule')}
            left={props => <List.Icon {...props} icon="calendar-check" />}
            onPress={() => navigation.navigate('StudyPlanner')}
          />
          <Divider />
          <List.Item
            title={i18n.t('settings.voice_tutor')}
            description={i18n.t('settings.learn_voice')}
            left={props => <List.Icon {...props} icon="microphone" />}
            onPress={() => navigation.navigate('VoiceTutor')}
          />
          <Divider />
          <List.Item
            title={i18n.t('settings.edit_profile')}
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title={i18n.t('settings.notifications')}
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        {i18n.t('settings.sign_out')}
      </Button>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textTransform: 'capitalize',
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
  langCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  langHint: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  langBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  langFlag: {
    fontSize: 20,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  langLabelActive: {
    color: '#3b82f6',
  },
  menuCard: {
    margin: 16,
    marginTop: 0,
  },
  logoutButton: {
    margin: 16,
    borderColor: '#ef4444',
  },
});
