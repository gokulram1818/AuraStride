import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OnboardingSurveyScreen() {
  const { submitSurvey } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Survey State variables
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [targetWeight, setTargetWeight] = useState('');
  const [targetTimelineWeeks, setTargetTimelineWeeks] = useState('8');

  // Recommendation view states
  const [recommendationResult, setRecommendationResult] = useState<any | null>(null);

  const handleHeightUnitChange = (newUnit: 'cm' | 'inches') => {
    if (newUnit === heightUnit) return;
    setHeightUnit(newUnit);
    if (height && !isNaN(Number(height))) {
      const val = parseFloat(height);
      if (newUnit === 'inches') {
        setHeight((val / 2.54).toFixed(1));
      } else {
        setHeight((val * 2.54).toFixed(1));
      }
    }
  };

  const handleWeightUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    if (weight && !isNaN(Number(weight))) {
      const val = parseFloat(weight);
      if (newUnit === 'lbs') {
        setWeight((val * 2.20462).toFixed(1));
      } else {
        setWeight((val / 2.20462).toFixed(1));
      }
    }
    if (targetWeight && !isNaN(Number(targetWeight))) {
      const val = parseFloat(targetWeight);
      if (newUnit === 'lbs') {
        setTargetWeight((val * 2.20462).toFixed(1));
      } else {
        setTargetWeight((val / 2.20462).toFixed(1));
      }
    }
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1 && !gender) {
      setErrorMsg('Please select your gender');
      return;
    }
    if (step === 2) {
      if (!age || !height || !weight) {
        setErrorMsg('Please fill in age, height, and weight');
        return;
      }
      if (isNaN(Number(age)) || isNaN(Number(height)) || isNaN(Number(weight))) {
        setErrorMsg('Please enter valid numeric values');
        return;
      }
    }
    if (step === 3 && !experienceLevel) {
      setErrorMsg('Please select your fitness level');
      return;
    }
    if (step === 4 && !goal) {
      setErrorMsg('Please select your primary fitness goal');
      return;
    }
    if (step === 5) {
      if (!targetWeight || !targetTimelineWeeks) {
        setErrorMsg('Please enter target weight and timeline');
        return;
      }
      if (isNaN(Number(targetWeight)) || isNaN(Number(targetTimelineWeeks))) {
        setErrorMsg('Please enter valid numeric values');
        return;
      }
      handleSubmit();
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const surveyData = {
        gender,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        heightUnit,
        weightUnit,
        experienceLevel,
        goal,
        targetWeight: parseFloat(targetWeight),
        targetTimelineWeeks: parseInt(targetTimelineWeeks)
      };

      // Call API
      await submitSurvey(surveyData);
      
      // Calculate locally with unit conversion to show the review card before redirecting
      const weightVal = parseFloat(weight);
      const heightVal = parseFloat(height);
      const weightInKg = (weightUnit === 'lbs') ? (weightVal * 0.453592) : weightVal;
      const heightInMeters = (heightUnit === 'inches') ? ((heightVal * 2.54) / 100) : (heightVal / 100);
      const calculatedBmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
      
      const recommendedName = 'My Custom Split';
      const programDesc = 'Your custom routine split. Every day is set as a rest day by default so you can build your own program.';

      setRecommendationResult({
        bmi: calculatedBmi,
        programName: recommendedName,
        description: programDesc
      });
      setStep(6); // Go to recommendation display step
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit onboarding survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishOnboarding = () => {
    router.replace('/(tabs)/home');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Select your gender</Text>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.selectOption, gender === g && styles.selectedOption]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.optionText, gender === g && styles.selectedOptionText]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Tell us about yourself</Text>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 24"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Height ({heightUnit})</Text>
                <View style={styles.unitToggleContainer}>
                  <TouchableOpacity
                    style={[styles.unitToggleBtn, heightUnit === 'cm' && styles.unitToggleBtnActive]}
                    onPress={() => handleHeightUnitChange('cm')}
                  >
                    <Text style={[styles.unitToggleText, heightUnit === 'cm' && styles.unitToggleTextActive]}>cm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitToggleBtn, heightUnit === 'inches' && styles.unitToggleBtnActive]}
                    onPress={() => handleHeightUnitChange('inches')}
                  >
                    <Text style={[styles.unitToggleText, heightUnit === 'inches' && styles.unitToggleTextActive]}>in</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={heightUnit === 'cm' ? "e.g. 175" : "e.g. 70"}
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Current Weight ({weightUnit})</Text>
                <View style={styles.unitToggleContainer}>
                  <TouchableOpacity
                    style={[styles.unitToggleBtn, weightUnit === 'kg' && styles.unitToggleBtnActive]}
                    onPress={() => handleWeightUnitChange('kg')}
                  >
                    <Text style={[styles.unitToggleText, weightUnit === 'kg' && styles.unitToggleTextActive]}>kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitToggleBtn, weightUnit === 'lbs' && styles.unitToggleBtnActive]}
                    onPress={() => handleWeightUnitChange('lbs')}
                  >
                    <Text style={[styles.unitToggleText, weightUnit === 'lbs' && styles.unitToggleTextActive]}>lbs</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={weightUnit === 'kg' ? "e.g. 70" : "e.g. 154"}
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>What is your fitness experience?</Text>
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.selectOption, experienceLevel === level && styles.selectedOption]}
                onPress={() => setExperienceLevel(level)}
              >
                <Text style={[styles.optionText, experienceLevel === level && styles.selectedOptionText]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Choose your main goal</Text>
            {['Weight Loss', 'Weight Gain', 'Muscle Gain', 'General Fitness'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.selectOption, goal === g && styles.selectedOption]}
                onPress={() => setGoal(g)}
              >
                <Text style={[styles.optionText, goal === g && styles.selectedOptionText]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Set your targets</Text>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Target Weight ({weightUnit})</Text>
              <TextInput
                style={styles.textInput}
                placeholder={weightUnit === 'kg' ? "e.g. 65" : "e.g. 143"}
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Timeline (Weeks)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 8"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={targetTimelineWeeks}
                onChangeText={setTargetTimelineWeeks}
                keyboardType="number-pad"
              />
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.successTitle}>Profile Calculated!</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Your Computed BMI</Text>
              <Text style={styles.resultValue}>{recommendationResult?.bmi}</Text>
              <Text style={styles.resultSubtitle}>
                {recommendationResult?.bmi < 18.5
                  ? 'Underweight'
                  : recommendationResult?.bmi < 25
                  ? 'Normal Weight'
                  : recommendationResult?.bmi < 30
                  ? 'Overweight'
                  : 'Obese'}
              </Text>
            </View>

            <Text style={styles.recommendationHeader}>Recommended Workout Plan</Text>
            <View style={styles.programCard}>
              <Text style={styles.programName}>{recommendationResult?.programName}</Text>
              <Text style={styles.programDesc}>{recommendationResult?.description}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#090A0F', '#1A1C29']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {step < 6 && (
            <>
              <Text style={styles.stepIndicator}>Step {step} of 5</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
              </View>
            </>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 6 ? (
            <View style={styles.footerButtons}>
              {step > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextBtn, step === 1 && { width: '100%' }]}
                onPress={nextStep}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#0072FF', '#FF5733']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextBtnGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.nextBtnText}>{step === 5 ? 'Calculate BMI' : 'Continue'}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinishOnboarding}>
              <LinearGradient
                colors={['#0072FF', '#FF5733']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>Enter Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A3FF',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepContainer: {
    width: '100%',
  },
  question: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  selectOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    borderColor: '#00A3FF',
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#00A3FF',
    fontWeight: '700',
  },
  inputWrapper: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 75, 43, 0.15)',
    borderColor: '#FF4B2B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF7b60',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: '30%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    width: '65%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  finishBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  successTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultValue: {
    color: '#00A3FF',
    fontSize: 48,
    fontWeight: '900',
  },
  resultSubtitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  recommendationHeader: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  programCard: {
    backgroundColor: 'rgba(255, 87, 51, 0.08)',
    borderColor: 'rgba(255, 87, 51, 0.2)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  programName: {
    color: '#FF5733',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  programDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
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
  unitToggleTextActive: {
    color: '#00A3FF',
  },
});
