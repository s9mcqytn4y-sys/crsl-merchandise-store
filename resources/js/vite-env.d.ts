/// <reference types="vite/client" />
/// <reference types="react" />

import { Config, RouteParam, RouteParamsWithQueryOverwrites } from "ziggy-js";

/**
 * Deklarasi variabel lingkungan Vite (import.meta.env)
 */
interface ImportMetaEnv {
    readonly VITE_APP_NAME?: string;
    readonly VITE_MIDTRANS_CLIENT_KEY?: string;
    readonly VITE_MIDTRANS_IS_PRODUCTION?: string;
    readonly VITE_BITESHIP_API_URL?: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * Deklarasi modul aset statis (Image imports)
 */
declare module "*.svg" {
    import * as React from "react";
    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    const src: string;
    export default src;
}

declare module "*.png" {
    const content: string;
    export default content;
}

declare module "*.jpg" {
    const content: string;
    export default content;
}

declare module "*.jpeg" {
    const content: string;
    export default content;
}

declare module "*.webp" {
    const content: string;
    export default content;
}

declare module "*.ico" {
    const content: string;
    export default content;
}

/**
 * Deklarasi integrasi global Ziggy Router
 */
declare global {
    function route(
        name?: string,
        params?: RouteParamsWithQueryOverwrites | RouteParam,
        absolute?: boolean,
        config?: Config,
    ): any;

    /**
     * Ekstensi antarmuka Window untuk Midtrans Snap SDK & CSRF
     */
    interface Window {
        Ziggy?: Config;
        snap?: {
            pay: (
                snapToken: string,
                options?: {
                    onSuccess?: (result: any) => void;
                    onPending?: (result: any) => void;
                    onError?: (result: any) => void;
                    onClose?: () => void;
                },
            ) => void;
            embed?: (
                snapToken: string,
                options: {
                    embedId: string;
                    onSuccess?: (result: any) => void;
                    onPending?: (result: any) => void;
                    onError?: (result: any) => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

export {};
