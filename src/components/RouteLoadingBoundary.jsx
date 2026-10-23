import { Component } from "react";
export default class RouteLoadingBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert" className="p-8 text-center">
        <h1 className="text-lg font-semibold">
          Cette page n’a pas pu se charger
        </h1>
        <p className="my-4 text-sm">
          Recharge la page pour récupérer la version disponible.
        </p>
        <button
          className="rounded-xl border px-5 py-3"
          onClick={() => window.location.reload()}
        >
          Recharger la page
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
