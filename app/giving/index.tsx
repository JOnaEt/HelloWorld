import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/layout';

export default function GivingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giving</Text>
      </View>

      <View style={styles.body}>
        <LinearGradient
          colors={['#DCFCE7', '#F0FDF4']}
          style={styles.card}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="heart" size={48} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Giving Coming Soon</Text>

          <Text style={styles.message}>
            Secure online giving will be available after payment platform
            approval and final testing.
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Secure & encrypted transactions</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="phone-portrait-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Telebirr, CBE Birr & bank transfer support</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Instant digital receipts</Text>
          </View>
        </LinearGradient>

        <Text style={styles.footnote}>
          To give now, please contact the church office or give in person during services.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[8],
    gap: Spacing[5],
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: Spacing[3],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.primary + '20',
    marginVertical: Spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    alignSelf: 'stretch',
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  footnote: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
