import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { COLORS, SPACING, RADIUS } from '../constants/theme';

import { SpeedUnit, formatSpeed } from '../utils/speedUtils';

interface StatCardProps {
  title: string;
  value: number;
  unit: SpeedUnit;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{formatSpeed(value, unit)}</Text>

        <Text style={styles.unit}>{unit === 'kmh' ? 'km/h' : 'mph'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  icon: {
    color: COLORS.primary,
    fontSize: 21,
    marginBottom: 14,
  },

  title: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 9,
    gap: 4,
  },

  value: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  unit: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default StatCard;
