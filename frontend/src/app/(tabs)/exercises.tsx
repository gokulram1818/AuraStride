import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Award,
  Flame,
  Heart,
  Activity,
  Shield
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

export default function ExercisesScreen() {
  const { token, theme } = useAuth();
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRow: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.02)',
    categoryTitleColor: isLight ? '#1C1C1E' : '#FFF',
    chevronColor: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)',
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    expandedListBg: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.15)',
  };

  const fetchAllExercises = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllExercises();
    }
  }, [token]);

  const toggleCategory = (catName: string) => {
    if (expandedCategory === catName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(catName);
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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Exercises</Text>
          <Text style={[styles.headerSub, { color: colors.subText }]}>Select a muscle group to view step instructions.</Text>
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
                        <Text style={[styles.categoryTitle, { color: colors.categoryTitleColor }]}>{cat.label}</Text>
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
                    <View style={[styles.exercisesExpandedList, { backgroundColor: colors.expandedListBg, borderTopColor: colors.border }]}>
                      {exercisesInCat.length === 0 ? (
                        <Text style={[styles.emptyExercisesText, { color: colors.subText }]}>No seeded exercises loaded.</Text>
                      ) : (
                        exercisesInCat.map((ex) => {
                          return (
                            <View key={ex._id} style={[styles.exerciseItemContainer, { borderBottomColor: colors.borderRow }]}>
                              <TouchableOpacity
                                style={[styles.exerciseItemRow, { borderBottomColor: colors.borderRow }]}
                                onPress={() => {
                                  if (!ex.isCustom) {
                                    router.push({ pathname: '/exercise/[id]', params: { id: ex._id } });
                                  }
                                }}
                                activeOpacity={ex.isCustom ? 1 : 0.7}
                              >
                                <View style={styles.exerciseItemLeft}>
                                  <Dumbbell size={14} color="#00A3FF" style={{ marginRight: 10 }} />
                                  <Text style={[styles.exerciseItemName, { color: colors.text }]}>{ex.name}</Text>
                                </View>
                                
                                <View style={styles.exerciseItemRight}>
                                  <Text style={[styles.exerciseItemDiff, { color: colors.subText }]}>{ex.difficulty}</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          );
                        })
                      )}
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
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 4,
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
  exerciseItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  exerciseItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
