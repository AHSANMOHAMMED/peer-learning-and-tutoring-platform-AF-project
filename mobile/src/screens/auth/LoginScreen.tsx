import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Button, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Background from '../../components/common/Background';
import i18n, { LANGUAGES, changeLanguage, getCurrentLanguage } from '../../i18n';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  
  const { login, sendOTP, verifyOTP } = useAuthStore();

  const handleLanguageChange = async (code: string) => {
    await changeLanguage(code);
    setCurrentLang(code);
  };

  const handleLogin = async () => {
    if (!email || (isOtpMode ? !otp : !password)) {
      setError(i18n.t('auth.fill_all_fields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isOtpMode) {
        await verifyOTP(email, otp);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || i18n.t('auth.auth_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError(i18n.t('auth.enter_email_first'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP(email);
      setOtpSent(true);
    } catch (err: any) {
      setError(i18n.t('auth.otp_send_failed'));
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
        {/* Language Switcher */}
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              style={[styles.langBtn, currentLang === lang.code && styles.langBtnActive]}
            >
              <Text style={[styles.langFlag]}>{lang.flag}</Text>
              <Text style={[styles.langLabel, currentLang === lang.code && styles.langLabelActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.logoText}>{i18n.t('auth.app_name')}</Text>
          <Text style={styles.tagline}>{i18n.t('auth.tagline')}</Text>
        </View>

        <Surface style={styles.card} elevation={5}>
          <View style={styles.cardHeader}>
             <Text style={styles.cardTitle}>{isOtpMode ? i18n.t('auth.otp_title') : i18n.t('auth.login_title')}</Text>
             <Text style={styles.cardSubtitle}>
               {isOtpMode ? i18n.t('auth.otp_subtitle') : i18n.t('auth.login_subtitle')}
             </Text>
          </View>

          {error ? (
            <Surface style={styles.errorBanner} elevation={0}>
              <Text style={styles.errorText}>{error}</Text>
            </Surface>
          ) : null}

          <TextInput
            label={i18n.t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="flat"
            left={<TextInput.Icon icon="email-outline" />}
            theme={{ colors: { primary: '#6366f1' }}}
          />

          {!isOtpMode ? (
            <TextInput
              label={i18n.t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              right={
                <TextInput.Icon
                  icon={secureText ? 'eye-off' : 'eye'}
                  onPress={() => setSecureText(!secureText)}
                />
              }
              left={<TextInput.Icon icon="lock-outline" />}
              style={styles.input}
              mode="flat"
              theme={{ colors: { primary: '#6366f1' }}}
            />
          ) : otpSent && (
            <TextInput
              label={i18n.t('auth.verification_code')}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              mode="flat"
              left={<TextInput.Icon icon="shield-check-outline" />}
              theme={{ colors: { primary: '#6366f1' }}}
            />
          )}

          {isOtpMode && !otpSent ? (
             <Button
                mode="contained"
                onPress={handleSendOTP}
                loading={loading}
                style={styles.mainButton}
                contentStyle={styles.mainButtonContent}
                labelStyle={styles.mainButtonLabel}
              >
                {i18n.t('auth.send_access_code')}
              </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.mainButton}
              contentStyle={styles.mainButtonContent}
              labelStyle={styles.mainButtonLabel}
            >
              {isOtpMode ? i18n.t('auth.verify_enter') : i18n.t('auth.sign_in')}
            </Button>
          )}

          <View style={styles.divider}>
             <View style={styles.dividerLine} />
             <Text style={styles.dividerText}>{i18n.t('general.or')}</Text>
             <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => {
              setIsOtpMode(!isOtpMode);
              setOtpSent(false);
              setError('');
            }}
            style={styles.modeToggle}
          >
            <Text style={styles.modeToggleText}>
              {isOtpMode ? i18n.t('auth.use_password') : i18n.t('auth.use_otp')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>{i18n.t('auth.no_account')} <Text style={styles.footerLinkBold}>{i18n.t('auth.join_now')}</Text></Text>
          </TouchableOpacity>
        </Surface>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
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
    marginBottom: 40,
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
    marginBottom: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
  },
  modeToggle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modeToggleText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
  },
  footerLink: {
    alignItems: 'center',
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
});
