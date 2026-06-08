import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
// Alert is kept for the maintenance mode confirmation dialog (destructive action)
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../../services/firebase/storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSizes, FontWeights } from '../../constants/fonts';
import { Spacing, BorderRadius, Shadows } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { getChurchSettings, updateChurchSettings } from '../../services/firebase/admin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

type SettingsTab = 'church' | 'notifications' | 'giving' | 'content' | 'admins';

const TABS: Array<{ value: SettingsTab; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { value: 'church', label: 'Church', icon: 'home-outline' },
  { value: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { value: 'giving', label: 'Giving', icon: 'cash-outline' },
  { value: 'content', label: 'Content', icon: 'document-text-outline' },
  { value: 'admins', label: 'Admins', icon: 'shield-outline' },
];

const CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP'];
const TRANSLATIONS = ['NIV', 'KJV', 'ESV', 'NLT', 'NKJV'];
const MODERATION_OPTIONS = ['Manual', 'Auto', 'Off'];

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  danger?: boolean;
}

function ToggleRow({ label, subtitle, value, onToggle, danger }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, danger && { color: Colors.error }]}>{label}</Text>
        {subtitle ? <Text style={styles.toggleSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.gray300, true: danger ? Colors.error : Colors.primaryLight }}
        thumbColor={value ? (danger ? Colors.error : Colors.primary) : Colors.white}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('church');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const showStatus = (ok: boolean, msg: string) => {
    setSaveStatus({ ok, msg });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Logo upload
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  // Church settings
  const [churchName, setChurchName] = useState('TOPIC Digital');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Notification settings
  const [dailyDevotional, setDailyDevotional] = useState(true);
  const [devotionalTime, setDevotionalTime] = useState('07:00');
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  // Giving settings
  const [currency, setCurrency] = useState('ETB');
  const [givingGoal, setGivingGoal] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');

  // Content settings
  const [defaultTranslation, setDefaultTranslation] = useState('NIV');
  const [moderation, setModeration] = useState('Manual');

  // Admin settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingLogo(true);
    try {
      const url = await uploadFile(result.assets[0].uri, 'church/logo.jpg', (p) => {
        setLogoUploadProgress(p);
      });
      setLogoUrl(url);
      await updateChurchSettings({ logoUrl: url });
      showStatus(true, 'Church logo updated.');
    } catch {
      showStatus(false, 'Could not upload logo. Try again.');
    } finally {
      setIsUploadingLogo(false);
      setLogoUploadProgress(0);
    }
  };

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getChurchSettings();
      if (settings.logoUrl) setLogoUrl(settings.logoUrl as string);
      if (settings.churchName) setChurchName(settings.churchName as string);
      if (settings.tagline) setTagline(settings.tagline as string);
      if (settings.location) setLocation(settings.location as string);
      if (settings.website) setWebsite(settings.website as string);
      if (settings.contactEmail) setContactEmail(settings.contactEmail as string);
      if (settings.contactPhone) setContactPhone(settings.contactPhone as string);
      if (settings.currency) setCurrency(settings.currency as string);
      if (settings.givingGoal) setGivingGoal(String(settings.givingGoal));
      if (settings.receiptEmail) setReceiptEmail(settings.receiptEmail as string);
      if (settings.defaultTranslation) setDefaultTranslation(settings.defaultTranslation as string);
      if (settings.moderation) setModeration(settings.moderation as string);
      if (typeof settings.maintenanceMode === 'boolean') setMaintenanceMode(settings.maintenanceMode);
      if (typeof settings.dailyDevotional === 'boolean') setDailyDevotional(settings.dailyDevotional);
      if (settings.devotionalTime) setDevotionalTime(settings.devotionalTime as string);
      if (typeof settings.prayerReminders === 'boolean') setPrayerReminders(settings.prayerReminders);
      if (typeof settings.eventReminders === 'boolean') setEventReminders(settings.eventReminders);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadSettings().finally(() => setIsLoading(false));
  }, [loadSettings]);

  const handleSaveChurch = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateChurchSettings({
        churchName, tagline, location, website, contactEmail, contactPhone,
        ...(logoUrl ? { logoUrl } : {}),
      });
      showStatus(true, 'Church settings saved.');
    } catch {
      showStatus(false, 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [churchName, tagline, location, website, contactEmail, contactPhone]);

  const handleSaveNotifications = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateChurchSettings({ dailyDevotional, devotionalTime, prayerReminders, eventReminders });
      showStatus(true, 'Notification settings saved.');
    } catch {
      showStatus(false, 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [dailyDevotional, devotionalTime, prayerReminders, eventReminders]);

  const handleSaveGiving = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateChurchSettings({ currency, givingGoal: Number(givingGoal) || 0, receiptEmail });
      showStatus(true, 'Giving settings saved.');
    } catch {
      showStatus(false, 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [currency, givingGoal, receiptEmail]);

  const handleSaveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateChurchSettings({ defaultTranslation, moderation });
      showStatus(true, 'Content settings saved.');
    } catch {
      showStatus(false, 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [defaultTranslation, moderation]);

  const handleToggleMaintenance = useCallback((val: boolean) => {
    if (val) {
      Alert.alert(
        'Enable Maintenance Mode',
        'This will make the app show a maintenance message to all users. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'destructive',
            onPress: async () => {
              setMaintenanceMode(true);
              try {
                await updateChurchSettings({ maintenanceMode: true });
              } catch {
                setMaintenanceMode(false);
                showStatus(false, 'Failed to enable maintenance mode.');
              }
            },
          },
        ]
      );
    } else {
      setMaintenanceMode(false);
      updateChurchSettings({ maintenanceMode: false }).catch(() => {
        setMaintenanceMode(true);
        showStatus(false, 'Failed to disable maintenance mode.');
      });
    }
  }, []);

  const renderSaveButton = (onPress: () => void) => (
    <TouchableOpacity
      style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={isSaving}
      activeOpacity={0.8}
    >
      {isSaving ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <>
          <Ionicons name="checkmark-outline" size={16} color={Colors.white} />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderOptionSelector = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (val: string) => void
  ) => (
    <FormField label={label}>
      <View style={styles.optionGroup}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, selected === opt && styles.optionBtnActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionBtnText, selected === opt && styles.optionBtnTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </FormField>
  );

  const renderChurchTab = () => (
    <View style={styles.formSection}>
      {/* Church Logo */}
      <FormField label="Church Logo">
        {logoUrl ? (
          <View style={styles.logoPreviewWrap}>
            <Image source={{ uri: logoUrl }} style={styles.logoPreview} resizeMode="contain" />
            <TouchableOpacity style={styles.logoReplaceBtn} onPress={pickLogo} disabled={isUploadingLogo}>
              <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              <Text style={styles.logoReplaceBtnText}>Replace Logo</Text>
            </TouchableOpacity>
          </View>
        ) : isUploadingLogo ? (
          <View style={styles.logoUploadProgress}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.logoUploadProgressText}>Uploading… {Math.round(logoUploadProgress * 100)}%</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.logoUploadBtn} onPress={pickLogo}>
            <Ionicons name="image-outline" size={22} color={Colors.primary} />
            <Text style={styles.logoUploadBtnText}>Upload Church Logo</Text>
          </TouchableOpacity>
        )}
      </FormField>

      <FormField label="Church Name">
        <TextInput
          style={styles.input}
          value={churchName}
          onChangeText={setChurchName}
          placeholder="Church name..."
          placeholderTextColor={Colors.gray400}
        />
      </FormField>
      <FormField label="Tagline">
        <TextInput
          style={styles.input}
          value={tagline}
          onChangeText={setTagline}
          placeholder="Your church tagline..."
          placeholderTextColor={Colors.gray400}
        />
      </FormField>
      <FormField label="Location">
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="City, Country"
          placeholderTextColor={Colors.gray400}
        />
      </FormField>
      <FormField label="Website">
        <TextInput
          style={styles.input}
          value={website}
          onChangeText={setWebsite}
          placeholder="https://..."
          placeholderTextColor={Colors.gray400}
          autoCapitalize="none"
          keyboardType="url"
        />
      </FormField>
      <FormField label="Contact Email">
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="admin@church.com"
          placeholderTextColor={Colors.gray400}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </FormField>
      <FormField label="Contact Phone">
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="+251 91 234 5678"
          placeholderTextColor={Colors.gray400}
          keyboardType="phone-pad"
        />
      </FormField>
      {renderSaveButton(handleSaveChurch)}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.formSection}>
      <ToggleRow
        label="Daily Devotional Reminder"
        subtitle="Send daily reminder to read devotional"
        value={dailyDevotional}
        onToggle={setDailyDevotional}
      />
      {dailyDevotional && (
        <FormField label="Reminder Time (HH:MM)" hint="24-hour format, e.g. 07:00">
          <TextInput
            style={styles.input}
            value={devotionalTime}
            onChangeText={setDevotionalTime}
            placeholder="07:00"
            placeholderTextColor={Colors.gray400}
          />
        </FormField>
      )}
      <ToggleRow
        label="Prayer Reminders"
        subtitle="Remind members to pray daily"
        value={prayerReminders}
        onToggle={setPrayerReminders}
      />
      <ToggleRow
        label="Event Reminders"
        subtitle="Notify members of upcoming events"
        value={eventReminders}
        onToggle={setEventReminders}
      />
      {renderSaveButton(handleSaveNotifications)}
    </View>
  );

  const renderGivingTab = () => (
    <View style={styles.formSection}>
      {renderOptionSelector('Currency', CURRENCIES, currency, setCurrency)}
      <FormField label="Annual Giving Goal" hint="Leave blank if no goal is set">
        <TextInput
          style={styles.input}
          value={givingGoal}
          onChangeText={setGivingGoal}
          placeholder="e.g. 500000"
          placeholderTextColor={Colors.gray400}
          keyboardType="numeric"
        />
      </FormField>
      <FormField label="Receipt Email" hint="Email where donation receipts are sent">
        <TextInput
          style={styles.input}
          value={receiptEmail}
          onChangeText={setReceiptEmail}
          placeholder="giving@church.com"
          placeholderTextColor={Colors.gray400}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </FormField>
      {renderSaveButton(handleSaveGiving)}
    </View>
  );

  const renderContentTab = () => (
    <View style={styles.formSection}>
      {renderOptionSelector('Default Bible Translation', TRANSLATIONS, defaultTranslation, setDefaultTranslation)}
      {renderOptionSelector('Content Moderation', MODERATION_OPTIONS, moderation, setModeration)}
      <View style={styles.moderationNote}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
        <Text style={styles.moderationNoteText}>
          {moderation === 'Manual'
            ? 'Manual: All user content requires approval before publishing.'
            : moderation === 'Auto'
            ? 'Auto: Content is published immediately with automated moderation.'
            : 'Off: No moderation — all content is published without review.'}
        </Text>
      </View>
      {renderSaveButton(handleSaveContent)}
    </View>
  );

  const renderAdminsTab = () => (
    <View>
      <View style={styles.formSection}>
        <View style={styles.adminInfo}>
          <View style={styles.adminAvatarWrap}>
            <Text style={styles.adminAvatarText}>
              {(user?.displayName ?? user?.email ?? 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.adminDetails}>
            <Text style={styles.adminName}>{user?.displayName ?? 'Admin'}</Text>
            <Text style={styles.adminEmail}>{user?.email ?? ''}</Text>
            <View style={styles.adminRoleBadge}>
              <Text style={styles.adminRoleBadgeText}>{user?.role?.toUpperCase() ?? 'ADMIN'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.inviteBtn} onPress={() => Alert.alert('Coming Soon', 'Admin invite feature coming soon.')}>
          <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
          <Text style={styles.inviteBtnText}>Invite Admin</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.formSection, styles.dangerSection]}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <ToggleRow
          label="Maintenance Mode"
          subtitle="Show maintenance screen to all users"
          value={maintenanceMode}
          onToggle={handleToggleMaintenance}
          danger
        />
        {maintenanceMode && (
          <View style={styles.maintenanceWarning}>
            <Ionicons name="warning" size={16} color={Colors.error} />
            <Text style={styles.maintenanceWarningText}>
              Maintenance mode is ON. Regular users cannot access the app.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.versionSection}>
        <Text style={styles.versionText}>TOPIC Digital Admin v1.0.0</Text>
        <Text style={styles.versionSub}>Built with Expo + Firebase</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        style={styles.tabBarWrapper}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.value ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {saveStatus && (
        <View style={[styles.statusBanner, { backgroundColor: saveStatus.ok ? '#16A34A' : '#EF4444' }]}>
          <Ionicons name={saveStatus.ok ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={16} color="#fff" />
          <Text style={styles.statusBannerText}>{saveStatus.msg}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing['2xl'] }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.tabContent}>
            {activeTab === 'church' && renderChurchTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'giving' && renderGivingTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'admins' && renderAdminsTab()}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.white },
  tabBarWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 56,
  },
  tabBar: {
    gap: Spacing[1],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },
  tabActive: {
    backgroundColor: Colors.light,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.primary },
  scrollView: { flex: 1 },
  tabContent: {
    paddingTop: Spacing[5],
    paddingHorizontal: isTablet ? Spacing[8] : Spacing[5],
    paddingBottom: Spacing[5],
  },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...(Shadows.sm as object),
  },
  formField: { gap: Spacing[2] },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  fieldHint: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  toggleInfo: { flex: 1, marginRight: Spacing[4] },
  toggleLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  optionBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  optionBtnTextActive: { color: Colors.white },
  moderationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: Colors.infoLight,
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
  },
  moderationNoteText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.info,
    lineHeight: FontSizes.xs * 1.6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
  },
  saveBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  adminAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  adminDetails: { flex: 1, gap: 3 },
  adminName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  adminEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  adminRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  adminRoleBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  inviteBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  dangerSection: {
    marginTop: Spacing[4],
    borderColor: Colors.error + '40',
  },
  dangerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  maintenanceWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: '#FEE2E2',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  maintenanceWarningText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.error,
    lineHeight: FontSizes.xs * 1.6,
    fontWeight: FontWeights.medium,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: Spacing[5],
    gap: Spacing[1],
  },
  versionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  versionSub: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
  },
  statusBannerText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#fff',
    fontWeight: FontWeights.medium,
  },
  logoPreviewWrap: {
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoReplaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  logoReplaceBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  logoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
  },
  logoUploadBtnText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
  },
  logoUploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
  },
  logoUploadProgressText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
