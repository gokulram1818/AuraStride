import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { Alert } from '../../components/Alert';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, Plus, Info, Check, Dumbbell, Flame } from 'lucide-react-native';

export default function DayDetailScreen() {
  const { token, user, refreshUser, theme } = useAuth();
  const { programId, dayIdx, dayName } = useLocalSearchParams();
  const parsedDayIdx = parseInt(dayIdx as string);

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRow: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    backBtnColor: isLight ? '#1C1C1E' : '#FFF',
    
    // Form Inputs & Toggles
    inputBg: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
    inputBorder: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
    unitToggleBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
    unitToggleBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    unitToggleBtnActive: isLight ? 'rgba(0, 163, 255, 0.12)' : 'rgba(0, 163, 255, 0.15)',
    deleteSetBtnBg: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
  };

  const [isLoading, setIsLoading] = useState(true);
  const [workoutProgram, setWorkoutProgram] = useState<any | null>(null);
  
  // Local editable exercises state for this day
  // Structure: array of { exerciseId, name, sets: [ { reps: string, weight: string, unit: 'kg' | 'lbs' } ] }
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<any[]>([]);

  const fetchWorkoutDetails = async () => {
    if (!token || !programId) return;
    setIsLoading(true);
    try {
      // Fetch weekly summary to check completion
      const localDate = new Date().toISOString().split('T')[0];
      const statsRes = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setWeeklySummary(statsData.weeklySummary || []);
      }

      // 1. Fetch the program details
      // Check if it is Custom or Preplanned
      let response = await fetch(`${API_URL}/workouts/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let customList = [];
      if (response.ok) {
        customList = await response.json();
      }
      
      let targetWorkout = customList.find((w: any) => w._id === programId);
      
      if (!targetWorkout) {
        // Fetch from preplanned if not found in custom
        const preRes = await fetch(`${API_URL}/workouts/preplanned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (preRes.ok) {
          const preList = await preRes.json();
          targetWorkout = preList.find((w: any) => w._id === programId);
        }
      }

      if (targetWorkout) {
        setWorkoutProgram(targetWorkout);
        const daySchedule = targetWorkout.schedule[parsedDayIdx];
        if (daySchedule && !daySchedule.restDay) {
          const rawExercises = daySchedule.exercises || [];
          
          // Map each exercise to our local editable structure
          const mapped = rawExercises.map((eItem: any) => {
            const exId = eItem.exercise?._id || eItem.exercise;
            const exName = eItem.exercise?.name || 'Exercise';
            
            // Split reps and weights by commas
            const repsStr = eItem.reps ? eItem.reps.toString() : '12';
            const weightStr = eItem.weight ? eItem.weight.toString() : '0';
            
            const repsArr = repsStr.split(',').map((r: string) => r.trim());
            const weightArr = weightStr.split(',').map((w: string) => w.trim());
            
            const totalSets = Math.max(eItem.sets || 3, repsArr.length, weightArr.length);
            
            const setsDetail = [];
            for (let i = 0; i < totalSets; i++) {
              const repVal = repsArr[i] || repsArr[repsArr.length - 1] || '12';
              const rawWeight = parseFloat(weightArr[i] || weightArr[weightArr.length - 1] || '0');
              
              // Convert stored weight (kg) to user's display unit (kg or lbs)
              const userUnit = user?.weightUnit || 'kg';
              let displayWeight = rawWeight.toString();
              if (rawWeight > 0 && userUnit === 'lbs') {
                displayWeight = Math.round(rawWeight * 2.20462).toString();
              }
              
              setsDetail.push({
                reps: repVal,
                weight: displayWeight === '0' ? '' : displayWeight,
                unit: userUnit
              });
            }

            const isCustom = eItem.exercise?.isCustom || false;

            return {
              exerciseId: exId,
              name: exName,
              sets: setsDetail,
              isCustom: isCustom
            };
          });

          setExercisesList(mapped);
        }
      }
    } catch (error) {
      console.error('Error fetching workout details:', error);
      Alert.alert('Error', 'Failed to load day details.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutDetails();
    }, [programId, dayIdx, token])
  );

  const handleAddSet = (exIdx: number) => {
    const list = [...exercisesList];
    const targetEx = list[exIdx];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || { reps: '12', weight: '', unit: user?.weightUnit || 'kg' };
    
    targetEx.sets.push({
      reps: lastSet.reps,
      weight: lastSet.weight,
      unit: lastSet.unit
    });
    setExercisesList(list);
  };

  const handleUpdateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight' | 'unit', value: string) => {
    const list = [...exercisesList];
    list[exIdx].sets[setIdx][field] = value;
    setExercisesList(list);
  };

  const handleDeleteSet = (exIdx: number, setIdx: number) => {
    const list = [...exercisesList];
    list[exIdx].sets.splice(setIdx, 1);
    if (list[exIdx].sets.length === 0) {
      list[exIdx].sets.push({ reps: '10', weight: '', unit: user?.weightUnit || 'kg' });
    }
    setExercisesList(list);
  };

  const handleDeleteExercise = (exIdx: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from today\'s list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const list = [...exercisesList];
            list.splice(exIdx, 1);
            setExercisesList(list);
          }
        }
      ]
    );
  };

  const handleSaveRoutine = async () => {
    if (!token || !workoutProgram) return;

    try {
      let activeProgramId = workoutProgram._id;
      let activeSchedule = [...workoutProgram.schedule];

      // 1. If it is a Preplanned program, we clone it into a Custom program first
      if (workoutProgram.type === 'Preplanned') {
        const confirmClone = await new Promise((resolve) => {
          Alert.alert(
            'Customize Program',
            'This is a preplanned template. Saving these changes will copy it to your Custom Routines as a fully editable split. Proceed?',
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Yes, Customize', onPress: () => resolve(true) }
            ]
          );
        });

        if (!confirmClone) return;
        setIsLoading(true);

        // Map preplanned schedule to editable schedule format
        const customSchedulePayload = workoutProgram.schedule.map((sItem: any, idx: number) => {
          if (idx === parsedDayIdx) {
            return {
              day: sItem.day,
              restDay: exercisesList.length === 0,
              exercises: exercisesList.map((eItem) => {
                // Map local sets to string format
                const setsCount = eItem.sets.length;
                const repsStr = eItem.sets.map((s: any) => s.reps || '12').join(',');
                const weightStr = eItem.sets.map((s: any) => {
                  const val = parseFloat(s.weight) || 0;
                  const valInKg = s.unit === 'lbs' ? (val / 2.20462) : val;
                  return valInKg.toFixed(1);
                }).join(',');

                return {
                  exercise: eItem.exerciseId,
                  sets: setsCount,
                  reps: repsStr,
                  weight: weightStr
                };
              })
            };
          }

          // Return unchanged day
          return {
            day: sItem.day,
            restDay: sItem.restDay || sItem.exercises.length === 0,
            exercises: sItem.exercises.map((e: any) => ({
              exercise: e.exercise?._id || e.exercise,
              sets: e.sets,
              reps: e.reps,
              weight: e.weight
            }))
          };
        });

        const clonePayload = {
          name: `${workoutProgram.name} (Custom)`,
          difficulty: workoutProgram.difficulty || 'Intermediate',
          durationWeeks: workoutProgram.durationWeeks || 4,
          description: `Customized version of ${workoutProgram.name}.`,
          schedule: customSchedulePayload
        };

        // Create custom copy
        const createRes = await fetch(`${API_URL}/workouts/custom`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clonePayload)
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(errData.msg || 'Failed to copy program.');
        }

        const savedData = await createRes.json();
        activeProgramId = savedData._id;

        // Auto-select this cloned copy as user's active program
        await fetch(`${API_URL}/workouts/select-program/${savedData._id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });

        await refreshUser();
        Alert.alert('Success', 'Program customized and saved successfully!');
        router.back();
        return;
      }

      // 2. Otherwise (it is Custom), we modify the schedule day directly
      const updatedSchedule = activeSchedule.map((sItem: any, idx: number) => {
        if (idx === parsedDayIdx) {
          const exercisesPayload = exercisesList.map((eItem) => {
            const setsCount = eItem.sets.length;
            const repsStr = eItem.sets.map((s: any) => s.reps || '12').join(',');
            const weightStr = eItem.sets.map((s: any) => {
              const val = parseFloat(s.weight) || 0;
              const valInKg = s.unit === 'lbs' ? (val / 2.20462) : val;
              return valInKg.toFixed(1);
            }).join(',');

            return {
              exercise: eItem.exerciseId,
              sets: setsCount,
              reps: repsStr,
              weight: weightStr
            };
          });

          return {
            ...sItem,
            restDay: exercisesPayload.length === 0,
            exercises: exercisesPayload
          };
        }

        // Return other days as is
        return {
          ...sItem,
          restDay: sItem.restDay || sItem.exercises.length === 0,
          exercises: sItem.exercises.map((e: any) => ({
            exercise: e.exercise?._id || e.exercise,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight
          }))
        };
      });

      const payload = {
        name: workoutProgram.name,
        difficulty: workoutProgram.difficulty || 'Intermediate',
        durationWeeks: workoutProgram.durationWeeks || 4,
        description: workoutProgram.description || 'My custom split routine.',
        schedule: updatedSchedule
      };

      const putRes = await fetch(`${API_URL}/workouts/custom/${activeProgramId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (putRes.ok) {
        Alert.alert('Success', 'Routine day saved successfully!');
        router.back();
      } else {
        const error = await putRes.json();
        Alert.alert('Error', error.msg || 'Failed to save split.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSelector = () => {
    if (!workoutProgram) return;

    if (workoutProgram.type === 'Preplanned') {
      Alert.alert(
        'Add Exercise',
        'Customizing this day will create a copy of this program under your Custom Routines first. Proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: async () => {
              // Convert to custom first
              setIsLoading(true);
              try {
                const clonePayload = {
                  name: `${workoutProgram.name} (Custom)`,
                  difficulty: workoutProgram.difficulty || 'Intermediate',
                  durationWeeks: workoutProgram.durationWeeks || 4,
                  description: `Customized version of ${workoutProgram.name}.`,
                  schedule: workoutProgram.schedule.map((sItem: any) => ({
                    day: sItem.day,
                    restDay: sItem.restDay || sItem.exercises.length === 0,
                    exercises: sItem.exercises.map((e: any) => ({
                      exercise: e.exercise?._id || e.exercise,
                      sets: e.sets,
                      reps: e.reps,
                      weight: e.weight
                    }))
                  }))
                };

                const createRes = await fetch(`${API_URL}/workouts/custom`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(clonePayload)
                });

                if (createRes.ok) {
                  const savedData = await createRes.json();
                  // Activate cloned split
                  await fetch(`${API_URL}/workouts/select-program/${savedData._id}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  await refreshUser();

                  // Replace the current preplanned screen with the newly created custom screen
                  router.replace({
                    pathname: '/workout/day-detail',
                    params: {
                      programId: savedData._id,
                      dayIdx: dayIdx,
                      dayName: dayName
                    }
                  });

                  // Then push the exercise selector screen on top
                  router.push({
                    pathname: '/exercise/select',
                    params: {
                      dayIdx: dayIdx,
                      customWorkoutId: savedData._id
                    }
                  });
                }
              } catch (e) {
                console.error(e);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } else {
      router.push({
        pathname: '/exercise/select',
        params: {
          dayIdx: dayIdx,
          customWorkoutId: workoutProgram._id
        }
      });
    }
  };

  const handleCompleteSession = async () => {
    if (!token || !workoutProgram) return;
    setIsLoading(true);
    try {
      const localDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/workouts/complete-session`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutId: workoutProgram._id,
          dayName: dayName?.toString(),
          localDate
        })
      });

      if (response.ok) {
        const resData = await response.json();
        await refreshUser();
        
        // Refresh weeklySummary locally
        const statsRes = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setWeeklySummary(statsData.weeklySummary || []);
        }

        Alert.alert(
          'Workout Logged!',
          `Nice job! Streak updated to ${resData.streak} Days!\nEst. Calories: ${resData.caloriesBurned} kcal`,
          [{ text: 'Awesome' }]
        );
      } else {
        const err = await response.json();
        Alert.alert('Error', err.msg || 'Failed to log workout session.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not complete session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExercise = async (exerciseId: string) => {
    if (!token || !workoutProgram) return;
    setIsLoading(true);
    try {
      const localDate = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/workouts/complete-exercise`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutId: workoutProgram._id,
          dayName: dayName?.toString(),
          exerciseId,
          localDate
        })
      });

      if (response.ok) {
        const resData = await response.json();
        await refreshUser();
        
        // Refresh weeklySummary locally
        const statsRes = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setWeeklySummary(statsData.weeklySummary || []);
        }

        Alert.alert(
          'Exercise Completed!',
          `Nice job! Streak updated to ${resData.streak} Days!\nEst. Calories: ${resData.caloriesBurned} kcal`,
          [{ text: 'Awesome' }]
        );
      } else {
        const err = await response.json();
        Alert.alert('Error', err.msg || 'Failed to log exercise.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not log exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = weeklySummary.find(
    (log: any) => log.day?.toLowerCase() === dayName?.toString().toLowerCase() && log.date === todayStr
  );
  const completedExerciseIds = todayLog?.completedExercises || [];

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.backBtnColor} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{dayName?.toString().toUpperCase() || 'WORKOUT DAY'}</Text>
            <Text style={[styles.headerSub, { color: colors.subText }]}>Customize sets, reps, and weights</Text>
          </View>
          <TouchableOpacity onPress={handleSaveRoutine} style={styles.saveBtn}>
            <Check size={22} color="#00A3FF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.solidBg }]}>
            <ActivityIndicator size="large" color={colors.loaderColor} />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              {exercisesList.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }]}>
                  <Dumbbell size={42} color={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255, 255, 255, 0.15)'} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Rest & Recovery Day</Text>
                  <Text style={[styles.emptySub, { color: colors.subText }]}>No exercises scheduled. Tap the button below to add exercises to this day.</Text>
                </View>
              ) : (
                exercisesList.map((exItem, exIdx) => (
                  <View key={exItem.exerciseId + '_' + exIdx} style={[styles.exerciseCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    {/* Exercise Header */}
                    <View style={styles.exHeader}>
                      <View style={styles.exHeaderLeft}>
                        <Text style={[styles.exName, { color: colors.text }]}>{exItem.name}</Text>
                        {!exItem.isCustom && (
                          <TouchableOpacity
                            style={styles.infoBtn}
                            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exItem.exerciseId } })}
                          >
                            <Info size={14} color="#00A3FF" />
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        style={styles.deleteExBtn}
                        onPress={() => handleDeleteExercise(exIdx)}
                      >
                        <Trash2 size={16} color="#FF4B2B" />
                      </TouchableOpacity>
                    </View>

                    {/* Sets Form Table */}
                    <View style={styles.setsTable}>
                      <View style={[styles.tableHeaderRow, { borderBottomColor: colors.borderRow }]}>
                        <Text style={[styles.columnHeader, { flex: 1, color: colors.subText }]}>Set</Text>
                        <Text style={[styles.columnHeader, { flex: 1.5, textAlign: 'center', color: colors.subText }]}>Reps</Text>
                        <Text style={[styles.columnHeader, { flex: 3.6, color: colors.subText, paddingLeft: 8 }]}>Weight</Text>
                        <Text style={[styles.columnHeader, { width: 32 }]}></Text>
                      </View>

                      {exItem.sets.map((setObj: any, setIdx: number) => (
                        <View key={setIdx} style={[styles.setRow, { borderBottomColor: colors.borderRow }]}>
                          {/* Set label */}
                          <Text style={[styles.setLabel, { flex: 1, color: colors.text }]}>{setIdx + 1}</Text>
                          
                          {/* Reps input */}
                          <View style={{ flex: 1.5, marginHorizontal: 4 }}>
                            <TextInput
                              style={[styles.setInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                              value={setObj.reps}
                              onChangeText={(val) => handleUpdateSetField(exIdx, setIdx, 'reps', val)}
                              keyboardType="number-pad"
                              textAlign="center"
                            />
                          </View>

                          {/* Weight input */}
                          <View style={{ flex: 1.8, marginHorizontal: 4 }}>
                            <TextInput
                              style={[styles.setInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                              value={setObj.weight}
                              onChangeText={(val) => handleUpdateSetField(exIdx, setIdx, 'weight', val)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={colors.subText}
                              textAlign="center"
                            />
                          </View>

                          {/* Unit toggle */}
                          <View style={[styles.compactUnitToggle, { backgroundColor: colors.unitToggleBg, borderColor: colors.unitToggleBorder }]}>
                            <TouchableOpacity
                              style={[
                                styles.compactUnitBtn,
                                (setObj.unit || 'kg') === 'kg' && { backgroundColor: colors.unitToggleBtnActive }
                              ]}
                              onPress={() => handleUpdateSetField(exIdx, setIdx, 'unit', 'kg')}
                            >
                              <Text style={[
                                styles.compactUnitText,
                                { color: (setObj.unit || 'kg') === 'kg' ? '#00A3FF' : colors.subText }
                              ]}>kg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.compactUnitBtn,
                                setObj.unit === 'lbs' && { backgroundColor: colors.unitToggleBtnActive }
                              ]}
                              onPress={() => handleUpdateSetField(exIdx, setIdx, 'unit', 'lbs')}
                            >
                              <Text style={[
                                styles.compactUnitText,
                                { color: setObj.unit === 'lbs' ? '#00A3FF' : colors.subText }
                              ]}>lbs</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Delete Set */}
                          <TouchableOpacity
                            style={[styles.deleteSetBtn, { backgroundColor: colors.deleteSetBtnBg }]}
                            onPress={() => handleDeleteSet(exIdx, setIdx)}
                          >
                            <Text style={[styles.deleteSetBtnText, { color: colors.text }]}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    {/* Add Set and Complete Buttons Row */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={[styles.addSetBtn, { backgroundColor: colors.deleteSetBtnBg, borderColor: colors.border }]}
                        onPress={() => handleAddSet(exIdx)}
                      >
                        <Plus size={14} color="#00A3FF" style={{ marginRight: 6 }} />
                        <Text style={[styles.addSetBtnText, { color: isLight ? '#0072FF' : '#00A3FF' }]}>Add Set</Text>
                      </TouchableOpacity>

                      {completedExerciseIds.includes(exItem.exerciseId) ? (
                        <View style={[styles.exerciseCompleteBtn, styles.exerciseCompleteBtnFinished, { backgroundColor: isLight ? 'rgba(0, 200, 83, 0.08)' : 'rgba(0, 200, 83, 0.15)' }]}>
                          <Check size={14} color="#00C853" style={{ marginRight: 6 }} />
                          <Text style={styles.exerciseCompleteBtnTextFinished}>Completed</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.exerciseCompleteBtn}
                          onPress={() => handleCompleteExercise(exItem.exerciseId)}
                        >
                          <Check size={14} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={styles.exerciseCompleteBtnText}>Complete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}

              {/* Add Exercise Trigger Button */}
              <TouchableOpacity
                style={[styles.addExerciseBtn, { backgroundColor: isLight ? '#0072FF' : '#00A3FF', marginBottom: 12 }]}
                onPress={handleOpenSelector}
              >
                <Plus size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
              </TouchableOpacity>

              {exercisesList.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.completeSessionBtn,
                    todayLog ? styles.completeSessionBtnFinished : { backgroundColor: '#FF5733' }
                  ]}
                  onPress={handleCompleteSession}
                  disabled={!!todayLog}
                >
                  <Flame size={16} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.completeSessionBtnText}>
                    {todayLog ? 'Session Logged' : 'Complete & Log Session'}
                  </Text>
                </TouchableOpacity>
              )}


            </ScrollView>
          </KeyboardAvoidingView>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  saveBtn: {
    padding: 6,
    backgroundColor: 'rgba(0, 163, 255, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.15)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.9,
  },
  exName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  infoBtn: {
    marginLeft: 8,
    backgroundColor: 'rgba(0, 163, 255, 0.08)',
    padding: 4,
    borderRadius: 6,
  },
  deleteExBtn: {
    padding: 6,
  },
  setsTable: {
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 6,
    marginBottom: 8,
  },
  columnHeader: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  setLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '700',
  },
  setInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    height: 32,
  },
  weightInputCell: {
    flex: 3.2,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  compactUnitToggle: {
    flex: 1.8,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    height: 32,
    padding: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  compactUnitBtn: {
    flex: 1,
    height: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactUnitBtnActive: {
    backgroundColor: '#00A3FF',
  },
  compactUnitText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  compactUnitTextActive: {
    color: '#FFF',
  },
  deleteSetBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSetBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    lineHeight: 20,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 163, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    flex: 0.48,
  },
  addSetBtnText: {
    color: '#00A3FF',
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5733',
    borderWidth: 1,
    borderColor: '#FF5733',
    borderRadius: 10,
    paddingVertical: 8,
    flex: 0.48,
  },
  exerciseCompleteBtnFinished: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    borderColor: '#00C853',
  },
  exerciseCompleteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseCompleteBtnTextFinished: {
    color: '#00C853',
    fontSize: 12,
    fontWeight: '700',
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3FF',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
  },
  addExerciseBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completeSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 30,
  },
  completeSessionBtnFinished: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    borderWidth: 1,
    borderColor: '#00C853',
  },
  completeSessionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
