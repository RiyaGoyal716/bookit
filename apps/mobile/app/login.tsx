import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';

import { BottomSheet, Button, Input, Screen } from '../src/components';
import {
  COUNTRIES,
  dialCodeFor,
  flagEmoji,
  resolveDefaultCountry,
  type Country,
} from '../src/lib/countries';
import { digitsOnly, formatAsYouType, validateMobile } from '../src/lib/phone';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const defaultCountry = useMemo(() => {
    const region = Localization.getLocales()[0]?.regionCode;
    return resolveDefaultCountry(region);
  }, []);

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [national, setNational] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const digits = digitsOnly(national);
  const validation = useMemo(() => validateMobile(digits, country.code), [digits, country.code]);
  const showError = digits.length > 0 && !validation.valid;
  const canContinue = validation.valid;

  const onChange = (text: string) => {
    const capped = digitsOnly(text).slice(0, country.nationalLength);
    setNational(formatAsYouType(capped, country.code));
  };

  const onPickCountry = (next: Country) => {
    setCountry(next);
    setPickerOpen(false);
    setSearch('');
    // Re-apply formatting for the new country.
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

  return (
    <Screen keyboardAvoiding>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={c.text.primary} />
      </Pressable>

      <View style={styles.flex}>
        <Text style={styles.title}>What&apos;s your number?</Text>
        <Text style={styles.subtitle}>
          We&apos;ll text you a code to confirm it&apos;s really you.
        </Text>

        <Input
          label="Mobile number"
          value={national}
          onChangeText={onChange}
          placeholder="7123 456789"
          keyboardType="phone-pad"
          autoFocus
          error={showError ? 'Enter a valid mobile number' : undefined}
          helper="Standard message rates may apply"
          left={
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={styles.prefix}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Country code, currently ${country.name} plus ${dialCodeFor(country.code)}`}
            >
              <Text style={styles.prefixFlag}>{flagEmoji(country.code)}</Text>
              <Text style={styles.prefixText}>+{dialCodeFor(country.code)}</Text>
              <Ionicons name="chevron-down" size={14} color={c.text.muted} />
            </Pressable>
          }
        />
      </View>

      <View style={styles.footer}>
        <Button label="Continue" disabled={!canContinue} onPress={onContinue} />
      </View>

      <BottomSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Select country"
        snapPoints={['80%']}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={c.text.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search country or code"
            placeholderTextColor={c.text.muted}
            autoCorrect={false}
          />
        </View>
        <View style={styles.listWrap}>
          <FlashList
            data={filtered}
            keyExtractor={(item: Country) => item.code}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: Country }) => {
              const selected = item.code === country.code;
              return (
                <Pressable
                  style={styles.countryRow}
                  onPress={() => onPickCountry(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${item.name} plus ${dialCodeFor(item.code)}`}
                >
                  <Text style={styles.countryFlag}>{flagEmoji(item.code)}</Text>
                  <Text style={styles.countryName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.countryDial}>+{dialCodeFor(item.code)}</Text>
                  {selected ? <Ionicons name="checkmark" size={18} color={c.brand.tint} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    title: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    prefix: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderRightWidth: 1.5,
      borderRightColor: c.border,
      paddingRight: spacing.md,
      marginRight: spacing.xs,
      minHeight: 44,
    },
    prefixFlag: {
      fontSize: 20,
    },
    prefixText: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    footer: {
      paddingTop: spacing.md,
    },
    searchBar: {
      flexDirection: 'row',
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
    searchInput: {
      flex: 1,
      ...typography.scale.body,
      color: c.text.primary,
      padding: 0,
    },
    listWrap: {
      height: 440,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
    },
    countryFlag: {
      fontSize: 24,
    },
    countryName: {
      flex: 1,
      ...typography.scale.body,
      color: c.text.primary,
    },
    countryDial: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
    },
  });
