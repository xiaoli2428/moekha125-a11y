/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RPC_PRIMARY: string;
    readonly VITE_RPC_POLYGON: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
