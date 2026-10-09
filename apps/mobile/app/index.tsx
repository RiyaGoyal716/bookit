import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={30} color={colors.text.inverse} />
          </View>
          <Text style={styles.logo}>
            Book<Text style={styles.logoAccent}>it</Text>
          </Text>
          <Text style={styles.tagline}>Trusted local help, booked in a minute</Text>
        </View>

        <View style={styles.features}>
          <Feature icon="shield-checkmark" text="Verified local providers" />
          <Feature icon="flash" text="Instant booking, no phone calls" />
          <Feature icon="star" text="Rated by your Leeds neighbours" />
        </View>

        <View style={styles.footer}>
          <Button label="Continue" icon="arrow-forward" onPress={() => router.push('/login')} />
          <Text style={styles.legal}>Available now across Leeds</Text>
        </View>
      </View>
    </Screen>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.brand.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  logoAccent: {
    color: colors.brand.primary,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
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
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  footer: {
    gap: spacing.md,
  },
  legal: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
