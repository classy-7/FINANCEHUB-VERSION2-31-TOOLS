/**
 * FinanceHub Event Analytics
 * Fires structured events for user engagement, calculator runs, and exports.
 */

export interface AnalyticsEvent {
  action: string;
  category: "calculator" | "navigation" | "export" | "share" | "monetization";
  label?: string;
  value?: number;
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(`[FinanceHub Analytics] ${event.category} -> ${event.action}`, event.label || "");
  }

  // If Google Analytics gtag is present
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
}

export function trackPageView(pagePath: string) {
  trackEvent({
    action: "page_view",
    category: "navigation",
    label: pagePath,
  });
}
