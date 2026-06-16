import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Flame,
  Star,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  Dumbbell,
  Compass,
  Info
} from 'lucide-react-native';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token, theme } = useAuth();
  const [exercise, setExercise] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    backBtnColor: isLight ? '#1C1C1E' : '#FFF',
    backBtnBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
    backBtnBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    sectionBg: isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.02)',
    sectionBorder: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    badgeBgOverlay: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 10, 15, 0.85)',
    badgeBorderOverlay: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    badgeTextOverlay: isLight ? '#1C1C1E' : '#FFF',
    specCardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    specCardBorder: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)',
    stepNumBg: isLight ? 'rgba(0, 163, 255, 0.1)' : 'rgba(0, 163, 255, 0.15)',
    listText: isLight ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.8)',
    mistakeText: isLight ? 'rgba(180, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.7)',
    gifOverlay: (isLight ? ['transparent', 'rgba(245, 247, 250, 0.95)'] : (isAmoled ? ['transparent', 'rgba(0, 0, 0, 0.95)'] : ['transparent', 'rgba(9, 10, 15, 0.95)'])) as [string, string],
    headerBorder: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)',
  };

  const fetchExerciseDetails = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExercise(data);
      } else {
        setErrorMsg('Failed to load exercise details');
      }
    } catch (err) {
      console.error('Error fetching exercise details:', err);
      setErrorMsg('Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseDetails();
  }, [id, token]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.solidBg }]}>
        <ActivityIndicator size="large" color={colors.loaderColor} />
      </View>
    );
  }

  if (errorMsg || !exercise) {
    return (
      <LinearGradient colors={colors.bg} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg || 'Exercise details not found'}</Text>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: colors.backBtnBg, borderColor: colors.backBtnBorder }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backBtnText, { color: colors.text }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.headerBorder }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerBackBtn, { backgroundColor: colors.backBtnBg, borderColor: colors.backBtnBorder }]}
          >
            <ArrowLeft size={22} color={colors.backBtnColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {exercise.name.toUpperCase()}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Animated Tutorial Player */}
          <View style={[styles.visualCard, { borderColor: colors.border }]}>
            {exercise.gifUrl ? (
              <View style={styles.gifContainer}>
                <Image
                  source={{ uri: exercise.gifUrl }}
                  style={styles.gifImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={colors.gifOverlay}
                  style={styles.gifGradientOverlay}
                />
                <View style={[styles.recommendedBadgeOverlay, { backgroundColor: colors.badgeBgOverlay, borderColor: colors.badgeBorderOverlay }]}>
                  <Text style={[styles.recommendedBadgeText, { color: colors.badgeTextOverlay }]}>
                    Rec: {exercise.recommendedSets} Sets × {exercise.recommendedReps} Reps
                  </Text>
                </View>
              </View>
            ) : (
              <LinearGradient
                colors={(isLight ? ['rgba(0, 114, 255, 0.08)', 'rgba(255, 87, 51, 0.08)'] : ['rgba(0, 163, 255, 0.1)', 'rgba(255, 87, 51, 0.1)']) as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.visualGradient}
              >
                <PlayCircle size={52} color={isLight ? '#0072FF' : '#00A3FF'} style={styles.visualIcon} />
                <Text style={[styles.visualText, { color: colors.text }]}>{exercise.name}</Text>
                <View style={[styles.recommendedBadge, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.1)' }]}>
                  <Text style={[styles.recommendedBadgeText, { color: colors.text }]}>
                    Rec: {exercise.recommendedSets} Sets × {exercise.recommendedReps} Reps
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Info size={11} color={colors.subText} style={{ marginRight: 6 }} />
            <Text style={[styles.disclaimerText, { color: colors.subText }]}>
              Note: Visual tutorials are 3D model demonstrations. Consult a trainer for personal form guidance.
            </Text>
          </View>

          {/* Quick Specifications */}
          <View style={styles.specsRow}>
            <View style={[styles.specCard, { backgroundColor: colors.specCardBg, borderColor: colors.specCardBorder }]}>
              <Flame size={18} color="#FF5733" />
              <Text style={[styles.specLabel, { color: colors.subText }]}>Target Muscle</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{exercise.targetMuscle}</Text>
            </View>
            <View style={[styles.specCard, { backgroundColor: colors.specCardBg, borderColor: colors.specCardBorder }]}>
              <Star size={18} color="#FFD700" fill="#FFD700" />
              <Text style={[styles.specLabel, { color: colors.subText }]}>Difficulty</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{exercise.difficulty}</Text>
            </View>
          </View>

          <View style={styles.specsRow}>
            <View style={[styles.specCard, { backgroundColor: colors.specCardBg, borderColor: colors.specCardBorder }]}>
              <Dumbbell size={18} color={isLight ? '#0072FF' : '#00A3FF'} />
              <Text style={[styles.specLabel, { color: colors.subText }]}>Equipment</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{exercise.equipment || 'Bodyweight'}</Text>
            </View>
            <View style={[styles.specCard, { backgroundColor: colors.specCardBg, borderColor: colors.specCardBorder }]}>
              <Compass size={18} color="#2ECC71" />
              <Text style={[styles.specLabel, { color: colors.subText }]}>Category</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{exercise.category}</Text>
            </View>
          </View>

          {/* Benefits */}
          {exercise.benefits && exercise.benefits.length > 0 && (
            <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBg, borderColor: colors.sectionBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Benefits</Text>
              {exercise.benefits.map((benefit: string, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <CheckCircle size={15} color="#00C853" style={styles.listIcon} />
                  <Text style={[styles.listText, { color: colors.listText }]}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBg, borderColor: colors.sectionBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Perform</Text>
            {exercise.instructions && exercise.instructions.map((step: string, idx: number) => (
              <View key={idx} style={styles.instructionItem}>
                <View style={[styles.stepNumberContainer, { backgroundColor: colors.stepNumBg }]}>
                  <Text style={styles.stepNumber}>{idx + 1}</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.listText }]}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Common Mistakes */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBg, borderColor: colors.sectionBorder }]}>
              <Text style={[styles.sectionTitle, { color: '#FF4B2B' }]}>Common Mistakes to Avoid</Text>
              {exercise.commonMistakes.map((mistake: string, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <AlertTriangle size={15} color="#FF4B2B" style={styles.listIcon} />
                  <Text style={[styles.listText, { color: colors.mistakeText }]}>{mistake}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerBackBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  visualCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  gifContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  gifGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  recommendedBadgeOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendedBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  visualGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  visualIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  visualText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  specCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'flex-start',
  },
  specLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  specValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 18,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  listText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumberContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 163, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumber: {
    color: '#00A3FF',
    fontSize: 11,
    fontWeight: '800',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF7b60',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    flex: 1,
  },
});
