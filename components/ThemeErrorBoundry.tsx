"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { THEME_STORAGE_KEY } from "@/lib/constants";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ThemeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error(error);
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    if (error.message.includes("DOMTokenList")) {
      console.warn(
        `ThemeErrorBoundary caught a next-themes crash.
          This is likely due to an invalid theme in localStorage. Correcting...`,
      );

      localStorage.removeItem(THEME_STORAGE_KEY);

      this.setState({ hasError: false });
    } else {
      console.error(
        `ThemeErrorBoundary caught an unhandled error:
        ${error}
        ${_errorInfo.componentStack}`,
      );
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return this.props.children;
  }
}
