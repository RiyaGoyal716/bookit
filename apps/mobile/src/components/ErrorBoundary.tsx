import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { lightColors, darkColors, radius, spacing, type Palette } from '../theme';
import { Button } from './ui/Button';
import { Text } from './ui/Text';
import { Icon } from './ui/Icon';

interface Props {
  children: ReactNode;
  /** Colour scheme to style the fallback with. Defaults to light. */
  scheme?: 'light' | 'dark';
}

interface State {
  error: Error | null;
}

/**
 * App-wide error boundary with a friendly retry screen.
 *
 * Must be a class component — React only supports error boundaries via
 * `getDerivedStateFromError` / `componentDidCatch`. Colours are resolved from
 * the static palettes (hooks aren't available in class components).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[ErrorBoundary] caught', error.message, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const c: Palette = this.props.scheme === 'dark' ? darkColors : lightColors;
    const styles = makeStyles(c);

    return (
      <View style={styles.root}>
        <View style={styles.iconCircle}>
          <Icon name="alert-triangle" size={24} color={c.status.warning} />
        </View>
        <Text variant="title1" center>
          Something went wrong
        </Text>
        <Text variant="body" tone="muted" center>
          The app hit an unexpected error. You can try again — your bookings are safe.
        </Text>
        <Button
          label="Try again"
          icon="refresh"
          onPress={this.handleRetry}
          fullWidth={false}
          style={styles.btn}
        />
      </View>
    );
  }
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
      backgroundColor: c.background.base,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.status.warningSoft,
      marginBottom: spacing.sm,
    },
    btn: {
      marginTop: spacing.md,
      minWidth: 200,
    },
  });
