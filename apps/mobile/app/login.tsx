import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Search, Check, Apple, Smartphone } from 'lucide-react-native';

import { Input, Screen, GradientButton } from '../src/components';
import { useT, useDirectionalStyles } from '../src/i18n';
import { useRegionStore } from '../src/stores/regionStore';
import { useAuthStore } from '../src/stores/authStore';
import {
  COUNTRIES,
  dialCodeFor,
  flagEmoji,
  resolveDefaultCountry,
  type Country,
} from '../src/lib/countries';
import { digitsOnly, formatAsYouType, validateMobile } from '../src/lib/phone';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const regionCode = useRegionStore((s) => s.regionCode);
  const loginAs = useAuthStore((s) => s.login);
  const defaultCountry = useMemo(() => resolveDefaultCountry(regionCode), [regionCode]);

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [national, setNational] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const digits = digitsOnly(national);
  const validation = useMemo(() => validateMobile(digits, country.code), [digits, country.code]);
  const showError = digits.length > 0 && !validation.valid;

  const onChange = (text: string) => {
    const capped = digitsOnly(text).slice(0, country.nationalLength);
    setNational(formatAsYouType(capped, country.code));
  };

  const onPickCountry = (next: Country) => {
    setCountry(next);
    setPickerOpen(false);
    setSearch('');
    setNational(formatAsYouType(digitsOnly(national).slice(0, next.nationalLength), next.code));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        dialCodeFor(item.code).includes(q.replace('+', '')),
    );
  }, [search]);

  const onContinue = () => {
    if (!validation.e164) return;
    router.push({ pathname: '/otp', params: { phone: validation.e164 } });
  };

  const onSocial = () => {
    loginAs(`+${dialCodeFor(country.code)}0000000000`);
    router.replace(route('/permissions'));
  };

  const onGuest = () => router.replace(route('/permissions'));

  return (
    <Screen keyboardAvoiding>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <ChevronLeft size={26} color={c.text.primary} />
      </Pressable>

      <View style={styles.flex}>
        <Text style={[styles.title, dir.textAlign]}>{t('auth.phoneTitle')}</Text>
        <Text style={[styles.subtitle, dir.textAlign]}>{t('auth.phoneSubtitle')}</Text>

        <Input
          label={t('auth.phonePlaceholder')}
          value={national}
          onChangeText={onChange}
          placeholder="7123 456789"
          keyboardType="phone-pad"
          autoFocus
          error={showError ? 'Enter a valid mobile number' : undefined}
          left={
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={[styles.prefix, dir.row]}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.prefixFlag}>{flagEmoji(country.code)}</Text>
              <Text style={styles.prefixText}>+{dialCodeFor(country.code)}</Text>
              <ChevronDown size={14} color={c.text.muted} />
            </Pressable>
          }
        />

        <GradientButton
          label={t('auth.sendCode')}
          disabled={!validation.valid}
          onPress={onContinue}
          style={styles.cta}
        />

        <View style={[styles.divider, dir.row]}>
          <View style={styles.line} />
          <Text style={styles.or}>{t('auth.or')}</Text>
          <View style={styles.line} />
        </View>

        <SocialRow
          Icon={Apple}
          label={t('auth.continueApple')}
          onPress={onSocial}
          styles={styles}
          dir={dir}
          c={c}
        />
        <SocialRow
          Icon={Smartphone}
          label={t('auth.continueGoogle')}
          onPress={onSocial}
          styles={styles}
          dir={dir}
          c={c}
        />
      </View>

      <Pressable onPress={onGuest} style={styles.guest} accessibilityRole="button">
        <Text style={styles.guestText}>{t('auth.guest')}</Text>
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setPickerOpen(false)}
            accessibilityLabel="Close"
          />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.handle} />
            <View style={[styles.searchBar, dir.row]}>
              <Search size={18} color={c.text.muted} />
              <TextInput
                style={[styles.searchInput, dir.textAlign]}
                value={search}
                onChangeText={setSearch}
                placeholder={t('common.search')}
                placeholderTextColor={c.text.muted}
                autoCorrect={false}
                autoFocus
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
              renderItem={({ item }) => {
                const selected = item.code === country.code;
                return (
                  <Pressable
                    style={[styles.countryRow, dir.row]}
                    onPress={() => onPickCountry(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.countryFlag}>{flagEmoji(item.code)}</Text>
                    <Text style={[styles.countryName, dir.textAlign]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.countryDial}>+{dialCodeFor(item.code)}</Text>
                    {selected ? <Check size={18} color={c.brand.tint} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function SocialRow({
  Icon,
  label,
  onPress,
  styles,
  dir,
  c,
}: {
  Icon: typeof Apple;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  dir: ReturnType<typeof useDirectionalStyles>;
  c: Palette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.social, dir.row]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={20} color={c.text.primary} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    title: { ...typography.scale.h1, color: c.text.primary },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    prefix: {
      alignItems: 'center',
      gap: spacing.xs,
      borderRightWidth: 1.5,
      borderRightColor: c.border,
      paddingRight: spacing.md,
      marginRight: spacing.xs,
      minHeight: 44,
    },
    prefixFlag: { fontSize: 20 },
    prefixText: { ...typography.scale.bodyMedium, color: c.text.primary },
    cta: { marginTop: spacing.lg },
    divider: { alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
    line: { flex: 1, height: 1, backgroundColor: c.border },
    or: { ...typography.scale.smallMedium, color: c.text.muted },
    social: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 54,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.md,
    },
    socialText: { ...typography.scale.bodyMedium, color: c.text.primary },
    guest: { alignItems: 'center', paddingVertical: spacing.lg },
    guestText: { ...typography.scale.bodyMedium, color: c.brand.tint },
    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.overlay,
    },
    sheet: {
      backgroundColor: c.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: c.border,
      marginBottom: spacing.md,
    },
    searchBar: {
      alignItems: 'center',
      gap: spacing.sm,
      height: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: c.background.muted,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
    },
    searchInput: { flex: 1, ...typography.scale.body, color: c.text.primary, padding: 0 },
    list: { maxHeight: 400 },
    rowSeparator: { height: 1, backgroundColor: c.border, opacity: 0.5 },
    countryRow: { alignItems: 'center', gap: spacing.md, minHeight: 52 },
    countryFlag: { fontSize: 24 },
    countryName: { flex: 1, ...typography.scale.body, color: c.text.primary },
    countryDial: { ...typography.scale.smallMedium, color: c.text.secondary },
  });
