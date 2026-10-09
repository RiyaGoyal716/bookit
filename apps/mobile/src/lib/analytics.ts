/**
 * Analytics stub.
 *
 * A real build would forward events to an analytics provider. For the demo we
 * simply log them, so the instrumentation points are visible and verifiable.
 */
export type AnalyticsEvent =
  | 'search'
  | 'view_provider'
  | 'start_booking'
  | 'confirm_booking'
  | 'cancel_booking'
  | 'reschedule_booking'
  | 'favourite_toggle'
  | 'apply_promo'
  | 'write_review'
  | 'share_provider'
  | 'onboarding_complete'
  | 'login'
  | (string & {});

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  console.log(`[analytics] ${event}`, props ?? {});
}
