import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Logo } from '../src/components';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[c.brand.primary, c.brand.primaryDark]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.hero}>
          <Logo size={88} square={c.background.surface} glyph={c.brand.primary} />
          <Text style={styles.wordmark}>Bookit</Text>
          <Text style={styles.tagline}>Trusted local help, booked in a minute</Text>
        </View>

        <View style={styles.features}>
          <Feature
            icon="shield-checkmark"
            text="Verified local providers"
            tint={c.text.inverse}
            styles={styles}
          />
          <Feature
            icon="flash"
            text="Instant booking, no phone calls"
            tint={c.text.inverse}
            styles={styles}
          />
          <Feature
            icon="star"
            text="Rated by your Leeds neighbours"
            tint={c.text.inverse}
            styles={styles}
          />
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            icon="arrow-forward"
            variant="secondary"
            onPress={() => router.push('/login')}
          />
          <Text style={styles.legal}>Available now across Leeds</Text>
        </View>
      </View>
    </View>
  );
}

function Feature({
  icon,
  text,
  tint,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tint: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.brand.primaryDark },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
    },
    hero: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    wordmark: {
      ...typography.scale.display,
      fontSize: 44,
      lineHeight: 50,
      color: c.text.inverse,
      letterSpacing: -1,
      marginTop: spacing.sm,
    },
    tagline: {
      ...typography.scale.body,
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
    },
    features: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      ...typography.scale.bodyMedium,
      color: c.text.inverse,
    },
    footer: {
      gap: spacing.md,
    },
    legal: {
      ...typography.scale.caption,
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
    },
  });
