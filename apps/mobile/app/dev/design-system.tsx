import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useTokens, useColorSchemeName, spacing, radius, typography } from '../../src/theme';
import { useThemeStore } from '../../src/stores/themeStore';
import {
  Text,
  Button,
  IconButton,
  Card,
  Chip,
  SegmentedControl,
  Toggle,
  Stepper,
  Badge,
  StatusPill,
  Rating,
  PriceTag,
  Skeleton,
  AvatarStack,
  ListRow,
  InsetGroupedList,
  SearchField,
  TextField,
  Banner,
  Divider,
  SectionHeader,
  EmptyState,
} from '../../src/components/ui';
import { CategoryIcon } from '../../src/assets/icons/categories';

const CATS = [
  'cleaning',
  'beauty',
  'barber',
  'tutoring',
  'handyman',
  'plumbing',
  'electrician',
  'moving',
  'pet-care',
  'gardening',
];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <SectionHeader title={title} />
      {children}
    </View>
  );
}

/** NOVA design-system gallery. Opened via long-press on the app version. */
export default function DesignSystem() {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const setPreference = useThemeStore((s) => s.setPreference);
  const router = useRouter();
  const [seg, setSeg] = useState(0);
  const [toggle, setToggle] = useState(true);
  const [qty, setQty] = useState(2);
  const [chip, setChip] = useState(0);

  const swatches: [string, string][] = [
    ['bg', t.bg],
    ['bgSubtle', t.bgSubtle],
    ['surface', t.surface],
    ['surfaceRaised', t.surfaceRaised],
    ['text', t.text],
    ['textMuted', t.textMuted],
    ['primary', t.primary],
    ['accent', t.accent],
    ['success', t.success],
    ['warning', t.warning],
    ['danger', t.danger],
    ['info', t.info],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderColor: t.border, paddingTop: 56 }]}>
        <IconButton name="arrow-left" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text variant="title2">Design system</Text>
        <IconButton
          name={scheme === 'dark' ? 'sun' : 'moon'}
          accessibilityLabel="Toggle theme"
          onPress={() => setPreference(scheme === 'dark' ? 'light' : 'dark')}
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
        <Row title="Colour tokens">
          <View style={styles.swatches}>
            {swatches.map(([name, color]) => (
              <View key={name} style={styles.swatch}>
                <View style={[styles.chip, { backgroundColor: color, borderColor: t.border }]} />
                <Text variant="micro" tone="muted">
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Row>

        <Row title="Typography">
          <Text variant="display">Display</Text>
          <Text variant="title1">Title 1</Text>
          <Text variant="title2">Title 2</Text>
          <Text variant="headline">Headline</Text>
          <Text variant="body">Body — the quick brown fox.</Text>
          <Text variant="callout" tone="muted">
            Callout muted
          </Text>
          <Text variant="footnote" tone="subtle">
            Footnote subtle
          </Text>
          <Text variant="caption" tabular>
            12:30 · 1,240
          </Text>
        </Row>

        <Row title="Buttons">
          <Button label="Primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button
            label="Tertiary"
            variant="tertiary"
            onPress={() => {}}
            icon="arrow-right"
            iconPosition="right"
          />
          <Button label="Destructive" variant="destructive" onPress={() => {}} icon="trash" />
          <Button label="Loading" loading onPress={() => {}} />
          <View style={styles.inline}>
            <IconButton name="heart" accessibilityLabel="Like" variant="surface" />
            <IconButton name="share" accessibilityLabel="Share" variant="subtle" />
            <IconButton name="bookmark" accessibilityLabel="Save" />
          </View>
        </Row>

        <Row title="Selection">
          <View style={styles.inline}>
            {['All', 'Cleaning', 'Beauty'].map((c, i) => (
              <Chip key={c} label={c} selected={chip === i} onPress={() => setChip(i)} />
            ))}
          </View>
          <SegmentedControl
            options={['Upcoming', 'Past', 'Cancelled']}
            value={seg}
            onChange={setSeg}
          />
          <View style={styles.inline}>
            <Toggle value={toggle} onChange={setToggle} accessibilityLabel="Demo toggle" />
            <Stepper value={qty} onChange={setQty} />
          </View>
        </Row>

        <Row title="Status & display">
          <View style={styles.inline}>
            <Badge label="New" tone="accent" />
            <Badge label="Verified" tone="success" />
            <StatusPill label="On the way" tone="info" />
            <StatusPill label="Completed" tone="success" />
          </View>
          <View style={styles.inline}>
            <Rating value={4.8} count={214} />
            <PriceTag minor={6500} suffix="/hr" />
            <AvatarStack items={[{ name: 'A B' }, { name: 'C D' }, { name: 'E F' }]} />
          </View>
          <Card variant="outlined">
            <Text variant="headline">Outlined card</Text>
            <Text variant="footnote" tone="muted">
              Depth from hairline borders.
            </Text>
          </Card>
          <View style={{ gap: spacing.sm }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="90%" />
          </View>
        </Row>

        <Row title="Category icons">
          <View style={styles.inline}>
            {CATS.map((c) => (
              <View key={c} style={{ alignItems: 'center', gap: 4, width: 56 }}>
                <CategoryIcon slug={c} size={40} />
                <Text variant="micro" tone="muted" numberOfLines={1}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </Row>

        <Row title="Inputs">
          <SearchField placeholder="Search services" onPress={() => {}} />
          <TextField label="Full name" placeholder="Jane Doe" />
          <TextField label="Email" value="nope" error="Enter a valid email" />
        </Row>

        <Row title="Lists">
          <InsetGroupedList header="Account">
            <ListRow icon="user" title="Profile" onPress={() => {}} />
            <ListRow icon="card" title="Payments" value="Visa ••42" onPress={() => {}} />
            <ListRow icon="bell" title="Notifications" iconTone="accent" onPress={() => {}} />
          </InsetGroupedList>
        </Row>

        <Row title="Notices">
          <Banner
            tone="info"
            title="Heads up"
            message="This is an informational banner."
            actionLabel="View"
            onAction={() => {}}
          />
          <Banner tone="warning" title="Action needed" message="Please verify your details." />
          <Banner
            tone="violation"
            title="Policy violation"
            message="Your listing was restricted."
            actionLabel="Appeal"
            onAction={() => {}}
          />
        </Row>

        <Row title="Empty state">
          <EmptyState
            art="search"
            title="No results"
            message="Try a different search."
            actionLabel="Clear filters"
            onAction={() => {}}
          />
        </Row>

        <Divider />
        <Text variant="caption" tone="subtle" style={{ marginTop: spacing.lg }}>
          NOVA design system · {Object.keys(typography.scale).length} type styles · radius{' '}
          {radius.lg}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { alignItems: 'center', gap: 4, width: 64 },
  chip: { width: 48, height: 48, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth },
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
});
