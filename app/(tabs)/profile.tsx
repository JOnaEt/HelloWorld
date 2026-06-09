import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar, CircularProgress } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { uploadProfilePhoto } from '../../services/firebase/storage';
import { formatNumber, formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();

  // Edit Profile modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!user) return null;

  const growthScore = user.spiritualGrowthScore;
  const growthProgress = Math.min(growthScore / 1000, 1);

  const openEditProfile = () => {
    setEditName(user.displayName ?? '');
    setEditPhone(user.phoneNumber ?? '');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a valid name (at least 2 characters).');
      return;
    }
    setIsUpdating(true);
    try {
      await updateProfile({
        displayName: editName.trim(),
        ...(editPhone.trim() ? { phoneNumber: editPhone.trim() } : {}),
      });
      setEditVisible(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingPhoto(true);
    try {
      const photoURL = await uploadProfilePhoto(result.assets[0].uri, user.uid);
      await updateProfile({ photoURL });
    } catch {
      Alert.alert('Error', 'Could not upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const stats = [
    { label: 'Devotionals', value: user.stats.totalDevotionalsRead, icon: 'book-outline', color: Colors.primary },
    { label: 'Listened', value: user.stats.totalDevotionalsListened, icon: 'headset-outline', color: '#0EA5E9' },
    { label: 'Prayers', value: user.stats.totalPrayersSubmitted, icon: 'hand-right-outline', color: '#8B5CF6' },
    { label: 'Streak', value: user.stats.currentStreak, icon: 'flame-outline', color: '#F59E0B', suffix: 'd' },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: openEditProfile },
    { icon: 'notifications-outline', label: 'Notification Settings', onPress: () => {} },
    { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About TOPIC Digital', onPress: () => {} },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <LinearGradient
          colors={Colors.gradientPrimary}
          style={styles.profileHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileHeaderInner}>
            <Avatar uri={user.photoURL} name={user.displayName} size="2xl" showBorder />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.displayName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Badge
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  variant="primary"
                  size="sm"
                />
              </View>
            </View>
          </View>
          <Text style={styles.joinDate}>
            Member since {formatDate(user.joinedAt, { month: 'long', year: 'numeric' })}
          </Text>
        </LinearGradient>

        {/* Spiritual Growth Ring */}
        <View style={styles.growthCard}>
          <View style={styles.growthLeft}>
            <CircularProgress
              progress={growthProgress}
              size={90}
              strokeWidth={8}
              color={Colors.primary}
              trackColor={Colors.light}
            >
              <Text style={styles.growthScore}>{growthScore}</Text>
              <Text style={styles.growthScoreLabel}>pts</Text>
            </CircularProgress>
          </View>
          <View style={styles.growthRight}>
            <Text style={styles.growthTitle}>Spiritual Growth</Text>
            <Text style={styles.growthSubtitle}>
              {growthScore < 100
                ? 'Just getting started! Keep exploring.'
                : growthScore < 300
                ? 'Growing in faith steadily.'
                : growthScore < 600
                ? 'Making great progress!'
                : 'Outstanding spiritual growth!'}
            </Text>
            <View style={styles.growthBar}>
              <ProgressBar progress={growthProgress} height={6} />
              <Text style={styles.growthNext}>
                {Math.max(0, 1000 - growthScore)} pts to next level
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>
                {formatNumber(stat.value)}{stat.suffix ?? ''}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Giving Summary */}
        <View style={styles.givingCard}>
          <View style={styles.givingHeader}>
            <Ionicons name="heart" size={18} color={Colors.error} />
            <Text style={styles.givingTitle}>Digital Giving</Text>
          </View>
          <Text style={styles.givingComingSoon}>
            Online giving coming soon. Give in person or contact the church office.
          </Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.menuItem,
                i < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Admin Panel - only visible for admin/pastor/leader roles */}
        {(user.role === 'admin' || user.role === 'pastor' || user.role === 'leader') && (
          <TouchableOpacity
            style={styles.adminPanelBtn}
            onPress={() => router.push('/(admin)' as Parameters<typeof router.push>[0])}
            activeOpacity={0.8}
          >
            <View style={styles.adminPanelLeft}>
              <View style={styles.adminPanelIconBox}>
                <Ionicons name="shield-checkmark" size={22} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.adminPanelLabel}>Admin Panel</Text>
                <Text style={styles.adminPanelSub}>Manage church content & members</Text>
              </View>
            </View>
            <View style={styles.adminRoleBadge}>
              <Text style={styles.adminRoleBadgeText}>
                {user.role.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TOPIC Digital v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.editModalClose}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Photo */}
            <View style={styles.editPhotoRow}>
              <Avatar uri={user.photoURL} name={user.displayName} size="xl" showBorder />
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handleChangePhoto}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                    <Text style={styles.changePhotoBtnText}>Change Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor={Colors.gray400}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={Colors.gray400}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleSaveProfile}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveProfileBtn, isUpdating && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveProfileBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  profileHeader: {
    padding: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  profileHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.black,
    color: Colors.white,
  },
  profileEmail: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  roleBadge: {
    marginTop: 4,
  },
  joinDate: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  growthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Spacing[5],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    gap: Spacing[4],
    ...(Shadows.base as object),
  },
  growthLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthScore: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  growthScoreLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  growthRight: {
    flex: 1,
    gap: Spacing[2],
  },
  growthTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  growthSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  growthBar: {
    gap: 4,
  },
  growthNext: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    gap: Spacing[1],
    ...(Shadows.sm as object),
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  givingCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    gap: Spacing[3],
    ...(Shadows.sm as object),
  },
  givingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  givingTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  givingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  givingStat: {
    flex: 1,
    alignItems: 'center',
  },
  givingValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  givingLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  givingBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
  },
  givingBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  givingComingSoon: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing[2],
  },
  menuSection: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...(Shadows.sm as object),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  adminPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    ...(Shadows.base as object),
  },
  adminPanelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  adminPanelIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminPanelLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  adminPanelSub: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  adminRoleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  adminRoleBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    letterSpacing: 0.8,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    marginHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: Spacing[4],
  },
  signOutText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  editModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  editModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  changePhotoBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  editField: {
    gap: Spacing[2],
  },
  editFieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  saveProfileBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
  },
  saveProfileBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});
