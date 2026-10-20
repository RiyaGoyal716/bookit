import { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Icon,
  IconButton,
  PressableScale,
  Screen,
  Text,
  type IconName,
} from '../src/components/ui';
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
      <IconButton
        name="chevron-left"
        size={24}
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
        style={styles.back}
      />

      <View style={styles.flex}>
        <Text variant="title1" style={dir.textAlign}>
          {t('auth.phoneTitle')}
        </Text>
        <Text variant="body" tone="muted" style={[styles.subtitle, dir.textAlign]}>
          {t('auth.phoneSubtitle')}
        </Text>

        <View style={styles.fieldWrap}>
          <Text variant="footnote" tone={showError ? 'danger' : 'muted'} style={styles.fieldLabel}>
            {t('auth.phonePlaceholder')}
          </Text>
          <View style={[styles.fieldRow, dir.row, showError && styles.fieldRowError]}>
            <PressableScale
              onPress={() => setPickerOpen(true)}
              style={[styles.prefix, dir.row]}
              haptic="selection"
              accessibilityRole="button"
              accessibilityLabel={t('auth.phonePlaceholder')}
            >
              <Text variant="title2">{flagEmoji(country.code)}</Text>
              <Text variant="headline">+{dialCodeFor(country.code)}</Text>
              <Icon name="chevron-down" size={16} color={c.text.muted} />
            </PressableScale>
            <TextInput
              style={[styles.input, dir.textAlign]}
              value={national}
              onChangeText={onChange}
              placeholder="7123 456789"
              placeholderTextColor={c.text.muted}
              keyboardType="phone-pad"
              autoFocus
              accessibilityLabel={t('auth.phonePlaceholder')}
            />
          </View>
          {showError ? (
            <Text variant="caption" tone="danger">
              Enter a valid mobile number
            </Text>
          ) : null}
        </View>

        <Button
          label={t('auth.sendCode')}
          disabled={!validation.valid}
          onPress={onContinue}
          style={styles.cta}
        />

        <View style={[styles.divider, dir.row]}>
          <View style={styles.line} />
          <Text variant="footnote" tone="muted">
            {t('auth.or')}
          </Text>
          <View style={styles.line} />
        </View>

        <SocialRow
          icon="user"
          label={t('auth.continueApple')}
          onPress={onSocial}
          styles={styles}
          dir={dir}
          c={c}
        />
        <SocialRow
          icon="smartphone"
          label={t('auth.continueGoogle')}
          onPress={onSocial}
          styles={styles}
          dir={dir}
          c={c}
        />
      </View>

      <PressableScale onPress={onGuest} style={styles.guest} accessibilityRole="button">
        <Text variant="headline" tone="accent">
          {t('auth.guest')}
        </Text>
      </PressableScale>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <PressableScale
            style={styles.backdrop}
            onPress={() => setPickerOpen(false)}
            scaleTo={1}
            haptic={null}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.handle} />
            <View style={[styles.searchBar, dir.row]}>
              <Icon name="search" size={20} color={c.text.muted} />
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
                  <PressableScale
                    style={[styles.countryRow, dir.row]}
                    onPress={() => onPickCountry(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={item.name}
                  >
                    <Text variant="title1">{flagEmoji(item.code)}</Text>
                    <Text variant="body" style={styles.countryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text variant="footnote" tone="muted">
                      +{dialCodeFor(item.code)}
                    </Text>
                    {selected ? <Icon name="check" size={20} color={c.brand.tint} /> : null}
                  </PressableScale>
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
  icon,
  label,
  onPress,
  styles,
  dir,
  c,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  dir: ReturnType<typeof useDirectionalStyles>;
  c: Palette;
}) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.social, dir.row]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={20} color={c.text.primary} />
      <Text variant="headline">{label}</Text>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start', marginLeft: -spacing.sm },
    subtitle: {
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    fieldWrap: { gap: spacing.xs },
    fieldLabel: { fontWeight: '600' },
    fieldRow: {
      alignItems: 'center',
      minHeight: 56,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.md,
    },
    fieldRowError: { borderColor: c.status.danger },
    prefix: {
      alignItems: 'center',
      gap: spacing.xs,
      borderRightWidth: 1.5,
      borderRightColor: c.border,
      paddingRight: spacing.md,
      marginRight: spacing.sm,
      minHeight: 44,
    },
    input: { flex: 1, ...typography.scale.body, color: c.text.primary, padding: 0 },
    cta: { marginTop: spacing.lg },
    divider: { alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
    line: { flex: 1, height: 1, backgroundColor: c.border },
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
    guest: { alignItems: 'center', paddingVertical: spacing.lg },
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
    countryName: { flex: 1 },
  });
