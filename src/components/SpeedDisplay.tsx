import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS, SPACING, RADIUS } from '../constants/theme';

import { SpeedUnit, formatSpeed } from '../utils/speedUtils';

interface SpeedDisplayProps {
  speed: number;
  unit: SpeedUnit;
  onUnitChange: (unit: SpeedUnit) => void;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({
  speed,
  unit,
  onUnitChange,
}) => {
  const renderUnitButton = (selectedUnit: SpeedUnit, label: string) => {
    const selected = unit === selectedUnit;

    return (
      <TouchableOpacity
        style={[styles.unitButton, selected && styles.selectedUnit]}
        onPress={() => onUnitChange(selectedUnit)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.unitButtonText, selected && styles.selectedUnitText]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>CURRENT SPEED</Text>

      <Text style={styles.speedValue} adjustsFontSizeToFit numberOfLines={1}>
        {formatSpeed(speed, unit)}
      </Text>

      <Text style={styles.speedUnit}>{unit === 'kmh' ? 'km/h' : 'mph'}</Text>

      <View style={styles.unitSelector}>
        {renderUnitButton('kmh', 'KM/H')}
        {renderUnitButton('mph', 'MPH')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingVertical: 35,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  heading: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  speedValue: {
    color: COLORS.text,
    fontSize: 86,
    fontWeight: '900',
    letterSpacing: -4,
    marginTop: 20,
    fontVariant: ['tabular-nums'],
  },

  speedUnit: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
    marginTop: -5,
  },

  unitSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: RADIUS.md,
    marginTop: 30,
    gap: 5,
  },

  unitButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
  },

  selectedUnit: {
    backgroundColor: COLORS.primary,
  },

  unitButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
  },

  selectedUnitText: {
    color: COLORS.background,
  },
});

export default SpeedDisplay;
