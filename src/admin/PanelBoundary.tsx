import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  /** Changing this resets the boundary, so another section can be opened. */
  resetKey: string;
  children: ReactNode;
};

type State = { error: Error | null };

/**
 * Keeps one broken panel from taking the whole content manager down.
 *
 * A render error anywhere under the shell used to unmount everything and
 * leave a white page with no way back — no navigation, no explanation, and
 * nothing to tell the studio what had gone wrong. Now the section that
 * failed says so and the sidebar stays usable.
 */
export class PanelBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(previous: Props) {
    // Moving to another section clears the failure.
    if (previous.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The studio cannot read this, but it is what a developer needs.
    console.error("[cms] panel failed:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="apanel">
        <header className="apanel__head">
          <div>
            <h1>This section could not be opened</h1>
            <p className="amuted">
              Nothing has been lost. Pick another section on the left, or
              reload the page to try again.
            </p>
          </div>
          <button
            type="button"
            className="abtn"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </header>
        <p className="aerror">{error.message}</p>
      </div>
    );
  }
}
