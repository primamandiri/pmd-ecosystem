"use client";
import { Component } from "react";

export default class ErrorBoundary extends Component<{children:any}, {hasError:boolean, error?:string}> {
  state = { hasError: false, error: "" };
  static getDerivedStateFromError(e:any) { return { hasError: true, error: e.message }; }
  render() {
    if (this.state.hasError) return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-sm">⚠️ Terjadi kesalahan</p>
        <p className="text-xs text-gray-400 mt-1">{this.state.error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-xs">
          🔄 Muat Ulang
        </button>
      </div>
    );
    return this.props.children;
  }
}
