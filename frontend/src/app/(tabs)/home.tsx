import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
  Modal
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '../../components/Alert';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Dumbbell, Award, ChevronRight, Activity, Calendar, Check } from 'lucide-react-native';

export default function HomeScreen() {
  const { token, user, refreshUser, theme } = useAuth();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Track set completion state
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean }>({});
  const [celebrationData, setCelebrationData] = useState<any | null>(null);

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    metricCardBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    weeklyContainerBg: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
    weeklyDotInactiveBg: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
    weeklyDayLabelColor: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    programGradient: (isLight ? ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] : ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']) as [string, string],
    programBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    programDescColor: isLight ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.6)',
    programDetailsColor: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)',
    chevronColor: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)',
    noProgramCardBg: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.03)',
    noProgramBorder: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    noProgramIconColor: isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    gridCardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.05)',
    gridCardBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    gridCardRestBg: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.01)',
    gridCardTodayBorder: isLight ? 'rgba(0, 163, 255, 0.5)' : 'rgba(0, 163, 255, 0.25)',
    gridCardTodayText: isLight ? '#0072FF' : '#00A3FF',
    gridCardPreviewText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.3)',
    insightGradient: (isLight ? ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)'] : ['#101524', '#080A10']) as [string, string],
    insightBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    insightText: isLight ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.7)',
    progressTrackBg: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    modalOverlayBg: isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.75)',
    modalBg: isLight ? '#FFFFFF' : '#121420',
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    
    // 1. Try to load from cache first
    try {
      const cached = await AsyncStorage.getItem('cached_dashboard_data');
      if (cached) {
        setDashboardData(JSON.parse(cached));
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Failed to load dashboard from cache:', e);
    }

    // 2. Fetch fresh copy from backend
    try {
      const localDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      await AsyncStorage.setItem('cached_dashboard_data', JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not update dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run fetch whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [token])
  );

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDisplayName = () => {
    return user?.username || user?.email?.split('@')[0] || 'strider';
  };

  // Helper to check which days have completed workouts
  const renderWeeklySummary = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const logs = dashboardData?.weeklySummary || [];

    // Map logs to day names, fallback to log.day
    const completedDays = logs.map((log: any) => log.weekday || log.day);
    const todayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    return (
      <View style={[styles.weeklyContainer, { backgroundColor: colors.weeklyContainerBg, borderColor: colors.border }]}>
        {daysOfWeek.map((day, idx) => {
          const isCompleted = completedDays.some((d: string) => d && d.toLowerCase().startsWith(day.toLowerCase()));
          const isToday = day.toLowerCase() === todayAbbrev.toLowerCase();
          return (
            <View key={idx} style={styles.weeklyDayCol}>
              <View
                style={[
                  styles.weeklyDot,
                  isCompleted ? styles.weeklyDotCompleted : { backgroundColor: colors.weeklyDotInactiveBg },
                  isToday && !isCompleted && { borderColor: isLight ? '#0072FF' : '#00A3FF', borderWidth: 1.5 }
                ]}
              >
                {isCompleted && <Flame size={14} color="#FFF" />}
              </View>
              <Text style={[
                styles.weeklyDayLabel,
                { color: isToday ? (isLight ? '#0072FF' : '#00A3FF') : colors.weeklyDayLabelColor },
                isToday && { fontWeight: '900' }
              ]}>{day}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.solidBg }]}>
        <ActivityIndicator size="large" color={colors.loaderColor} />
      </View>
    );
  }

  const activeProgram = dashboardData?.activeWorkoutProgram;
  const streak = dashboardData?.streak || 0;
  const caloriesToday = dashboardData?.today?.caloriesBurned || 0;
  const durationToday = dashboardData?.today?.durationMinutes || 0;
  const goalPercentage = dashboardData?.goal?.completionPercentage || 0;

  const renderWeightText = (weightInKg: number) => {
    if (!weightInKg) return '(Bodyweight)';
    const userUnit = user?.weightUnit || 'kg';
    if (userUnit === 'lbs') {
      const weightInLbs = Math.round(weightInKg * 2.20462);
      return `(${weightInLbs} lbs)`;
    }
    return `(${weightInKg} kg)`;
  };

  // Helper to determine today's workout day mapping
  const getTodaySchedule = (prog: any) => {
    if (!prog || !prog.schedule) return null;
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const isCustom = prog.type === 'Custom';
    
    if (isCustom) {
      // Monday=Day 1 (index 0), Tuesday=Day 2 (index 1), ..., Sunday=Day 7 (index 6)
      const targetIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return prog.schedule[targetIdx];
    } else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = days[dayOfWeek];
      return prog.schedule.find((s: any) => s.day.toLowerCase() === todayName.toLowerCase());
    }
  };

  const getTodayDayIdx = (prog: any) => {
    if (!prog || !prog.schedule) return -1;
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[dayOfWeek];
    
    // 1. Try to find the exact day name match
    const idx = prog.schedule.findIndex(
      (s: any) => s.day?.toLowerCase() === todayName.toLowerCase()
    );
    if (idx !== -1) return idx;
    
    // 2. Fallback to Custom style: Monday=Day 1 (index 0), ..., Sunday=Day 7 (index 6)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const dummySchedule = [
    { day: 'Monday', restDay: true, exercises: [] },
    { day: 'Tuesday', restDay: true, exercises: [] },
    { day: 'Wednesday', restDay: true, exercises: [] },
    { day: 'Thursday', restDay: true, exercises: [] },
    { day: 'Friday', restDay: true, exercises: [] },
    { day: 'Saturday', restDay: true, exercises: [] },
    { day: 'Sunday', restDay: true, exercises: [] }
  ];

  const dummyProgram = {
    type: 'Custom',
    schedule: dummySchedule
  };

  const scheduleToRender = activeProgram?.schedule || dummySchedule;

  const handleDayPress = async (idx: number, dayName: string) => {
    if (activeProgram) {
      router.push({
        pathname: '/workout/day-detail',
        params: {
          programId: activeProgram._id,
          dayIdx: idx.toString(),
          dayName: dayName,
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const customRes = await fetch(`${API_URL}/workouts/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let targetProgramId = '';
      if (customRes.ok) {
        const customList = await customRes.json();
        if (customList && customList.length > 0) {
          targetProgramId = customList[0]._id;
        }
      }

      if (!targetProgramId) {
        const createRes = await fetch(`${API_URL}/workouts/custom`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'My Custom Split',
            difficulty: 'Beginner',
            durationWeeks: 4,
            description: 'My custom routine.',
            schedule: dummySchedule
          })
        });

        if (createRes.ok) {
          const newProg = await createRes.json();
          targetProgramId = newProg._id;
        } else {
          throw new Error('Failed to create custom split');
        }
      }

      const selectRes = await fetch(`${API_URL}/workouts/select-program/${targetProgramId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (selectRes.ok) {
        await refreshUser();
        const localDate = new Date().toISOString().split('T')[0];
        const dashRes = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (dashRes.ok) {
          const freshDashData = await dashRes.json();
          setDashboardData(freshDashData);
          await AsyncStorage.setItem('cached_dashboard_data', JSON.stringify(freshDashData));
        }

        router.push({
          pathname: '/workout/day-detail',
          params: {
            programId: targetProgramId,
            dayIdx: idx.toString(),
            dayName: dayName,
          },
        });
      } else {
        throw new Error('Failed to activate program');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Could not select or create custom routine.');
    } finally {
      setIsLoading(false);
    }
  };

  const todaySchedule = getTodaySchedule(activeProgram);
  const hasTodayExercises = todaySchedule && !todaySchedule.restDay && todaySchedule.exercises && todaySchedule.exercises.length > 0;

  const toggleSet = (exerciseId: string, setIdx: number) => {
    const key = `${exerciseId}_${setIdx}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogWorkout = async (workoutId: string, dayName: string) => {
    try {
      const localDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/workouts/complete-session`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workoutId, dayName, localDate })
      });

      if (response.ok) {
        const resData = await response.json();
        setCompletedSets({});
        setCelebrationData({
          streak: resData.streak,
          calories: resData.caloriesBurned,
          duration: resData.durationMinutes,
          day: dayName
        });
        fetchDashboardData();
        await refreshUser();
      } else {
        Alert.alert('Workout Logged', 'Nice job! You completed today\'s workout session!');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not complete session');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayWorkoutLogged = dashboardData?.weeklySummary?.some(
    (log: any) => log.day?.toLowerCase() === todaySchedule?.day?.toLowerCase() && log.date === todayStr
  );
  const todayLog = dashboardData?.weeklySummary?.find(
    (log: any) => log.day?.toLowerCase() === todaySchedule?.day?.toLowerCase() && log.date === todayStr
  );
  const completedCount = todayLog?.completedExercises?.length || 0;
  const isRest = todaySchedule ? (todaySchedule.restDay || !todaySchedule.exercises || todaySchedule.exercises.length === 0) : true;

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.subText }]}>{getGreeting()},</Text>
              <Text style={[styles.username, { color: colors.text }]}>{getDisplayName()}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={20} color="#FF5733" fill="#FF5733" />
              <Text style={styles.streakText}>{streak} Days</Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { borderColor: colors.metricCardBorder }]}>
              <LinearGradient colors={(isLight ? ['rgba(255, 87, 51, 0.08)', 'rgba(255, 87, 51, 0.01)'] : ['rgba(255, 87, 51, 0.1)', 'rgba(255, 87, 51, 0.02)']) as [string, string]} style={styles.cardGradient}>
                <Flame size={24} color="#FF5733" />
                <Text style={[styles.metricValue, { color: colors.text }]}>{caloriesToday} kcal</Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]}>Calories Burned</Text>
              </LinearGradient>
            </View>
            
            <View style={[styles.metricCard, { borderColor: colors.metricCardBorder }]}>
              <LinearGradient colors={(isLight ? ['rgba(0, 163, 255, 0.08)', 'rgba(0, 163, 255, 0.01)'] : ['rgba(0, 163, 255, 0.1)', 'rgba(0, 163, 255, 0.02)']) as [string, string]} style={styles.cardGradient}>
                <Activity size={24} color="#00A3FF" />
                <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{isRest ? 'Rest Day' : completedCount}</Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]} numberOfLines={1} adjustsFontSizeToFit>{isRest ? 'Today Rest Day' : 'Workouts Completed'}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Active Workout Card */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Program</Text>
            {activeProgram ? (
              <TouchableOpacity
                style={[styles.programCard, { borderColor: colors.programBorder }]}
                onPress={() => router.push('/(tabs)/workout')}
              >
                <LinearGradient
                  colors={colors.programGradient}
                  style={styles.programGradient}
                >
                  <View style={styles.programHeader}>
                    <View style={styles.programIconContainer}>
                      <Dumbbell size={22} color="#00A3FF" />
                    </View>
                    <View style={styles.programInfo}>
                      <Text style={[styles.programName, { color: colors.text }]}>{activeProgram.name}</Text>
                      <Text style={[styles.programDetails, { color: colors.programDetailsColor }]}>
                        Difficulty: {activeProgram.difficulty} • {activeProgram.durationWeeks} Weeks
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.chevronColor} />
                  </View>
                  
                  <View style={styles.quickStartRow}>
                    <Text style={[styles.programDesc, { color: colors.programDescColor }]} numberOfLines={2}>
                      {activeProgram.description || 'Follow this structured routine to smash your targets.'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.noProgramCard, { backgroundColor: colors.noProgramCardBg, borderColor: colors.noProgramBorder }]}
                onPress={() => router.push('/(tabs)/workout')}
              >
                <Dumbbell size={30} color={colors.noProgramIconColor} style={{ marginBottom: 8 }} />
                <Text style={[styles.noProgramText, { color: colors.text }]}>No active program selected</Text>
                <Text style={[styles.noProgramSub, { color: colors.subText }]}>Browse programs and get moving</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Weekly Program Schedule */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Schedule</Text>
            <View style={styles.gridContainer}>
              {scheduleToRender.map((sItem: any, idx: number) => {
                const todayIdx = getTodayDayIdx(activeProgram || dummyProgram);
                const isToday = idx === todayIdx;
                const isRest = sItem.restDay || !sItem.exercises || sItem.exercises.length === 0;
                const numEx = sItem.exercises ? sItem.exercises.length : 0;
                const isLast = idx === scheduleToRender.length - 1;
                
                // Check if this day is logged in weeklySummary and all exercises are completed
                const dayLog = dashboardData?.weeklySummary?.find(
                  (log: any) => log.day?.toLowerCase() === sItem.day?.toLowerCase()
                );
                const completedCount = dayLog?.completedExercises?.length || 0;
                const totalCount = sItem.exercises ? sItem.exercises.length : 0;
                const isLogged = totalCount > 0 && completedCount >= totalCount;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.gridCard,
                      { backgroundColor: colors.gridCardBg, borderColor: colors.gridCardBorder },
                      isLast && { width: '100%' },
                      isToday && { borderColor: colors.gridCardTodayBorder, borderWidth: 1.5 },
                      isRest && { backgroundColor: colors.gridCardRestBg }
                    ]}
                    onPress={() => handleDayPress(idx, sItem.day)}
                  >
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>TODAY</Text>
                      </View>
                    )}
                    
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.cardDayText, isToday && { color: colors.gridCardTodayText }, !isToday && { color: colors.text }]}>
                        {sItem.day}
                      </Text>
                      {isLogged && (
                        <View style={styles.checkBadge}>
                          <Check size={10} color="#00C853" />
                        </View>
                      )}
                    </View>

                    <Text style={[styles.cardStatusText, isToday && { color: colors.gridCardTodayText }, !isToday && { color: isRest ? '#00C853' : colors.subText }]}>
                      {isRest ? 'Rest Day' : `${numEx} Exercise${numEx > 1 ? 's' : ''}`}
                    </Text>

                    {!isRest && sItem.exercises && sItem.exercises.length > 0 ? (
                      <Text style={[styles.exercisesPreviewText, { color: colors.gridCardPreviewText }]} numberOfLines={1}>
                        {sItem.exercises.map((e: any) => e.exercise?.name || 'Ex').join(', ')}
                      </Text>
                    ) : (
                      <Text style={[styles.exercisesPreviewText, { color: colors.gridCardPreviewText }]} numberOfLines={1}>
                        Rest and Recovery
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Consistency Tracker */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Consistency</Text>
              <Calendar size={18} color={colors.subText} />
            </View>
            {renderWeeklySummary()}
          </View>

          {/* Goal Insight Card */}
          {user?.goal && (
            <View style={[styles.insightCard, { borderColor: colors.insightBorder }]}>
              <LinearGradient
                colors={colors.insightGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insightGradient}
              >
                <View style={styles.insightHeader}>
                  <Award size={22} color="#FFD700" />
                  <Text style={[styles.insightTitle, { color: colors.text }]}>Goal: {user.goal}</Text>
                </View>
                <Text style={[styles.insightText, { color: colors.insightText }]}>
                  Your current BMI is <Text style={styles.bmiValue}>{user.bmi}</Text>. You are on track!
                  {user.targetWeight && ` Target weight is ${user.targetWeight}${user.weightUnit || 'kg'}.`}
                </Text>
                
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.progressTrackBg }]}>
                    <View style={[styles.progressIndicator, { width: `${goalPercentage}%` }]} />
                  </View>
                  <Text style={[styles.progressPercentage, { color: colors.text }]}>{goalPercentage}%</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={styles.actionButtonContainer}
            onPress={() => router.push('/(tabs)/workout')}
          >
            <LinearGradient
              colors={['#0072FF', '#FF5733'] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Start Workout Session</Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* ==================== CELEBRATION MODAL ==================== */}
          <Modal
            visible={!!celebrationData}
            animationType="fade"
            transparent
            onRequestClose={() => setCelebrationData(null)}
          >
            <View style={[styles.pickerOverlay, { backgroundColor: colors.modalOverlayBg }]}>
              <View style={[styles.celebrationCard, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
                <Flame size={60} color="#FF5733" fill="#FF5733" style={{ marginBottom: 16 }} />
                <Text style={[styles.celebrationTitle, { color: colors.text }]}>Workout Logged!</Text>
                <Text style={[styles.celebrationSub, { color: colors.subText }]}>Streak updated to {celebrationData?.streak} Days!</Text>
                
                <View style={[styles.celebrationStatsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                  <View style={styles.celebrationStat}>
                    <Text style={[styles.celebrationStatVal, { color: colors.text }]}>{celebrationData?.calories}</Text>
                    <Text style={[styles.celebrationStatLbl, { color: colors.subText }]}>Est. kcal</Text>
                  </View>
                  <View style={[styles.celebrationStat, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                    <Text style={[styles.celebrationStatVal, { color: colors.text }]}>{celebrationData?.duration}</Text>
                    <Text style={[styles.celebrationStatLbl, { color: colors.subText }]}>Minutes</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.celebrationDoneBtn}
                  onPress={() => setCelebrationData(null)}
                >
                  <Text style={styles.celebrationDoneBtnText}>Awesome</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 100, // Leave space for floating tabs
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
  username: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 51, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 51, 0.2)',
  },
  streakText: {
    color: '#FF5733',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardGradient: {
    padding: 18,
    alignItems: 'flex-start',
  },
  metricValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  programCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  programGradient: {
    padding: 20,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programIconContainer: {
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
    padding: 10,
    borderRadius: 12,
  },
  programInfo: {
    flex: 1,
    marginLeft: 14,
  },
  programName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  programDetails: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  quickStartRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  programDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  noProgramCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
  },
  noProgramText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  noProgramSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 4,
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  weeklyDayCol: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  weeklyDotCompleted: {
    backgroundColor: '#FF5733',
  },
  weeklyDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  weeklyDayLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  insightCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  insightGradient: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  insightText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  bmiValue: {
    color: '#00A3FF',
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#FF5733',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
    width: 32,
    textAlign: 'right',
  },
  actionButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  todayExercisesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  todayExercisesTitle: {
    color: '#00A3FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  todayExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  todayExerciseLeft: {
    flex: 1,
    marginRight: 10,
  },
  todayExerciseName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  todayExerciseMeta: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  setsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  setCircleDone: {
    backgroundColor: '#00C853',
    borderColor: '#00C853',
  },
  setCircleText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  setCircleTextDone: {
    color: '#FFF',
  },
  logSessionBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logSessionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    backgroundColor: '#161824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  celebrationTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  celebrationSub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  celebrationStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  celebrationStat: {
    flex: 1,
    alignItems: 'center',
  },
  celebrationStatVal: {
    color: '#00A3FF',
    fontSize: 18,
    fontWeight: '800',
  },
  celebrationStatLbl: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  celebrationDoneBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 24,
  },
  celebrationDoneBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logSessionBtnFinished: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    borderWidth: 1,
    borderColor: '#00C853',
  },
  logSessionBtnTextFinished: {
    color: '#00C853',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridContainer: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    width: '48.5%',
    position: 'relative',
    minHeight: 85,
    justifyContent: 'space-between',
  },
  gridCardToday: {
    borderColor: '#00A3FF',
    backgroundColor: 'rgba(0, 163, 255, 0.04)',
  },
  gridCardRest: {
    opacity: 0.75,
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#00A3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  todayBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDayText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardDayTextToday: {
    color: '#00A3FF',
  },
  checkBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    borderRadius: 6,
    padding: 3,
  },
  cardStatusText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '700', 
    marginTop: 4,
  },
  cardStatusTextToday: {
    color: '#FFF',
  },
  exercisesPreviewText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    marginTop: 4,
  },
});
