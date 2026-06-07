import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { getDonationHistory, getGivingSummary, GIVING_CATEGORIES } from '../../services/firebase/giving';
import { initializeChapaPayment, openChapaCheckout } from '../../services/chapa';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Analytics } from '../../services/analytics';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatNumber } from '../../utils/format';
import { formatDate } from '../../utils/date';
import type { Donation } from '../../types';

type GivingTab = 'give' | 'history';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function GivingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<GivingTab>('give');
  const [selectedCategory, setSelectedCategory] = useState<string>('tithe');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState({ totalThisMonth: 0, totalThisYear: 0, totalAllTime: 0, lastGiftDate: null as Date | null });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const submitScale = useSharedValue(1);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, user]);

  const loadHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const [hist, sum] = await Promise.all([
        getDonationHistory(user.uid),
        getGivingSummary(user.uid),
      ]);
      setDonations(hist);
      setSummary(sum);
    } catch (e) {
      // silent
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleQuickAmount = (val: number) => {
    Haptics.selectionAsync();
    setAmount(String(val));
    setCustomAmount('');
  };

  const handleCustomAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCustomAmount(cleaned);
    setAmount(cleaned);
  };

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  const handleSubmit = async () => {
    if (!user || !isValidAmount) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitScale.value = withSpring(0.95, {}, () => {
      submitScale.value = withSpring(1);
    });

    setIsSubmitting(true);
    try {
      // Create a pending donation document first (get its ID)
      const donationRef = await addDoc(collection(db, 'donations'), {
        userId: user.uid,
        amount: parsedAmount,
        currency: 'ETB',
        type: selectedCategory,
        status: 'pending',
        note: note.trim() || null,
        isAnonymous,
        createdAt: new Date().toISOString(),
      });

      const nameParts = (user.displayName ?? 'Church Member').split(' ');

      Analytics.givingInitiated(selectedCategory);

      // Call Cloud Function to get Chapa checkout URL
      const { checkoutUrl } = await initializeChapaPayment({
        amount: parsedAmount,
        currency: 'ETB',
        email: user.email ?? `${user.uid}@topic.app`,
        firstName: nameParts[0] ?? 'Church',
        lastName: nameParts[1] ?? 'Member',
        title: `${GIVING_CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? 'Offering'} - TOPIC`,
        donationId: donationRef.id,
        callbackPath: '/giving',
      });

      setIsSubmitting(false);

      // Open Chapa checkout in browser
      const result = await openChapaCheckout(checkoutUrl);

      if (result === 'completed') {
        Analytics.givingCompleted(selectedCategory, parsedAmount);
        Alert.alert(
          'Thank You!',
          `Your ${GIVING_CATEGORIES.find((c) => c.id === selectedCategory)?.label?.toLowerCase() ?? 'offering'} of ETB ${parsedAmount.toLocaleString()} has been received. God bless you!`,
          [{ text: 'Done', onPress: () => { setAmount(''); setCustomAmount(''); setNote(''); loadHistory(); } }]
        );
      } else if (result === 'cancelled') {
        Alert.alert('Payment Cancelled', 'Your payment was not completed. You can try again.');
      } else {
        Alert.alert(
          'Payment Processing',
          'Your payment is being processed. It will appear in your history once confirmed.',
          [{ text: 'OK', onPress: loadHistory }]
        );
      }
    } catch (error: unknown) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : 'Unknown error';
      // Fallback: if Cloud Functions not deployed, explain clearly
      if (message.includes('NOT_FOUND') || message.includes('not found')) {
        Alert.alert(
          'Setup Required',
          'Payment processing requires Cloud Functions to be deployed. See PAYMENT_SETUP_GUIDE.md for setup instructions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment Error', `Could not process payment: ${message}`);
      }
    }
  };

  const submitAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  const selectedCategoryObj = GIVING_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#16A34A', '#15803D']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Give</Text>
            <Text style={styles.headerSubtitle}>Generous giving, abundant life</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Tab switcher inside header */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'give' && styles.tabActive]}
            onPress={() => setActiveTab('give')}
          >
            <Text style={[styles.tabText, activeTab === 'give' && styles.tabTextActive]}>Give</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'give' ? (
            <>
              {/* Scripture verse */}
              <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.verseCard}>
                <Text style={styles.verseText}>"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."</Text>
                <Text style={styles.verseRef}>2 Corinthians 9:7</Text>
              </Animated.View>

              {/* Category Selection */}
              <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
                <Text style={styles.sectionTitle}>Giving Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
                  {GIVING_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                      onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat.id); }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={selectedCategory === cat.id ? Colors.white : Colors.primary}
                      />
                      <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedCategoryObj?.description && (
                  <Text style={styles.categoryDesc}>{selectedCategoryObj.description}</Text>
                )}
              </Animated.View>

              {/* Amount */}
              <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                <Text style={styles.sectionTitle}>Amount</Text>

                {/* Big amount display */}
                <View style={styles.amountDisplay}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Text style={styles.amountText}>{amount || '0.00'}</Text>
                </View>

                {/* Quick amounts */}
                <View style={styles.quickAmountsGrid}>
                  {QUICK_AMOUNTS.map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.quickAmountBtn, amount === String(val) && styles.quickAmountBtnActive]}
                      onPress={() => handleQuickAmount(val)}
                    >
                      <Text style={[styles.quickAmountText, amount === String(val) && styles.quickAmountTextActive]}>
                        ${val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom amount input */}
                <View style={styles.customAmountRow}>
                  <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.customAmountInput}
                    placeholder="Custom amount"
                    placeholderTextColor={Colors.gray400}
                    value={customAmount}
                    onChangeText={handleCustomAmount}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </Animated.View>

              {/* Options */}
              <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
                <Text style={styles.sectionTitle}>Options</Text>

                <View style={styles.optionCard}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => { Haptics.selectionAsync(); setIsAnonymous((v) => !v); }}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons name="eye-off-outline" size={20} color={Colors.primary} />
                      <View>
                        <Text style={styles.optionLabel}>Give Anonymously</Text>
                        <Text style={styles.optionDesc}>Your name won't appear in public records</Text>
                      </View>
                    </View>
                    <View style={[styles.toggle, isAnonymous && styles.toggleActive]}>
                      <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <View style={styles.noteRow}>
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add a note (optional)"
                      placeholderTextColor={Colors.gray400}
                      value={note}
                      onChangeText={setNote}
                      multiline
                      maxLength={200}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Submit */}
              <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.submitSection, submitAnimStyle]}>
                <TouchableOpacity
                  style={[styles.submitBtn, (!isValidAmount || isSubmitting) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!isValidAmount || isSubmitting}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isValidAmount ? ['#16A34A', '#15803D'] : ['#9CA3AF', '#6B7280']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name={isSubmitting ? 'hourglass-outline' : 'heart'} size={20} color={Colors.white} />
                    <Text style={styles.submitText}>
                      {isSubmitting ? 'Processing...' : isValidAmount ? `Give ${formatCurrency(parsedAmount)}` : 'Enter an Amount'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.secureNote}>
                  <Ionicons name="lock-closed-outline" size={11} color={Colors.textSecondary} /> Secure & encrypted giving
                </Text>
              </Animated.View>
            </>
          ) : (
            /* History Tab */
            <>
              {/* Summary cards */}
              <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.totalThisMonth)}</Text>
                  <Text style={styles.summaryLabel}>This Month</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.totalThisYear)}</Text>
                  <Text style={styles.summaryLabel}>This Year</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.totalAllTime)}</Text>
                  <Text style={styles.summaryLabel}>All Time</Text>
                </View>
              </Animated.View>

              {/* Donations list */}
              <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
                <Text style={styles.sectionTitle}>Giving History</Text>
                {isLoadingHistory ? (
                  <View style={styles.loadingBox}>
                    <Ionicons name="hourglass-outline" size={24} color={Colors.gray400} />
                    <Text style={styles.loadingText}>Loading history...</Text>
                  </View>
                ) : donations.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="heart-outline" size={40} color={Colors.gray400} />
                    <Text style={styles.emptyTitle}>No gifts yet</Text>
                    <Text style={styles.emptyDesc}>Your giving history will appear here</Text>
                    <TouchableOpacity style={styles.emptyAction} onPress={() => setActiveTab('give')}>
                      <Text style={styles.emptyActionText}>Make Your First Gift</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  donations.map((donation, i) => {
                    const cat = GIVING_CATEGORIES.find((c) => c.id === donation.category);
                    return (
                      <Animated.View key={donation.id} entering={FadeInDown.delay(i * 50).springify()} style={styles.donationItem}>
                        <View style={[styles.donationIcon, { backgroundColor: Colors.light }]}>
                          <Ionicons name={(cat?.icon ?? 'heart') as any} size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.donationInfo}>
                          <Text style={styles.donationCategory}>{cat?.label ?? donation.category}</Text>
                          <Text style={styles.donationDate}>{formatDate(donation.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        </View>
                        <Text style={styles.donationAmount}>{formatCurrency(donation.amount)}</Text>
                      </Animated.View>
                    );
                  })
                )}
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: Spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  backBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.xl,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255,255,255,0.8)',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing[4],
  },
  verseCard: {
    margin: Spacing[5],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: Spacing[2],
  },
  verseText: {
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  verseRef: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  categoriesRow: {
    gap: Spacing[2],
    paddingBottom: Spacing[1],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  categoryDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    borderColor: Colors.light,
  },
  currencySymbol: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: 8,
    marginRight: 4,
  },
  amountText: {
    fontSize: 52,
    fontWeight: FontWeights.black,
    color: Colors.textPrimary,
    lineHeight: 60,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  quickAmountBtn: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  quickAmountBtnActive: {
    backgroundColor: Colors.light,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  quickAmountTextActive: {
    color: Colors.primary,
  },
  customAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customAmountInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  optionDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...(Shadows.sm as object),
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[4],
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    padding: Spacing[4],
  },
  noteInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitSection: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  submitBtn: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
  },
  submitText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  secureNote: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    paddingTop: Spacing[4],
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[3],
    alignItems: 'center',
    gap: Spacing[1],
    ...(Shadows.sm as object),
  },
  summaryValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.black,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing[2],
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing[3],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyAction: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius.full,
  },
  emptyActionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  donationIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationInfo: {
    flex: 1,
    gap: 2,
  },
  donationCategory: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  donationDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  donationAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
});
