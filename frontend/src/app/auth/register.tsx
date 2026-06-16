import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!hasAgreed) {
      setErrorMsg('You must agree to the Terms & Conditions & Privacy Policy');
      return;
    }

    if (!email || !password || !confirmPassword || !username) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await register(email, password, username);
      // Layout redirects automatically
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#090A0F', '#1A1C29']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Logo size={100} showText={true} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a strong password"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.agreeRow}>
              <TouchableOpacity
                onPress={() => setHasAgreed(!hasAgreed)}
                style={[styles.checkbox, hasAgreed && styles.checkboxChecked]}
              >
                {hasAgreed && <Check size={10} color="#FFF" />}
              </TouchableOpacity>
              <Text style={styles.agreeText}>
                I agree to the{' '}
                <Text onPress={() => setIsTermsOpen(true)} style={styles.termsLink}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text onPress={() => setIsPrivacyOpen(true)} style={styles.termsLink}>
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.buttonContainer, !hasAgreed && { opacity: 0.5 }]}
              onPress={handleRegister}
              disabled={isSubmitting || !hasAgreed}
            >
              <LinearGradient
                colors={['#0072FF', '#FF5733']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Get Started</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginText}>Log In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isTermsOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTermsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setIsTermsOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsTitle}>1. Data Accuracy Disclaimer</Text>
              <Text style={styles.termsBody}>
                All fitness routines, exercises, rep counts, weight recommendations, calorie estimates, and other metrics displayed in AuraStride are provided for tracking and educational purposes only. Please be aware that data shown in the app might be wrong, inaccurate, or outdated. Do not rely solely on AuraStride for health, safety, or fitness advice.
              </Text>

              <Text style={styles.termsTitle}>2. Limitation of Liability</Text>
              <Text style={styles.termsBody}>
                AuraStride, its developers, and affiliates are not responsible or liable for any kind of misbehavior, injury, health issue, accident, or physical damage that may occur during or after performing any physical activities or following any routines featured in the app.
              </Text>

              <Text style={styles.termsTitle}>3. User Responsibility</Text>
              <Text style={styles.termsBody}>
                You assume full responsibility for your physical safety and form. Always consult with a certified healthcare practitioner or professional trainer before embarking on any fitness or exercise program.
              </Text>

              <Text style={styles.termsTitle}>4. Medical Disclaimer</Text>
              <Text style={styles.termsBody}>
                AuraStride is not a medical application and does not provide medical diagnosis, treatment, or professional healthcare advice.
              </Text>

              <Text style={styles.termsTitle}>5. Age Requirement</Text>
              <Text style={styles.termsBody}>
                Users under 18 should use the app under parental or professional supervision.
              </Text>

              <Text style={styles.termsTitle}>6. Exercise Risk Warning</Text>
              <Text style={styles.termsBody}>
                Physical exercise carries an inherent risk of injury. Always perform exercises with proper form. If you experience pain, dizziness, shortness of breath, or discomfort at any time, stop exercising immediately.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setIsTermsOpen(false)} style={styles.agreeBtn}>
              <Text style={styles.agreeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPrivacyOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPrivacyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setIsPrivacyOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsTitle}>1. Data We Collect</Text>
              <Text style={styles.termsBody}>
                We collect personal information such as your email address, username, age, height, weight, BMI, and fitness logs. This data is collected to provide account authentication and customize your workout tracking experience.
              </Text>

              <Text style={styles.termsTitle}>2. Data Usage</Text>
              <Text style={styles.termsBody}>
                All collected data is stored securely and used solely to calculate and display your fitness stats, track workouts, and manage your account. We never sell, share, or rent your personal data to any third parties.
              </Text>

              <Text style={styles.termsTitle}>3. User Rights</Text>
              <Text style={styles.termsBody}>
                You have full control over your data. You may update your profile information at any time in the app settings, or contact us to request permanent deletion of your account and personal records.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setIsPrivacyOpen(false)} style={styles.agreeBtn}>
              <Text style={styles.agreeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 75, 43, 0.15)',
    borderColor: '#FF4B2B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF7b60',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  loginText: {
    color: '#00A3FF',
    fontSize: 14,
    fontWeight: '700',
  },
  termsBtn: {
    alignSelf: 'center',
    marginTop: 20,
  },
  termsBtnText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161824',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  termsTitle: {
    color: '#00A3FF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termsBody: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  agreeBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  agreeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#00A3FF',
    borderColor: '#00A3FF',
  },
  agreeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    flex: 1,
  },
  termsLink: {
    color: '#00A3FF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
