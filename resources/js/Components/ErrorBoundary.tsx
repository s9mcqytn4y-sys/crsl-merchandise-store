import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("CRSL App Error Boundary tertangkap:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isDev = process.env.NODE_ENV !== "production";

            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 select-none">
                    <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 max-w-lg w-full border border-slate-800 shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/40">
                                Sistem Keamanan UI
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-white">
                                Terjadi Kendala Tampilan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                                Mohon maaf atas ketidaknyamanan ini. Terjadi kesalahan rendering pada halaman ini. Anda dapat me-refresh atau kembali ke beranda.
                            </p>
                        </div>

                        {isDev && this.state.error && (
                            <div className="text-left bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-red-300 max-h-36 overflow-y-auto">
                                <p className="font-bold text-red-400">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo?.componentStack && (
                                    <pre className="text-[9px] text-slate-500 mt-1 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Muat Ulang Halaman</span>
                            </button>

                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-slate-700 transition-all duration-150 active:scale-95 cursor-pointer"
                            >
                                <Home className="w-4 h-4" />
                                <span>Kembali ke Beranda</span>
                            </button>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60">
                            <a
                                href={`https://api.whatsapp.com/send?phone=${SITUS_CONFIG.whatsappCS}&text=${encodeURIComponent("Halo CS CRSL, saya mengalami kendala pada aplikasi web.")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Hubungi CS WhatsApp CRSL</span>
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
