import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Button, Input } from '../../src/components';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

export default function ProOnboarding() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const onboarding = useProviderStore((s) => s.onboarding);
  const setStep = useProviderStore((s) => s.setOnboardingStep);
  const submit = useProviderStore((s) => s.submitVerification);

  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [sortCode, setSortCode] = useState('');
  const [accountNo, setAccountNo] = useState('');

  const pick = async (kind: 'documents' | 'selfie') => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    }).catch(() => null);
    if (res && !res.canceled && res.assets[0]) {
      const uri = res.assets[0].uri;
      if (kind === 'documents') setIdDoc(uri);
      else setSelfie(uri);
      setStep(kind, true);
    }
  };

  const bankValid =
    sortCode.replace(/\D/g, '').length === 6 && accountNo.replace(/\D/g, '').length >= 8;
  const ready = Boolean(idDoc) && Boolean(selfie) && bankValid;

  const onSubmit = () => {
    setStep('bank', true);
    submit();
    showToast('Submitted for review');
    router.replace(route('/pro/verification'));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Become a pro</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Join thousands of Bookit pros. We’ll verify your ID to keep the community safe — it
          usually takes under 24 hours.
        </Text>

        <Text style={styles.sectionTitle}>1 · Photo ID</Text>
        <UploadTile
          label="Driving licence or passport"
          uri={idDoc}
          done={onboarding.documents}
          onPress={() => pick('documents')}
          styles={styles}
          c={c}
        />

        <Text style={styles.sectionTitle}>2 · Selfie check</Text>
        <UploadTile
          label="A clear selfie to match your ID"
          uri={selfie}
          done={onboarding.selfie}
          icon="happy-outline"
          onPress={() => pick('selfie')}
          styles={styles}
          c={c}
        />

        <Text style={styles.sectionTitle}>3 · Bank details (for payouts)</Text>
        <View style={styles.bankCard}>
          <Input
            label="Sort code"
            value={sortCode}
            onChangeText={setSortCode}
            placeholder="12-34-56"
            keyboardType="number-pad"
            maxLength={8}
          />
          <Input
            containerStyle={{ marginTop: spacing.md }}
            label="Account number"
            value={accountNo}
            onChangeText={setAccountNo}
            placeholder="12345678"
            keyboardType="number-pad"
            maxLength={8}
          />
          <View style={styles.secureNote}>
            <Ionicons name="lock-closed" size={13} color={c.text.muted} />
            <Text style={styles.secureText}>Encrypted and used only for payouts (demo).</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Submit for verification" disabled={!ready} onPress={onSubmit} />
      </View>
    </View>
  );
}

function UploadTile({
  label,
  uri,
  done,
  icon = 'cloud-upload-outline',
  onPress,
  styles,
  c,
}: {
  label: string;
  uri: string | null;
  done: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <Pressable
      style={styles.uploadTile}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.uploadImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={styles.uploadIcon}>
          <Ionicons name={icon} size={24} color={c.brand.tint} />
        </View>
      )}
      <View style={styles.flex1}>
        <Text style={styles.uploadLabel}>{label}</Text>
        <Text style={styles.uploadHint}>{uri ? 'Tap to replace' : 'Tap to upload'}</Text>
      </View>
      {done ? <Ionicons name="checkmark-circle" size={22} color={c.status.success} /> : null}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    intro: { ...typography.scale.body, color: c.text.secondary },
    sectionTitle: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    uploadTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    uploadIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadImage: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: c.skeleton },
    flex1: { flex: 1 },
    uploadLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    uploadHint: { ...typography.scale.caption, color: c.text.muted },
    bankCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    secureNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    secureText: { ...typography.scale.caption, color: c.text.muted },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
