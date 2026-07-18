"use client";

import { Component, type ReactNode } from "react";

export default class MapErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Map failed to load:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#eef1ee",
              color: "#6b7280",
              fontSize: 13,
              textAlign: "center",
              padding: 24,
            }}
          >
            <div style={{ fontSize: 28 }}>🗺️</div>
            <b style={{ color: "#131614" }}>Map unavailable</b>
            <span>Check your connection and reload. You can still search and book spots.</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
