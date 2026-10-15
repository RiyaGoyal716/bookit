import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import {
  Text,
  Icon,
  IconButton,
  Button,
  TextField,
  PressableScale,
  type IconName,
} from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

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
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Become a pro
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="body" tone="muted">
          Join thousands of Bookit pros. We’ll verify your ID to keep the community safe — it
          usually takes under 24 hours.
        </Text>

        <Text variant="headline" style={styles.sectionTitle}>
          1 · Photo ID
        </Text>
        <UploadTile
          label="Driving licence or passport"
          uri={idDoc}
          done={onboarding.documents}
          onPress={() => pick('documents')}
          styles={styles}
          c={c}
        />

        <Text variant="headline" style={styles.sectionTitle}>
          2 · Selfie check
        </Text>
        <UploadTile
          label="A clear selfie to match your ID"
          uri={selfie}
          done={onboarding.selfie}
          icon="user"
          onPress={() => pick('selfie')}
          styles={styles}
          c={c}
        />

        <Text variant="headline" style={styles.sectionTitle}>
          3 · Bank details (for payouts)
        </Text>
        <View style={styles.bankCard}>
          <TextField
            label="Sort code"
            value={sortCode}
            onChangeText={setSortCode}
            placeholder="12-34-56"
            keyboardType="number-pad"
            maxLength={8}
          />
          <View style={{ marginTop: spacing.md }}>
            <TextField
              label="Account number"
              value={accountNo}
              onChangeText={setAccountNo}
              placeholder="12345678"
              keyboardType="number-pad"
              maxLength={8}
            />
          </View>
          <View style={styles.secureNote}>
            <Icon name="lock" size={16} color={c.text.muted} />
            <Text variant="caption" tone="muted">
              Encrypted and used only for payouts (demo).
            </Text>
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
  icon = 'image',
  onPress,
  styles,
  c,
}: {
  label: string;
  uri: string | null;
  done: boolean;
  icon?: IconName;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <PressableScale
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
          <Icon name={icon} size={24} color={c.brand.tint} />
        </View>
      )}
      <View style={styles.flex1}>
        <Text variant="headline">{label}</Text>
        <Text variant="caption" tone="muted">
          {uri ? 'Tap to replace' : 'Tap to upload'}
        </Text>
      </View>
      {done ? <Icon name="check-circle" size={24} color={c.status.success} /> : null}
    </PressableScale>
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
    title: { flex: 1 },
    sectionTitle: {
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
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
