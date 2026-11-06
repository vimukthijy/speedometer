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

// Components
import SpeedDisplay from './src/components/SpeedDisplay';
import StatCard from './src/components/StatCard';

// Hook
import { useSpeedTracking } from './src/hooks/useSpeedTracking';

// Theme
import { COLORS, SPACING, RADIUS } from './src/constants/theme';

// Utilities
import { SpeedUnit } from './src/utils/speedUtils';

const App: React.FC = () => {
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

  const isGpsAvailable = accuracy !== null && accuracy <= 35;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>
              SPEED<Text style={styles.greenText}>TRACKER</Text>
            </Text>

            <Text style={styles.subtitle}>Your GPS speedometer</Text>
          </View>

          <View style={[styles.statusBadge, isTracking && styles.activeBadge]}>
            <View style={[styles.statusDot, isTracking && styles.activeDot]} />

            <Text style={styles.statusText}>
              {isTracking ? 'ACTIVE' : 'STOPPED'}
            </Text>
          </View>
        </View>

        {/* CURRENT SPEED */}

        <SpeedDisplay speed={currentSpeed} unit={unit} onUnitChange={setUnit} />

        {/* SESSION STATISTICS */}

        <Text style={styles.sectionTitle}>SESSION STATISTICS</Text>

        <View style={styles.statsGrid}>
          <StatCard title="MAX SPEED" value={maxSpeed} unit={unit} icon="↗" />

          <StatCard
            title="AVERAGE SPEED"
            value={averageSpeed}
            unit={unit}
            icon="∿"
          />
        </View>

        {/* GPS ACCURACY */}

        <View style={styles.gpsCard}>
          <View style={styles.gpsInfo}>
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
                  backgroundColor: isGpsAvailable
                    ? COLORS.primary
                    : COLORS.warning,
                },
              ]}
            />

            <Text style={styles.gpsIndicatorText}>
              {isGpsAvailable
                ? 'GOOD'
                : accuracy !== null
                ? 'WEAK'
                : 'SEARCHING'}
            </Text>
          </View>
        </View>

        {/* ERROR MESSAGE */}

        {error !== null && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* START / STOP BUTTON */}

        <TouchableOpacity
          style={[styles.mainButton, isTracking && styles.stopButton]}
          onPress={isTracking ? stopTracking : startTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>
            {isTracking ? 'STOP TRACKING' : 'START TRACKING'}
          </Text>
        </TouchableOpacity>

        {/* RESET BUTTON */}

        <TouchableOpacity
          style={[styles.resetButton, isTracking && styles.resetButtonDisabled]}
          onPress={resetTracking}
          disabled={isTracking}
          activeOpacity={0.75}
        >
          <View style={styles.resetIconWrapper}>
            <Text style={styles.resetIcon}>↻</Text>
          </View>

          <View style={styles.resetButtonContent}>
            <Text style={styles.resetButtonText}>RESET SESSION</Text>

            <Text style={styles.resetButtonHint}>
              {isTracking
                ? 'Stop tracking before resetting'
                : 'Clear current session statistics'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* FOOTER */}

        {/* <Text style={styles.footer}>SPEED TRACKER • POWERED BY GPS</Text> */}
      </ScrollView>
    </SafeAreaView>
  );
};

// STYLES

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  // Header

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },

  appTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.2,
  },

  greenText: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 5,
  },

  // Tracking status

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    gap: 7,
  },

  activeBadge: {
    backgroundColor: COLORS.primaryDark,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },

  activeDot: {
    backgroundColor: COLORS.primary,
  },

  statusText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },

  // Statistics

  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  // GPS accuracy

  gpsCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  gpsInfo: {
    flex: 1,
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

  // Error

  errorContainer: {
    backgroundColor: '#351D20',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },

  errorText: {
    color: COLORS.red,
    fontSize: 12,
    textAlign: 'center',
  },

  // Main button

  mainButton: {
    marginTop: 28,
    paddingVertical: 19,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },

  stopButton: {
    backgroundColor: COLORS.red,
  },

  mainButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Footer

  footer: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1.5,
  },

  // Reset button

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,

    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,

    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },

  resetButtonDisabled: {
    opacity: 0.4,
  },

  resetIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetIcon: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '700',
  },

  resetButtonContent: {
    alignItems: 'flex-start',
  },

  resetButtonText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  resetButtonHint: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 4,
  },
});

export default App;
