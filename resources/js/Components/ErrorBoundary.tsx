import { Component, ErrorInfo, ReactNode } from "react";
import {
    AlertTriangle,
    RefreshCw,
    Home,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
} from "lucide-react";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onErrorLogged?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    copied: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
        copied: false,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(
            "[CRSL Official Storefront ErrorBoundary]:",
            error,
            errorInfo,
        );
        this.setState({ errorInfo });
        this.props.onErrorLogged?.(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false,
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = "/";
    };

    private toggleDetails = () => {
        this.setState((s) => ({ showDetails: !s.showDetails }));
    };

    private handleCopyError = () => {
        const { error, errorInfo } = this.state;
        const text = `Error: ${error?.name} - ${error?.message}\n\nStack:\n${errorInfo?.componentStack || error?.stack || "No stack trace available"}`;

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 2000);
            });
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            // Vite safe environment detection
            const isDev = Boolean(import.meta.env.DEV);
            const { error, errorInfo, showDetails, copied } = this.state;

            const waNumber = SITUS_CONFIG?.whatsappCS || "6281222222775";
            const waLink = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(
                `Halo CS CRSL, saya mengalami kendala teknis pada halaman ini: ${error?.message || "Tampilan tidak dapat dimuat"}`,
            )}`;

            return (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50/70 select-none"
                >
                    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-xs">
                                <AlertTriangle className="w-8 h-8 text-[#E52027] stroke-[2.2]" />
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#E52027] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                Kendala Tampilan
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Tampilan Tidak Dapat Dimuat
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                                Kami mengalami sedikit kendala teknis saat
                                memuat komponen ini. Silakan coba kembali atau
                                hubungi bantuan kami.
                            </p>
                        </div>

                        {/* Developer Stack Trace (Dev Mode Only) */}
                        {isDev && error && (
                            <div className="text-left rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 text-[11px] font-mono">
                                    <button
                                        type="button"
                                        onClick={this.toggleDetails}
                                        className="flex-1 flex items-center justify-between text-slate-700 font-bold hover:text-slate-900 truncate pr-2 cursor-pointer"
                                    >
                                        <span className="text-[#E52027] truncate">
                                            {error.name}: {error.message}
                                        </span>
                                        {showDetails ? (
                                            <ChevronUp className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-500" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-500" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={this.handleCopyError}
                                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-1 shrink-0"
                                        title="Salin pesan error"
                                        aria-label="Salin stack trace error"
                                    >
                                        {copied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>

                                {showDetails && errorInfo?.componentStack && (
                                    <pre className="p-3 text-[10px] text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed bg-white">
                                        {errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl transition-all shadow-md shadow-red-500/10 cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4 stroke-[2.2]" />
                                <span>Coba Lagi</span>
                            </button>
                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl transition-all cursor-pointer border border-slate-200"
                            >
                                <Home className="w-4 h-4 stroke-[2.2]" />
                                <span>Ke Beranda</span>
                            </button>
                        </div>

                        {/* Customer Care WhatsApp Link */}
                        <div className="pt-2 border-t border-slate-100">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-500" />
                                <span>Laporkan Kendala via WhatsApp CS</span>
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
