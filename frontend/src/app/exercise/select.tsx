import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '../../components/Alert';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Award,
  Flame,
  Heart,
  Activity,
  Shield,
  ArrowLeft,
  Check,
  X,
  Search,
  Plus
} from 'lucide-react-native';

const CATEGORIES = [
  { name: 'Abs', label: 'ABS', icon: Flame, count: '46 EXERCISES', color: '#FF5733', startColor: 'rgba(255, 87, 51, 0.25)' },
  { name: 'Back', label: 'BACK', icon: Award, count: '42 EXERCISES', color: '#8E44AD', startColor: 'rgba(142, 68, 173, 0.25)' },
  { name: 'Biceps', label: 'BICEPS', icon: Dumbbell, count: '43 EXERCISES', color: '#00A3FF', startColor: 'rgba(0, 163, 255, 0.25)' },
  { name: 'Calf', label: 'CALF', icon: Activity, count: '13 EXERCISES', color: '#2ECC71', startColor: 'rgba(46, 204, 113, 0.25)' },
  { name: 'Chest', label: 'CHEST', icon: Heart, count: '33 EXERCISES', color: '#E74C3C', startColor: 'rgba(231, 76, 60, 0.25)' },
  { name: 'Forearms', label: 'FOREARMS', icon: Shield, count: '16 EXERCISES', color: '#F39C12', startColor: 'rgba(243, 156, 18, 0.25)' },
  { name: 'Legs', label: 'LEGS', icon: Activity, count: '48 EXERCISES', color: '#1ABC9C', startColor: 'rgba(26, 188, 156, 0.25)' },
  { name: 'Shoulders', label: 'SHOULDERS', icon: Award, count: '52 EXERCISES', color: '#3498DB', startColor: 'rgba(52, 152, 219, 0.25)' },
  { name: 'Triceps', label: 'TRICEPS', icon: Dumbbell, count: '32 EXERCISES', color: '#95A5A6', startColor: 'rgba(149, 165, 166, 0.25)' },
  { name: 'Cardio', label: 'CARDIO', icon: Activity, count: '28 EXERCISES', color: '#E67E22', startColor: 'rgba(230, 126, 34, 0.25)' }
];

export default function ExerciseSelectScreen() {
  const { token, user, theme } = useAuth();
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatingExercise, setIsCreatingExercise] = useState<string | null>(null);

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
    headerBorder: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)',
    
    // Accordion categories and listings
    catHeaderBorder: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
    expandedBg: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.15)',
    chevronColor: isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    
    // Inputs inside inline lists
    inputBg: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
    inputBorder: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)',
    inputLabelColor: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.35)',
    inlineRowBg: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.25)',
    inlineRowBorder: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.02)',
    
    // Checkbox
    checkboxBorder: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.3)',
    
    // Search
    searchBg: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
    searchBorder: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)',
    searchPlaceholder: isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.3)',
    searchIcon: isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    
    // Custom exercise
    customExBg: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.02)',
  };

  // Retrieve parameters for selection mode
  const params = useLocalSearchParams();
  const dayIdx = params.dayIdx ? parseInt(params.dayIdx as string) : null;
  const customWorkoutId = params.customWorkoutId as string;

  // Selected exercises inside the selector
  // Dictionary format: { [exerciseId]: { sets, reps, weight, selected } }
  const [selections, setSelections] = useState<{ [key: string]: any }>({});

  const fetchAllExercises = async () => {
    // 1. Try to load from cache first
    try {
      const cached = await AsyncStorage.getItem('cached_exercises');
      if (cached) {
        setAllExercises(JSON.parse(cached));
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Failed to load exercises from cache:', e);
    }

    // 2. Fetch fresh copy from server
    try {
      const response = await fetch(`${API_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllExercises(data);
        await AsyncStorage.setItem('cached_exercises', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingSelections = async () => {
    if (!token || !customWorkoutId || dayIdx === null) return;
    try {
      const getRes = await fetch(`${API_URL}/workouts/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (getRes.ok) {
        const customWorkouts = await getRes.json();
        const targetWorkout = customWorkouts.find((w: any) => w._id === customWorkoutId);
        if (targetWorkout) {
          const currentExercises = targetWorkout.schedule[dayIdx]?.exercises || [];
          const initialSelections: { [key: string]: any } = {};
          currentExercises.forEach((eItem: any) => {
            const exId = eItem.exercise?._id || eItem.exercise;
            if (exId) {
              const hasWeight = eItem.weight > 0;
              const displayWeight = hasWeight
                ? (user?.weightUnit === 'lbs' ? Math.round(eItem.weight * 2.20462).toString() : eItem.weight.toString())
                : '';
              initialSelections[exId] = {
                sets: eItem.sets.toString(),
                reps: eItem.reps.toString(),
                weight: displayWeight,
                selected: true,
                hasWeight: hasWeight,
                weightUnit: user?.weightUnit || 'kg'
              };
            }
          });
          setSelections(initialSelections);
        }
      }
    } catch (err) {
      console.error('Error loading existing selections:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllExercises();
    }
  }, [token]);

  useEffect(() => {
    if (token && customWorkoutId && dayIdx !== null) {
      loadExistingSelections();
    } else {
      setSelections({});
    }
  }, [token, customWorkoutId, dayIdx]);

  const toggleCategory = (catName: string) => {
    if (expandedCategory === catName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(catName);
    }
    setSearchQuery('');
  };

  const handleToggleSelection = (exerciseId: string) => {
    setSelections(prev => {
      const existing = prev[exerciseId];
      if (existing) {
        return {
          ...prev,
          [exerciseId]: {
            ...existing,
            selected: !existing.selected
          }
        };
      } else {
        return {
          ...prev,
          [exerciseId]: {
            sets: '3',
            reps: '12',
            weight: '',
            selected: true,
            hasWeight: false,
            weightUnit: user?.weightUnit || 'kg'
          }
        };
      }
    });
  };

  const handleUpdateInputs = (exerciseId: string, field: string, value: string | boolean) => {
    setSelections(prev => {
      const existing = prev[exerciseId] || { sets: '3', reps: '12', weight: '', selected: true };
      return {
        ...prev,
        [exerciseId]: {
          ...existing,
          [field]: value
        }
      };
    });
  };

  const handleCreateCustomExercise = async (name: string, category: string) => {
    if (!token) return;
    setIsCreatingExercise(category);
    try {
      const response = await fetch(`${API_URL}/exercises`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, category }),
      });

      if (response.ok) {
        const newExercise = await response.json();
        // 1. Add to allExercises local state so it renders immediately
        setAllExercises(prev => {
          if (prev.some(ex => ex._id === newExercise._id)) return prev;
          return [...prev, newExercise];
        });

        // 2. Auto-select the newly created exercise
        setSelections(prev => ({
          ...prev,
          [newExercise._id]: {
            sets: '3',
            reps: '12',
            weight: '',
            selected: true,
            hasWeight: false,
            weightUnit: user?.weightUnit || 'kg'
          }
        }));

        // 3. Reset the search query
        setSearchQuery('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.msg || 'Failed to create custom exercise.');
      }
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      Alert.alert('Error', 'Failed to connect to backend server.');
    } finally {
      setIsCreatingExercise(null);
    }
  };

  const handleSaveSelections = async () => {
    if (!token || !customWorkoutId || dayIdx === null) return;
    
    try {
      // 1. Fetch current custom workout details
      const getRes = await fetch(`${API_URL}/workouts/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!getRes.ok) throw new Error('Failed to get custom workouts');
      const customWorkouts = await getRes.json();
      const targetWorkout = customWorkouts.find((w: any) => w._id === customWorkoutId);
      if (!targetWorkout) throw new Error('Custom workout not found');

      // 2. Map selections into exercises array
      const selectedExercisesList: any[] = [];
      Object.keys(selections).forEach((exId) => {
        const data = selections[exId];
        if (data.selected) {
          const rawW = parseFloat(data.weight) || 0;
          const weightInKg = data.hasWeight
            ? (data.weightUnit === 'lbs' ? (rawW / 2.20462) : rawW)
            : 0;
          selectedExercisesList.push({
            exercise: exId,
            sets: parseInt(data.sets) || 3,
            reps: data.reps || '12',
            weight: parseFloat(weightInKg.toFixed(1))
          });
        }
      });

      // 3. Update the specific day
      const updatedSchedule = targetWorkout.schedule.map((item: any, idx: number) => {
        if (idx === dayIdx) {
          return {
            ...item,
            restDay: selectedExercisesList.length === 0,
            exercises: selectedExercisesList
          };
        }
        
        const validExercises = item.exercises
          .map((e: any) => {
            const exId = e.exercise?._id || e.exercise;
            return exId ? {
              exercise: exId,
              sets: e.sets,
              reps: e.reps,
              weight: e.weight
            } : null;
          })
          .filter(Boolean);

        return {
          ...item,
          restDay: item.restDay || validExercises.length === 0,
          exercises: validExercises
        };
      });

      const payload = {
        name: targetWorkout.name,
        difficulty: targetWorkout.difficulty || 'Intermediate',
        durationWeeks: targetWorkout.durationWeeks || 4,
        description: targetWorkout.description || 'My custom split routine.',
        schedule: updatedSchedule
      };

      // 4. Save
      const putRes = await fetch(`${API_URL}/workouts/custom/${customWorkoutId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (putRes.ok) {
        Alert.alert('Success', 'Exercises updated successfully!');
        router.back();
      } else {
        const error = await putRes.json();
        Alert.alert('Error', error.msg || 'Failed to save exercises.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to backend server.');
    }
  };

  const renderCategoryIcon = (IconComponent: any, color: string, startColor: string) => {
    return (
      <View style={[styles.exIconContainer, { backgroundColor: startColor }]}>
        <IconComponent size={20} color={color} />
      </View>
    );
  };

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.headerBorder }]}>
          <View style={styles.selectHeaderRow}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <ArrowLeft size={22} color={colors.backBtnColor} />
            </TouchableOpacity>
            <View style={styles.selectHeaderTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>ADD EXERCISES</Text>
              <Text style={[styles.headerSub, { color: colors.subText }]}>Selecting for Day {dayIdx !== null ? dayIdx + 1 : ''}</Text>
            </View>
            <TouchableOpacity onPress={handleSaveSelections} style={styles.saveSelectionsBtn}>
              <Check size={22} color="#00A3FF" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.solidBg }]}>
            <ActivityIndicator size="large" color={colors.loaderColor} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((cat) => {
              const exercisesInCat = allExercises.filter(
                ex => ex.category.toLowerCase() === cat.name.toLowerCase()
              );
              const isExpanded = expandedCategory === cat.name;

              return (
                <View key={cat.name} style={[styles.categoryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.categoryHeaderRow}
                    onPress={() => toggleCategory(cat.name)}
                  >
                    <View style={styles.categoryLeft}>
                      {renderCategoryIcon(cat.icon, cat.color, cat.startColor)}
                      <View style={styles.categoryInfo}>
                        <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat.label}</Text>
                        <Text style={[styles.categorySub, { color: colors.subText }]}>{exercisesInCat.length} Exercises</Text>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.chevronColor} />
                    ) : (
                      <ChevronDown size={20} color={colors.chevronColor} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.exercisesExpandedList, { borderTopColor: colors.catHeaderBorder, backgroundColor: colors.expandedBg }]}>
                      {/* Category-Specific Search Bar */}
                      <View style={[styles.searchBarContainer, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}>
                        <Search size={16} color={colors.searchIcon} style={styles.searchIcon} />
                        <TextInput
                          style={[styles.searchBarInput, { color: colors.text }]}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder={`Search in ${cat.label}...`}
                          placeholderTextColor={colors.searchPlaceholder}
                          autoCapitalize="words"
                          clearButtonMode="never"
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                            <X size={14} color={colors.searchIcon} />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Filter Exercises */}
                      {(() => {
                        const filteredExercises = exercisesInCat.filter(
                          ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        const hasExactMatch = exercisesInCat.some(
                          ex => ex.name.trim().toLowerCase() === searchQuery.trim().toLowerCase()
                        );

                        return (
                          <>
                            {filteredExercises.length === 0 ? (
                              <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyExercisesText, { color: colors.subText }]}>
                                  {searchQuery.trim().length > 0 ? "No matching exercises." : "No seeded exercises loaded."}
                                </Text>
                              </View>
                            ) : (
                              filteredExercises.map((ex) => {
                                const isSelected = !!selections[ex._id]?.selected;
                                const inputData = selections[ex._id] || { sets: '3', reps: '12', weight: '' };

                                return (
                                  <View key={ex._id} style={[styles.exerciseItemContainer, { borderBottomColor: colors.border }]}>
                                    <TouchableOpacity
                                      style={styles.exerciseItemRow}
                                      onPress={() => handleToggleSelection(ex._id)}
                                    >
                                      <View style={styles.exerciseItemLeft}>
                                        <View style={[
                                          styles.checkbox,
                                          { borderColor: colors.checkboxBorder },
                                          isSelected && styles.checkboxChecked
                                        ]}>
                                          {isSelected && <Check size={10} color="#FFF" />}
                                        </View>
                                        <Text style={[styles.exerciseItemName, { color: colors.text }]}>{ex.name}</Text>
                                      </View>
                                      
                                      <View style={styles.exerciseItemRight}>
                                        <Text style={[styles.exerciseItemDiff, { color: colors.subText }]}>{ex.difficulty}</Text>
                                        {!ex.isCustom && (
                                          <TouchableOpacity 
                                            style={[styles.infoBtn, { backgroundColor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)' }]} 
                                            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: ex._id } })}
                                          >
                                            <Text style={styles.infoBtnText}>Info</Text>
                                          </TouchableOpacity>
                                        )}
                                      </View>
                                    </TouchableOpacity>

                                    {/* Inline sets/reps inputs if selected */}
                                    {isSelected && (
                                      <View style={[styles.inlineInputsRow, { backgroundColor: colors.inlineRowBg, borderTopColor: colors.inlineRowBorder }]}>
                                        <View style={styles.inlineInputGroup}>
                                          <Text style={[styles.inlineInputLabel, { color: colors.inputLabelColor }]}>Sets</Text>
                                          <TextInput
                                            style={[styles.inlineInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                            value={inputData.sets}
                                            onChangeText={(val) => handleUpdateInputs(ex._id, 'sets', val)}
                                            keyboardType="number-pad"
                                          />
                                        </View>

                                        <View style={styles.inlineInputGroup}>
                                          <Text style={[styles.inlineInputLabel, { color: colors.inputLabelColor }]}>Reps</Text>
                                          <TextInput
                                            style={[styles.inlineInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                            value={inputData.reps}
                                            onChangeText={(val) => handleUpdateInputs(ex._id, 'reps', val)}
                                          />
                                        </View>

                                        {!inputData.hasWeight ? (
                                          <View style={styles.addWeightBtnContainer}>
                                            <TouchableOpacity
                                              style={[styles.addWeightBtn, { backgroundColor: isLight ? 'rgba(0, 114, 255, 0.08)' : 'rgba(0, 163, 255, 0.08)', borderColor: isLight ? 'rgba(0, 114, 255, 0.2)' : 'rgba(0, 163, 255, 0.2)' }]}
                                              onPress={() => handleUpdateInputs(ex._id, 'hasWeight', true)}
                                            >
                                              <Text style={[styles.addWeightBtnText, { color: isLight ? '#0072FF' : '#00A3FF' }]}>+ Add Weight</Text>
                                            </TouchableOpacity>
                                          </View>
                                        ) : (
                                          <View style={styles.inlineInputGroupWeight}>
                                            <View style={styles.labelRow}>
                                              <Text style={[styles.inlineInputLabelWeight, { color: colors.inputLabelColor }]}>Weight</Text>
                                              <View style={[styles.compactUnitToggle, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                                <TouchableOpacity
                                                  style={[
                                                    styles.compactUnitBtn,
                                                    (inputData.weightUnit || 'kg') === 'kg' && styles.compactUnitBtnActive
                                                  ]}
                                                  onPress={() => handleUpdateInputs(ex._id, 'weightUnit', 'kg')}
                                                >
                                                  <Text style={[
                                                    styles.compactUnitText,
                                                    { color: (inputData.weightUnit || 'kg') === 'kg' ? '#FFF' : colors.subText }
                                                  ]}>kg</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                  style={[
                                                    styles.compactUnitBtn,
                                                    inputData.weightUnit === 'lbs' && styles.compactUnitBtnActive
                                                  ]}
                                                  onPress={() => handleUpdateInputs(ex._id, 'weightUnit', 'lbs')}
                                                >
                                                  <Text style={[
                                                    styles.compactUnitText,
                                                    { color: inputData.weightUnit === 'lbs' ? '#FFF' : colors.subText }
                                                  ]}>lbs</Text>
                                                </TouchableOpacity>
                                              </View>
                                            </View>

                                            <View style={styles.weightInputAndRemoveRow}>
                                              <TextInput
                                                style={[styles.inlineInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                                value={inputData.weight}
                                                placeholder="0"
                                                placeholderTextColor={colors.subText}
                                                onChangeText={(val) => handleUpdateInputs(ex._id, 'weight', val)}
                                                keyboardType="numeric"
                                              />
                                              <TouchableOpacity
                                                style={[styles.removeWeightBtnCompact, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                                                onPress={() => {
                                                  handleUpdateInputs(ex._id, 'hasWeight', false);
                                                  handleUpdateInputs(ex._id, 'weight', '');
                                                }}
                                              >
                                                <X size={14} color={colors.subText} />
                                              </TouchableOpacity>
                                            </View>
                                          </View>
                                        )}
                                      </View>
                                    )}
                                  </View>
                                );
                              })
                            )}

                            {/* Inline Add Custom Exercise Option */}
                            {!hasExactMatch && searchQuery.trim().length > 0 && (
                              <TouchableOpacity
                                style={[styles.addCustomExRow, { backgroundColor: colors.customExBg, borderColor: cat.color + '33' }]}
                                onPress={() => handleCreateCustomExercise(searchQuery.trim(), cat.name)}
                                disabled={isCreatingExercise !== null}
                              >
                                {isCreatingExercise === cat.name ? (
                                  <ActivityIndicator size="small" color={cat.color} style={{ marginRight: 10 }} />
                                ) : (
                                  <Plus size={16} color={cat.color} style={{ marginRight: 8 }} />
                                )}
                                <Text style={[styles.addCustomExText, { color: cat.color }]}>
                                  Add {`"${searchQuery.trim()}"`} as custom exercise
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    marginLeft: 16,
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categorySub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  exercisesExpandedList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingVertical: 8,
  },
  emptyExercisesText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  exerciseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.8,
  },
  exerciseItemName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseItemDiff: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '700',
  },
  selectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 6,
  },
  selectHeaderTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    padding: 6,
  },
  saveSelectionsBtn: {
    padding: 6,
    backgroundColor: 'rgba(0, 163, 255, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.15)',
  },
  exerciseItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  exerciseItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  infoBtnText: {
    color: '#00A3FF',
    fontSize: 10,
    fontWeight: '700',
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
  inlineInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.02)',
  },
  inlineInputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inlineInputLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  inlineInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 32,
    textAlign: 'center',
  },
  addWeightBtnContainer: {
    flex: 1.5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
    marginLeft: 10,
  },
  addWeightBtn: {
    backgroundColor: 'rgba(0, 163, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
    borderRadius: 8,
    width: '100%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWeightBtnText: {
    color: '#00A3FF',
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInputLabelWeight: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inlineInputGroupWeight: {
    flex: 1.8,
    marginHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    height: 18,
  },
  compactUnitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    height: 18,
    padding: 1,
    alignItems: 'center',
  },
  compactUnitBtn: {
    paddingHorizontal: 6,
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
  weightInputAndRemoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  removeWeightBtnCompact: {
    marginLeft: 6,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
  },
  searchClearBtn: {
    padding: 4,
  },
  addCustomExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addCustomExText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
