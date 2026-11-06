import React, { useState } from 'react';

import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { SpeedUnit, formatSpeed } from './src/utils/speedUtils';

import { useSpeedTracking } from './src/hooks/useSpeedTracking';

const COLORS = {
  background: '#0B1110',
  card: '#151F1C',
  cardLight: '#1C2924',
  green: '#45D483',
  text: '#FFFFFF',
  secondary: '#91A39A',
  border: '#293832',
  red: '#FF6464',
};

const App = () => {
  const [unit, setUnit] = useState<SpeedUnit>('kmh');

  const {
    isTracking,
    currentSpeed,
    maxSpeed,
    averageSpeed,
    accuracy,
    error,
    startTracking,
    stopTracking,
    resetTracking,
  } = useSpeedTracking();

  const unitLabel = unit === 'kmh' ? 'km/h' : 'mph';

  const renderStat = (label: string, value: number, icon: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>

      <Text style={styles.statLabel}>{label}</Text>

      <View style={styles.statValueContainer}>
        <Text style={styles.statValue}>{formatSpeed(value, unit)}</Text>

        <Text style={styles.statUnit}>{unitLabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>
              SPEED<Text style={styles.greenText}>TRACKER</Text>
            </Text>

            <Text style={styles.subtitle}>Your GPS speedometer</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isTracking ? '#183C2B' : COLORS.card,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isTracking ? COLORS.green : COLORS.secondary,
                },
              ]}
            />

            <Text style={styles.statusText}>
              {isTracking ? 'ACTIVE' : 'STOPPED'}
            </Text>
          </View>
        </View>

        {/* Speedometer */}

        <View style={styles.speedCard}>
          <Text style={styles.speedHeading}>CURRENT SPEED</Text>

          <View style={styles.speedValueContainer}>
            <Text style={styles.speedValue}>
              {formatSpeed(currentSpeed, unit)}
            </Text>
          </View>

          <Text style={styles.speedUnit}>{unit}</Text>

          {/* Unit selector */}

          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'kmh' && styles.selectedUnit]}
              onPress={() => setUnit('kmh')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  unit === 'kmh' && styles.selectedUnitText,
                ]}
              >
                KM/H
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.unitButton, unit === 'mph' && styles.selectedUnit]}
              onPress={() => setUnit('mph')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  unit === 'mph' && styles.selectedUnitText,
                ]}
              >
                MPH
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}

        <Text style={styles.sectionTitle}>SESSION STATISTICS</Text>

        <View style={styles.statsGrid}>
          {renderStat('MAX SPEED', maxSpeed, '↗')}

          {renderStat('AVERAGE SPEED', averageSpeed, '∿')}
        </View>

        {/* GPS accuracy */}

        <View style={styles.gpsCard}>
          <View>
            <Text style={styles.gpsTitle}>GPS ACCURACY</Text>

            <Text style={styles.gpsDescription}>
              {accuracy !== null
                ? `± ${accuracy.toFixed(1)} metres`
                : 'Waiting for GPS signal'}
            </Text>
          </View>

          <View style={styles.gpsIndicator}>
            <View
              style={[
                styles.gpsDot,
                {
                  backgroundColor:
                    accuracy !== null && accuracy <= 35
                      ? COLORS.green
                      : '#E5B454',
                },
              ]}
            />

            <Text style={styles.gpsIndicatorText}>
              {accuracy !== null && accuracy <= 35 ? 'GOOD' : 'SEARCHING'}
            </Text>
          </View>
        </View>

        {/* Error message */}

        {error !== null && <Text style={styles.errorText}>{error}</Text>}

        {/* Controls */}

        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: isTracking ? COLORS.red : COLORS.green,
            },
          ]}
          onPress={isTracking ? stopTracking : startTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>
            {isTracking ? 'STOP TRACKING' : 'START TRACKING'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetTracking}
          disabled={isTracking}
        >
          <Text
            style={[
              styles.resetButtonText,
              {
                opacity: isTracking ? 0.4 : 1,
              },
            ]}
          >
            RESET SESSION
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>SPEED TRACKER • POWERED BY GPS</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  appTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.2,
  },

  greenText: {
    color: COLORS.green,
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  statusText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },

  speedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 25,
    paddingVertical: 35,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  speedHeading: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  speedValueContainer: {
    marginTop: 20,
  },

  speedValue: {
    color: COLORS.text,
    fontSize: 86,
    fontWeight: '900',
    letterSpacing: -4,
    fontVariant: ['tabular-nums'],
  },

  speedUnit: {
    color: COLORS.green,
    fontSize: 19,
    fontWeight: '800',
    marginTop: -5,
  },

  unitSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: 12,
    marginTop: 30,
    gap: 5,
  },

  unitButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 9,
  },

  selectedUnit: {
    backgroundColor: COLORS.green,
  },

  unitButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
  },

  selectedUnitText: {
    color: COLORS.background,
  },

  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 30,
    marginBottom: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statIcon: {
    color: COLORS.green,
    fontSize: 21,
    marginBottom: 14,
  },

  statLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
  },

  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 9,
    gap: 4,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  statUnit: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
  },

  gpsCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  gpsTitle: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 11,
  },

  gpsDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 6,
  },

  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
  },

  gpsIndicatorText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },

  errorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },

  mainButton: {
    marginTop: 28,
    paddingVertical: 19,
    borderRadius: 15,
    alignItems: 'center',
  },

  mainButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  resetButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  resetButtonText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  footer: {
    color: '#53645B',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1.5,
  },
});

export default App;
