import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Surface, ActivityIndicator, Menu, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Background from '../../components/common/Background';
import i18n, { LANGUAGES, changeLanguage, getCurrentLanguage } from '../../i18n';

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    grade: ''
  });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  
  const { register, sendOTP, verifyOTP } = useAuthStore();

  const handleLanguageChange = async (code: string) => {
    await changeLanguage(code);
    setCurrentLang(code);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return i18n.t('auth.student');
      case 'tutor': return i18n.t('auth.tutor');
      case 'parent': return i18n.t('auth.parent');
      default: return role;
    }
  };

  const handleNextStep = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError(i18n.t('auth.required_fields'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(i18n.t('auth.passwords_mismatch'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const receivedOtp = await sendOTP(formData.email);
      if (receivedOtp) setDevOtp(receivedOtp);
      setStep(2);
    } catch (err: any) {
      setError(i18n.t('auth.verification_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!otp) {
      setError(i18n.t('auth.enter_verification'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userData = {
        ...formData,
        profile: {
          grade: formData.grade ? parseInt(formData.grade) : undefined
        }
      };
      
      await register(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || i18n.t('auth.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Language Switcher */}
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

          <View style={styles.header}>
            <IconButton 
              icon="arrow-left" 
              iconColor="white" 
              size={24} 
              onPress={() => step === 1 ? navigation.goBack() : setStep(1)} 
              style={styles.backButton}
            />
            <Text style={styles.logoText}>{i18n.t('auth.app_name')}</Text>
            <Text style={styles.tagline}>{i18n.t('auth.tagline_register')}</Text>
          </View>

          <Surface style={styles.card} elevation={5}>
            <View style={styles.cardHeader}>
               <Text style={styles.cardTitle}>{step === 1 ? i18n.t('auth.register_title') : i18n.t('auth.verify_title')}</Text>
               <Text style={styles.cardSubtitle}>
                 {step === 1 ? i18n.t('auth.register_subtitle') : `${i18n.t('auth.verify_subtitle_prefix')} ${formData.email}`}
               </Text>
            </View>

            {error ? (
               <Surface style={styles.errorBanner} elevation={0}>
                  <Text style={styles.errorText}>{error}</Text>
               </Surface>
            ) : null}

            {step === 1 ? (
              <>
                <TextInput
                  label={i18n.t('auth.full_name')}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.input}
                  mode="flat"
                  left={<TextInput.Icon icon="account-outline" />}
                  theme={{ colors: { primary: '#6366f1' }}}
                />

                <TextInput
                  label={i18n.t('auth.email')}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  mode="flat"
                  left={<TextInput.Icon icon="email-outline" />}
                  theme={{ colors: { primary: '#6366f1' }}}
                />

                <Menu
                  visible={roleMenuVisible}
                  onDismiss={() => setRoleMenuVisible(false)}
                  anchor={
                    <TextInput
                      label={i18n.t('auth.your_role')}
                      value={getRoleDisplayName(formData.role)}
                      style={styles.input}
                      mode="flat"
                      editable={false}
                      left={<TextInput.Icon icon="school-outline" />}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setRoleMenuVisible(true)} />}
                      theme={{ colors: { primary: '#6366f1' }}}
                    />
                  }
                >
                  <Menu.Item onPress={() => { setFormData({ ...formData, role: 'student' }); setRoleMenuVisible(false); }} title={i18n.t('auth.student')} />
                  <Menu.Item onPress={() => { setFormData({ ...formData, role: 'tutor' }); setRoleMenuVisible(false); }} title={i18n.t('auth.tutor')} />
                  <Menu.Item onPress={() => { setFormData({ ...formData, role: 'parent' }); setRoleMenuVisible(false); }} title={i18n.t('auth.parent')} />
                </Menu>

                {formData.role === 'student' && (
                  <TextInput
                    label={i18n.t('auth.grade_level')}
                    value={formData.grade}
                    onChangeText={(text) => setFormData({ ...formData, grade: text })}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.input}
                    mode="flat"
                    left={<TextInput.Icon icon="star-face" />}
                    theme={{ colors: { primary: '#6366f1' }}}
                  />
                )}

                <TextInput
                  label={i18n.t('auth.password')}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={secureText}
                  right={<TextInput.Icon icon={secureText ? 'eye-off' : 'eye'} onPress={() => setSecureText(!secureText)} />}
                  left={<TextInput.Icon icon="lock-outline" />}
                  style={styles.input}
                  mode="flat"
                  theme={{ colors: { primary: '#6366f1' }}}
                />

                <TextInput
                  label={i18n.t('auth.confirm_password')}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={secureText}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                  style={styles.input}
                  mode="flat"
                  theme={{ colors: { primary: '#6366f1' }}}
                />

                <Button
                  mode="contained"
                  onPress={handleNextStep}
                  loading={loading}
                  style={styles.mainButton}
                  contentStyle={styles.mainButtonContent}
                  labelStyle={styles.mainButtonLabel}
                >
                  {i18n.t('auth.continue_verification')}
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  label={i18n.t('auth.six_digit_code')}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                  mode="flat"
                  left={<TextInput.Icon icon="shield-lock-outline" />}
                  autoFocus
                  theme={{ colors: { primary: '#6366f1' }}}
                />

                {devOtp && (
                  <Surface style={styles.devOtpHint} elevation={0}>
                    <Text style={styles.devOtpTitle}>{i18n.t('auth.dev_otp')}</Text>
                    <Text style={styles.devOtpCode}>{devOtp}</Text>
                  </Surface>
                )}

                <Button
                  mode="contained"
                  onPress={handleFinalize}
                  loading={loading}
                  style={styles.mainButton}
                  contentStyle={styles.mainButtonContent}
                  labelStyle={styles.mainButtonLabel}
                >
                  {i18n.t('auth.verify_create')}
                </Button>

                <TouchableOpacity 
                   onPress={() => sendOTP(formData.email)}
                   style={styles.resendLink}
                 >
                  <Text style={styles.resendText}>{i18n.t('auth.didnt_get_code')} <Text style={styles.footerLinkBold}>{i18n.t('auth.resend')}</Text></Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>{i18n.t('auth.have_account')} <Text style={styles.footerLinkBold}>{i18n.t('auth.sign_in_link')}</Text></Text>
            </TouchableOpacity>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  langBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  langFlag: {
    fontSize: 16,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  langLabelActive: {
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -10,
    top: -10,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  card: {
    padding: 32,
    borderRadius: 32,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 16,
    fontSize: 15,
  },
  mainButton: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    elevation: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonContent: {
    paddingVertical: 12,
  },
  mainButtonLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 32,
    padding: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  footerLinkBold: {
    color: '#1e1b4b',
    fontWeight: '800',
  },
  devOtpHint: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  devOtpTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: 1,
    marginBottom: 4,
  },
  devOtpCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e40af',
    letterSpacing: 6,
  },
});
