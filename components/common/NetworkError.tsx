import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/layout';

interface NetworkErrorProps {
  onRetry: () => void;
  visible?: boolean;
}

export function NetworkError({ onRetry, visible = true }: NetworkErrorProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="wifi-outline" size={48} color={Colors.gray400} />
          </View>
          <Text style={styles.title}>No Connection</Text>
          <Text style={styles.message}>
            It looks like you're offline. Check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color={Colors.white} />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[8],
    alignItems: 'center',
    width: '100%',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
  },
  buttonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
});
