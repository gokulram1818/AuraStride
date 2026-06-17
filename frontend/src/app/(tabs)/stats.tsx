import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { Alert } from '../../components/Alert';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, LinearGradient as SvgGradient, Stop, Circle, Defs } from 'react-native-svg';
import { TrendingUp, Plus, Trash2, Calendar, Scale, Award, ArrowDown, ArrowUp, X } from 'lucide-react-native';

export default function StatsScreen() {
  const { token, user, theme } = useAuth();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);

  const isLight = theme === 'Light Theme';
  const isAmoled = theme === 'AMOLED Black';

  const colors = {
    bg: (isLight ? ['#F5F7FA', '#E4E8F0'] : (isAmoled ? ['#000000', '#050508'] : ['#090A0F', '#121420'])) as [string, string],
    text: isLight ? '#1C1C1E' : '#FFF',
    subText: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.4)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRow: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    cardBg: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.03)',
    cardBorder: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.06)',
    chartFallbackText: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)',
    chartStroke: isLight ? '#0072FF' : '#00A3FF',
    chartText: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)',
    chartPointFill: isLight ? '#FFFFFF' : '#090A0F',
    
    // Solid background and loaders
    solidBg: isLight ? '#F5F7FA' : (isAmoled ? '#000000' : '#090A0F'),
    loaderColor: isLight ? '#0072FF' : '#00A3FF',
    
    // Inputs and Modals
    inputLabel: isLight ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.6)',
    inputBg: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
    inputBorder: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
    modalOverlayBg: isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.75)',
    modalBg: isLight ? '#FFFFFF' : '#121420',
    backBtnColor: isLight ? '#1C1C1E' : '#FFF',
    progressTrackBg: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const localDate = new Date().toISOString().split('T')[0];
      
      // 1. Fetch dashboard stats
      const dashRes = await fetch(`${API_URL}/stats/dashboard?localDate=${localDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboardData(dashData);
      }

      // 2. Fetch weight logs list
      const weightRes = await fetch(`${API_URL}/stats/weight`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (weightRes.ok) {
        const logsData = await weightRes.json();
        setWeightLogs(logsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [token])
  );

  const handleLogWeight = async () => {
    if (!inputWeight || isNaN(Number(inputWeight))) {
      Alert.alert('Validation Error', 'Please enter a valid weight number');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/stats/weight`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weight: parseFloat(inputWeight),
          date: inputDate
        })
      });

      if (response.ok) {
        setIsLogModalOpen(false);
        setInputWeight('');
        Alert.alert('Weight Logged', 'Successfully updated weight log!');
        fetchData(); // Reload stats
      } else {
        const error = await response.json();
        Alert.alert('Error', error.msg || 'Failed to save weight entry');
      }
    } catch (error) {
      Alert.alert('Error', 'Server connection failure');
    }
  };

  const handleDeleteWeightLog = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Remove this weight entry from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/stats/weight/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                fetchData(); // Reload stats
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete weight entry');
            }
          }
        }
      ]
    );
  };

  // Helper: custom Svg Bezier Path builder for line chart
  const renderLineChart = () => {
    const progress = dashboardData?.weight?.progress || [];
    if (progress.length < 2) {
      return (
        <View style={styles.chartFallback}>
          <Text style={[styles.chartFallbackText, { color: colors.chartFallbackText }]}>Log weight on multiple days to generate chart progress.</Text>
        </View>
      );
    }

    const chartWidth = 320;
    const chartHeight = 120;
    const padding = 15;
    
    const weights = progress.map((p: any) => p.weight);
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const range = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;

    const points = progress.map((p: any, idx: number) => {
      const x = padding + (idx / (progress.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((p.weight - minWeight) / range) * (chartHeight - padding * 2);
      return { x, y, weight: p.weight, date: p.date };
    });

    // Create bezier curve line string
    let linePathStr = `M ${points[0].x} ${points[0].y}`;
    let fillPathStr = `M ${points[0].x} ${chartHeight} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Control points for bezier curve
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;

      linePathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      fillPathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    fillPathStr += ` L ${points[points.length - 1].x} ${chartHeight} Z`;

    return (
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00A3FF" stopOpacity={isLight ? 0.15 : 0.3} />
              <Stop offset="100%" stopColor="#00A3FF" stopOpacity="0" />
            </SvgGradient>
            <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#0072FF" />
              <Stop offset="100%" stopColor="#00A3FF" />
            </SvgGradient>
          </Defs>

          {/* Gradient Fill under Line */}
          <Path d={fillPathStr} fill="url(#chartFill)" />

          {/* Bezier Path Line */}
          <Path d={linePathStr} fill="none" stroke="url(#lineGrad)" strokeWidth={3} />

          {/* Coordinates Nodes (Circles) */}
          {points.map((pt: any, idx: number) => (
            <Circle key={idx} cx={pt.x} cy={pt.y} r={4} fill={colors.chartPointFill} stroke="#0072FF" strokeWidth={2} />
          ))}
        </Svg>
        <View style={styles.chartDatesRow}>
          <Text style={[styles.chartDateLabel, { color: colors.chartText }]}>{points[0].date.substring(5)}</Text>
          <Text style={[styles.chartDateLabel, { color: colors.chartText }]}>{points[points.length - 1].date.substring(5)}</Text>
        </View>
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

  const startingW = dashboardData?.weight?.starting || user?.startingWeight || 70;
  const currentW = dashboardData?.weight?.current || user?.weight || startingW;
  const targetW = dashboardData?.weight?.target || user?.targetWeight || startingW;
  const weightUnit = dashboardData?.weightUnit || user?.weightUnit || 'kg';

  const totalChangeTarget = targetW - startingW;
  const currentChange = currentW - startingW;
  const goalType = dashboardData?.goal?.name || user?.goal || 'General Fitness';
  const progressPercentage = dashboardData?.goal?.completionPercentage || 0;

  // Weight insight calculations
  const weightChangeDelta = parseFloat((currentW - startingW).toFixed(1));
  const isLoss = goalType === 'Weight Loss';
  const progressStatus = weightChangeDelta === 0 
    ? 'Maintenance' 
    : weightChangeDelta < 0 
    ? `${Math.abs(weightChangeDelta)} ${weightUnit} lost` 
    : `${weightChangeDelta} ${weightUnit} gained`;

  return (
    <LinearGradient colors={colors.bg} style={styles.container}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Tracker</Text>
          <TouchableOpacity
            style={styles.logWeightBtn}
            onPress={() => setIsLogModalOpen(true)}
          >
            <Plus size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.logWeightBtnText}>Log Weight</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Weight Stats Card */}
          <View style={[styles.weightDashboardCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.weightColumn}>
              <Text style={[styles.weightColumnLbl, { color: colors.subText }]}>Starting</Text>
              <Text style={[styles.weightColumnVal, { color: colors.text }]}>{startingW} {weightUnit}</Text>
            </View>
            <View style={[styles.weightColumn, styles.weightColumnCenter]}>
              <Text style={[styles.weightColumnCenterLbl, { color: colors.subText }]}>Current</Text>
              <Text style={[styles.weightColumnCenterVal, { color: colors.text }]}>{currentW} {weightUnit}</Text>
              <View style={styles.statusIndicator}>
                {weightChangeDelta < 0 ? (
                  <ArrowDown size={12} color="#00C853" />
                ) : weightChangeDelta > 0 ? (
                  <ArrowUp size={12} color="#FF5733" />
                ) : null}
                <Text style={[styles.statusText, weightChangeDelta < 0 ? { color: '#00C853' } : { color: '#FF5733' }]}>
                  {progressStatus}
                </Text>
              </View>
            </View>
            <View style={styles.weightColumn}>
              <Text style={[styles.weightColumnLbl, { color: colors.subText }]}>Target</Text>
              <Text style={[styles.weightColumnVal, { color: colors.text }]}>{targetW} {weightUnit}</Text>
            </View>
          </View>

          {/* Goal Progress Ring / Bar */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goal Progress</Text>
            <View style={[styles.goalCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.goalInfo}>
                <Award size={20} color="#FFD700" />
                <Text style={[styles.goalText, { color: colors.text }]}>Goal Type: {goalType}</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={[styles.progressTrack, { backgroundColor: colors.progressTrackBg }]}>
                  <View style={[styles.progressIndicator, { width: `${progressPercentage}%` }]} />
                </View>
                <Text style={[styles.progressVal, { color: colors.text }]}>{progressPercentage}%</Text>
              </View>
              <Text style={[styles.timelineText, { color: colors.subText }]}>
                Timeline Target: {dashboardData?.goal?.timelineWeeks || user?.targetTimelineWeeks || 8} weeks
              </Text>
            </View>
          </View>

          {/* Bezier Chart */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weight Trend</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 20 }]}>
              {renderLineChart()}
            </View>
          </View>

          {/* Weight Log History List */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Log History</Text>
            {weightLogs.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Scale size={24} color={colors.subText} />
                <Text style={[styles.emptyText, { color: colors.subText }]}>No weight logs recorded.</Text>
              </View>
            ) : (
              [...weightLogs].reverse().map((log) => (
                <View key={log._id} style={[styles.historyRow, { borderBottomColor: colors.borderRow }]}>
                  <View style={styles.historyInfo}>
                    <Calendar size={16} color={colors.subText} />
                    <Text style={[styles.historyDate, { color: colors.text }]}>
                      {new Date(log.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyWeight, { color: colors.text }]}>{log.weight} {weightUnit}</Text>
                    <TouchableOpacity
                      style={styles.deleteHistoryBtn}
                      onPress={() => handleDeleteWeightLog(log._id)}
                    >
                      <Trash2 size={16} color="rgba(255, 75, 43, 0.6)" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

        </ScrollView>

        {/* ==================== WEIGHT LOGGING MODAL ==================== */}
        <Modal
          visible={isLogModalOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setIsLogModalOpen(false)}
        >
          <View style={[styles.pickerOverlay, { backgroundColor: colors.modalOverlayBg }]}>
            <View style={[styles.logModalCard, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Log Weight</Text>
                <TouchableOpacity onPress={() => setIsLogModalOpen(false)}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.inputLabel }]}>Weight ({weightUnit})</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder={weightUnit === 'kg' ? "e.g. 68.5" : "e.g. 150"}
                    placeholderTextColor={colors.subText}
                    keyboardType="numeric"
                    value={inputWeight}
                    onChangeText={setInputWeight}
                    autoFocus
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.inputLabel }]}>Date</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={inputDate}
                    onChangeText={setInputDate}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveWeightBtn}
                  onPress={handleLogWeight}
                >
                  <Text style={styles.saveWeightBtnText}>Save Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logWeightBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  weightDashboardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 24,
  },
  weightColumn: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightColumnCenter: {
    width: '40%',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  weightColumnLbl: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  weightColumnVal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  weightColumnCenterLbl: {
    color: '#00A3FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weightColumnCenterVal: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 18,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#00A3FF',
    borderRadius: 4,
  },
  progressVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
    width: 36,
    textAlign: 'right',
  },
  timelineText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartFallback: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chartFallbackText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  chartDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 290,
    marginTop: 8,
  },
  chartDateLabel: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    marginTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyWeight: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 14,
  },
  deleteHistoryBtn: {
    padding: 4,
  },

  // Modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logModalCard: {
    width: '85%',
    backgroundColor: '#121420',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
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
  saveWeightBtn: {
    backgroundColor: '#00A3FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveWeightBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
