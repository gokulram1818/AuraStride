import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dumbbell,
  Play,
  X,
  Award,
  Clock
} from 'lucide-react-native';

export default function WorkoutScreen() {
  const { token, user, refreshUser, theme } = useAuth();

  const renderWeightText = (weightInKg: number) => {
    if (!weightInKg) return '';
    const userUnit = user?.weightUnit || 'kg';
    if (userUnit === 'lbs') {
      const weightInLbs = Math.round(weightInKg * 2.20462);
      return `(${weightInLbs} lbs)`;
    }
    return `(${weightInKg} kg)`;
  };

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRow: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    cardBgActive: isLight ? 'rgba(0, 163, 255, 0.05)' : 'rgba(0, 163, 255, 0.02)',
    cardBorderActive: isLight ? 'rgba(0, 163, 255, 0.4)' : 'rgba(0, 163, 255, 0.3)',
    iconBoxBg: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    iconBoxBgActive: isLight ? 'rgba(0, 163, 255, 0.12)' : 'rgba(0, 163, 255, 0.12)',
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    modalBg: isLight ? '#FFFFFF' : '#121420',
    restToggleBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
  };

  const [isLoading, setIsLoading] = useState(true);
  const [preplannedPrograms, setPreplannedPrograms] = useState<any[]>([]);
  const [customPrograms, setCustomPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchPreplannedPrograms = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/workouts/preplanned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPreplannedPrograms(data);
      }

      const customResponse = await fetch(`${API_URL}/workouts/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (customResponse.ok) {
        const customData = await customResponse.json();
        setCustomPrograms(customData);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPreplannedPrograms();
    }, [token])
  );

  const handleSelectProgram = async (programId: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/select-program/${programId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        Alert.alert('Success', 'Plan selected as your active program!');
        await refreshUser();
        if (selectedProgram && selectedProgram._id === programId) {
          setSelectedProgram({ ...selectedProgram, isActive: true });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select active program');
    }
  };

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>WORKOUT PLANNER</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.solidBg }]}>
            <ActivityIndicator size="large" color={colors.loaderColor} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {customPrograms.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.sectionTitle}>My Custom Routines</Text>
                {customPrograms.map((program) => {
                  const isActive = user?.activeWorkoutProgram?._id === program._id;
                  return (
                    <TouchableOpacity
                      key={program._id}
                      style={[
                        styles.planCard,
                        { backgroundColor: colors.cardBg, borderColor: colors.border },
                        isActive && { borderColor: colors.cardBorderActive, backgroundColor: colors.cardBgActive }
                      ]}
                      onPress={() => {
                        setSelectedProgram(program);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <View style={styles.planCardContent}>
                        <View style={styles.planLeft}>
                          <View style={[
                            styles.planIconBox,
                            { backgroundColor: colors.iconBoxBg },
                            isActive && { backgroundColor: colors.iconBoxBgActive }
                          ]}>
                            <Dumbbell size={20} color={isActive ? '#00A3FF' : colors.text} />
                          </View>
                          <View style={styles.planDetails}>
                            <Text style={[styles.planName, { color: colors.text }]}>{program.name}</Text>
                            <Text style={[styles.planMeta, { color: colors.subText }]}>
                              {program.difficulty} • {program.durationWeeks} Weeks
                            </Text>
                          </View>
                        </View>
                        {isActive ? (
                          <View style={styles.activeLabel}>
                            <Text style={styles.activeLabelText}>Active</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.selectBtn, { backgroundColor: colors.restToggleBg }]}
                            onPress={() => handleSelectProgram(program._id)}
                          >
                            <Text style={[styles.selectBtnText, { color: colors.text }]}>Select</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.sectionTitle}>Template Programs</Text>
            {preplannedPrograms.map((program) => {
              const isActive = user?.activeWorkoutProgram?._id === program._id;
              return (
                <TouchableOpacity
                  key={program._id}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                    isActive && { borderColor: colors.cardBorderActive, backgroundColor: colors.cardBgActive }
                  ]}
                  onPress={() => {
                    setSelectedProgram(program);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <View style={styles.planCardContent}>
                    <View style={styles.planLeft}>
                      <View style={[
                        styles.planIconBox,
                        { backgroundColor: colors.iconBoxBg },
                        isActive && { backgroundColor: colors.iconBoxBgActive }
                      ]}>
                        <Dumbbell size={20} color={isActive ? '#00A3FF' : colors.text} />
                      </View>
                      <View style={styles.planDetails}>
                        <Text style={[styles.planName, { color: colors.text }]}>{program.name}</Text>
                        <Text style={[styles.planMeta, { color: colors.subText }]}>
                          {program.difficulty} • {program.durationWeeks} Weeks
                        </Text>
                      </View>
                    </View>
                    {isActive ? (
                      <View style={styles.activeLabel}>
                        <Text style={styles.activeLabelText}>Active</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.selectBtn, { backgroundColor: colors.restToggleBg }]}
                        onPress={() => handleSelectProgram(program._id)}
                      >
                        <Text style={[styles.selectBtnText, { color: colors.text }]}>Select</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ==================== PREPLANNED PROGRAM DETAIL MODAL ==================== */}
        <Modal
          visible={isDetailModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsDetailModalOpen(false)}
        >
          <LinearGradient colors={colors.bg} style={styles.modalBg}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedProgram?.name}</Text>
              <TouchableOpacity onPress={() => setIsDetailModalOpen(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalMetaInfo}>
                <View style={styles.metaRow}>
                  <Award size={18} color="#00A3FF" />
                  <Text style={[styles.metaVal, { color: colors.text }]}>{selectedProgram?.difficulty}</Text>
                </View>
                <View style={[styles.metaRow, { marginLeft: 20 }]}>
                  <Clock size={18} color="#00A3FF" />
                  <Text style={[styles.metaVal, { color: colors.text }]}>{selectedProgram?.durationWeeks} Weeks</Text>
                </View>
              </View>

              <Text style={[styles.modalDesc, { color: colors.subText }]}>
                {selectedProgram?.description || 'Build consistency and track details.'}
              </Text>
              
              <Text style={[styles.scheduleHeader, { color: colors.text }]}>Weekly Schedule</Text>
              {selectedProgram?.schedule.map((dayItem: any) => (
                <View key={dayItem._id || dayItem.day} style={[styles.modalScheduleDayCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <View style={styles.dayCardHeader}>
                    <Text style={[styles.dayCardName, { color: colors.text }]}>{dayItem.day}</Text>
                    {dayItem.restDay ? (
                      <Text style={[styles.restDayText, { color: colors.subText }]}>REST DAY</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.completeSessionBtn}
                        onPress={() => {
                          setIsDetailModalOpen(false);
                          const dayIdx = selectedProgram.schedule.findIndex((s: any) => s.day === dayItem.day);
                          router.push({
                            pathname: '/workout/day-detail',
                            params: {
                              programId: selectedProgram._id,
                              dayIdx: dayIdx.toString(),
                              dayName: dayItem.day
                            }
                          });
                        }}
                      >
                        <Play size={12} color="#FFF" fill="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.completeSessionText}>Track Day</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {!dayItem.restDay && (
                    <View style={styles.dayExercisesList}>
                      {dayItem.exercises.map((item: any, eIdx: number) => {
                        const exId = item.exercise?._id || item.exercise;
                        return (
                          <TouchableOpacity
                            key={eIdx}
                            style={[styles.dayExerciseItem, { borderBottomColor: colors.borderRow }]}
                            onPress={() => {
                              if (exId) {
                                setIsDetailModalOpen(false);
                                router.push({ pathname: '/exercise/[id]', params: { id: exId } });
                              }
                            }}
                          >
                            <Text style={[styles.exItemName, { color: colors.text }]}>{item.exercise?.name || 'Exercise'}</Text>
                            <Text style={[styles.exItemReps, { color: colors.subText }]}>
                              {item.sets} sets × {item.reps} {item.weight > 0 ? renderWeightText(item.weight) : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    height: 60,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  planIconBoxActive: {
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
  },
  planDetails: {
    marginLeft: 14,
    flex: 1,
  },
  planName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  planMeta: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  activeLabel: {
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  activeLabelText: {
    color: '#00A3FF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBg: {
    flex: 1,
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
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  modalMetaInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaVal: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  modalDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  scheduleHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalScheduleDayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayCardName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  restDayText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '800',
  },
  completeSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completeSessionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dayExercisesList: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 8,
  },
  dayExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exItemName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  exItemReps: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
