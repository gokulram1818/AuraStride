import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ChevronRight,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  CreditCard,
  Globe,
  Star,
  Edit2,
  X
} from 'lucide-react-native';

export default function MoreScreen() {
  const { user, logout, updateProfile, theme, setTheme } = useAuth();

  // Modal toggle
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleThemeChange = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred visual theme:',
      [
        { text: 'Dark Mode (Neon Gradient)', onPress: () => setTheme('Dark Mode') },
        { text: 'AMOLED Pure Black', onPress: () => setTheme('AMOLED Black') },
        { text: 'Light Theme', onPress: () => setTheme('Light Theme') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const isLight = theme === 'Light Theme';
  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (theme === 'AMOLED Black' ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRow: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    menuBg: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.02)',
    iconColor: isLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    chevronColor: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.2)',

    // Modal specific styling
    inputBg: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
    inputBorder: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)',
    formLabel: isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    unitToggleBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
    unitToggleBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    unitToggleBtnActive: isLight ? 'rgba(0, 163, 255, 0.12)' : 'rgba(0, 163, 255, 0.15)',
    badgeBg: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
    badgeText: isLight ? '#1C1C1E' : '#FFF',
    planDescText: isLight ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.6)',
  };

  // Edit fields
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editHeightUnit, setEditHeightUnit] = useState<'cm' | 'inches'>(user?.heightUnit || 'cm');
  const [editWeightUnit, setEditWeightUnit] = useState<'kg' | 'lbs'>(user?.weightUnit || 'kg');
  const [editAge, setEditAge] = useState(user?.age?.toString() || '');
  const [editHeight, setEditHeight] = useState(user?.height?.toString() || '');
  const [editWeight, setEditWeight] = useState(user?.weight?.toString() || '');
  const [editTargetWeight, setEditTargetWeight] = useState(user?.targetWeight?.toString() || '');
  const [editTimeline, setEditTimeline] = useState(user?.targetTimelineWeeks?.toString() || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHeightUnitChange = (newUnit: 'cm' | 'inches') => {
    if (newUnit === editHeightUnit) return;
    setEditHeightUnit(newUnit);
    if (editHeight && !isNaN(Number(editHeight))) {
      const val = parseFloat(editHeight);
      if (newUnit === 'inches') {
        setEditHeight((val / 2.54).toFixed(1));
      } else {
        setEditHeight((val * 2.54).toFixed(1));
      }
    }
  };

  const handleWeightUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === editWeightUnit) return;
    setEditWeightUnit(newUnit);

    if (editWeight && !isNaN(Number(editWeight))) {
      const val = parseFloat(editWeight);
      if (newUnit === 'lbs') {
        setEditWeight((val * 2.20462).toFixed(1));
      } else {
        setEditWeight((val / 2.20462).toFixed(1));
      }
    }

    if (editTargetWeight && !isNaN(Number(editTargetWeight))) {
      const val = parseFloat(editTargetWeight);
      if (newUnit === 'lbs') {
        setEditTargetWeight((val * 2.20462).toFixed(1));
      } else {
        setEditTargetWeight((val / 2.20462).toFixed(1));
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!editHeight || !editWeight || !editAge || !editUsername) {
      Alert.alert('Validation Error', 'Please complete username, age, height, and weight.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        username: editUsername,
        heightUnit: editHeightUnit,
        weightUnit: editWeightUnit,
        age: parseInt(editAge),
        height: parseFloat(editHeight),
        weight: parseFloat(editWeight),
        targetWeight: parseFloat(editTargetWeight) || parseFloat(editWeight),
        targetTimelineWeeks: parseInt(editTimeline) || 8
      };

      await updateProfile(payload);
      setIsEditProfileOpen(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact us at: aurastraid@gmail.com\nOur trainers will reply within 24 hours!');
  };

  const handleRate = () => {
    Alert.alert('Rate App', 'Thank you for rating Aurastride 5-stars in the App Store!');
  };

  const handleShare = () => {
    Alert.alert('Share App', 'Share code: AURAS-STRIDE\nRefer friends to share the stride!');
  };

  const getDisplayName = () => {
    return user?.username || user?.email?.split('@')[0] || 'strider';
  };

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Profile Card */}
          <View style={[styles.profileHeaderCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.profileAvatar}>
              <User size={30} color="#00A3FF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{getDisplayName()}</Text>
              <Text style={[styles.profileEmail, { color: colors.subText }]}>{user?.email}</Text>
              <Text style={styles.profileBmi}>
                BMI: {user?.bmi || 'N/A'} • {user?.height} {user?.heightUnit || 'cm'} • {user?.weight} {user?.weightUnit || 'kg'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                setEditUsername(user?.username || '');
                setEditHeightUnit(user?.heightUnit || 'cm');
                setEditWeightUnit(user?.weightUnit || 'kg');
                setEditAge(user?.age?.toString() || '');
                setEditHeight(user?.height?.toString() || '');
                setEditWeight(user?.weight?.toString() || '');
                setEditTargetWeight(user?.targetWeight?.toString() || '');
                setEditTimeline(user?.targetTimelineWeeks?.toString() || '8');
                setIsEditProfileOpen(true);
              }}
            >
              <Edit2 size={16} color="#00A3FF" />
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.menuBg, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.menuRow} onPress={handleThemeChange}>
              <View style={styles.menuLeft}>
                <Settings size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>App Theme</Text>
              </View>
              <Text style={[styles.menuValue, { color: colors.subText }]}>{theme}</Text>
            </TouchableOpacity>
          </View>

          {/* Actions Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support & Community</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.menuBg, borderColor: colors.border }]}>
            <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.borderRow }]} onPress={handleRate}>
              <View style={styles.menuLeft}>
                <Star size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Rate Aurastride</Text>
              </View>
              <ChevronRight size={18} color={colors.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.borderRow }]} onPress={handleShare}>
              <View style={styles.menuLeft}>
                <Globe size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Share with Friends</Text>
              </View>
              <ChevronRight size={18} color={colors.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.borderRow }]} onPress={handleSupport}>
              <View style={styles.menuLeft}>
                <HelpCircle size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Contact Support</Text>
              </View>
              <ChevronRight size={18} color={colors.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.borderRow }]} onPress={() => setIsTermsOpen(true)}>
              <View style={styles.menuLeft}>
                <Shield size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Terms & Conditions</Text>
              </View>
              <ChevronRight size={18} color={colors.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuRow} onPress={() => setIsPrivacyOpen(true)}>
              <View style={styles.menuLeft}>
                <Shield size={18} color={colors.iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={18} color={colors.chevronColor} />
            </TouchableOpacity>
          </View>

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut size={18} color="#FF4B2B" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* ==================== PROFILE EDITOR MODAL ==================== */}
        <Modal
          visible={isEditProfileOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsEditProfileOpen(false)}
        >
          <LinearGradient colors={colors.bg} style={styles.modalBg}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile Settings</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.formLabel }]}>Username</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.formLabel }]}>Age</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="number-pad"
                  value={editAge}
                  onChangeText={setEditAge}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.formLabel, { color: colors.formLabel }]}>Height ({editHeightUnit})</Text>
                  <View style={[styles.unitToggleContainer, { backgroundColor: colors.unitToggleBg, borderColor: colors.unitToggleBorder }]}>
                    <TouchableOpacity
                      style={[styles.unitToggleBtn, editHeightUnit === 'cm' && { backgroundColor: colors.unitToggleBtnActive }]}
                      onPress={() => handleHeightUnitChange('cm')}
                    >
                      <Text style={[styles.unitToggleText, { color: editHeightUnit === 'cm' ? '#00A3FF' : colors.subText }]}>cm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitToggleBtn, editHeightUnit === 'inches' && { backgroundColor: colors.unitToggleBtnActive }]}
                      onPress={() => handleHeightUnitChange('inches')}
                    >
                      <Text style={[styles.unitToggleText, { color: editHeightUnit === 'inches' ? '#00A3FF' : colors.subText }]}>in</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="number-pad"
                  value={editHeight}
                  onChangeText={setEditHeight}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.formLabel, { color: colors.formLabel }]}>Current Weight ({editWeightUnit})</Text>
                  <View style={[styles.unitToggleContainer, { backgroundColor: colors.unitToggleBg, borderColor: colors.unitToggleBorder }]}>
                    <TouchableOpacity
                      style={[styles.unitToggleBtn, editWeightUnit === 'kg' && { backgroundColor: colors.unitToggleBtnActive }]}
                      onPress={() => handleWeightUnitChange('kg')}
                    >
                      <Text style={[styles.unitToggleText, { color: editWeightUnit === 'kg' ? '#00A3FF' : colors.subText }]}>kg</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitToggleBtn, editWeightUnit === 'lbs' && { backgroundColor: colors.unitToggleBtnActive }]}
                      onPress={() => handleWeightUnitChange('lbs')}
                    >
                      <Text style={[styles.unitToggleText, { color: editWeightUnit === 'lbs' ? '#00A3FF' : colors.subText }]}>lbs</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={editWeight}
                  onChangeText={setEditWeight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.formLabel }]}>Target Weight ({editWeightUnit})</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={editTargetWeight}
                  onChangeText={setEditTargetWeight}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.formLabel }]}>Target Timeline (Weeks)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="number-pad"
                  value={editTimeline}
                  onChangeText={setEditTimeline}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdateProfile}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#0072FF', '#FF5733'] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtnGradient}
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </Modal>

        {/* ==================== TERMS & CONDITIONS MODAL ==================== */}
        <Modal
          visible={isTermsOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsTermsOpen(false)}
        >
          <LinearGradient colors={colors.bg} style={styles.modalBg}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setIsTermsOpen(false)}>
                <X size={24} color={colors.text} />
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
            <TouchableOpacity style={styles.saveBtn} onPress={() => setIsTermsOpen(false)}>
              <LinearGradient
                colors={['#0072FF', '#FF5733'] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>

        {/* ==================== PRIVACY POLICY MODAL ==================== */}
        <Modal
          visible={isPrivacyOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsPrivacyOpen(false)}
        >
          <LinearGradient colors={colors.bg} style={styles.modalBg}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setIsPrivacyOpen(false)}>
                <X size={24} color={colors.text} />
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
            <TouchableOpacity style={styles.saveBtn} onPress={() => setIsPrivacyOpen(false)}>
              <LinearGradient
                colors={['#0072FF', '#FF5733'] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  profileBmi: {
    color: '#00A3FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  editProfileBtn: {
    padding: 8,
  },
  promoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
  },
  promoGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  promoSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  menuValue: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 75, 43, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 43, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF4B2B',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modal styles
  modalBg: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    color: '#FFF',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
  },
  saveBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Subscription Modal
  subHeader: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },
  subSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  subPlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadgeFree: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgePremium: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FF5733',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subPlanName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subPlanPrice: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 16,
  },
  subPlanDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginBottom: 8,
  },
  subBuyBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  subBuyBtnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  subBuyBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  unitToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitToggleBtnActive: {
    backgroundColor: 'rgba(0, 163, 255, 0.15)',
  },
  unitToggleText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '700',
  },
  agreeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
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
});
