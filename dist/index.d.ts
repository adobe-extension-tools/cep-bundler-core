export declare function enablePlayerDebugMode(): void;
export declare function disablePlayerDebugMode(): void;
export declare function getConfig(pkg: any, env?: string): any;
export declare function objectToProcessEnv(obj: any): void;
export declare function writeExtensionTemplates(opts: any): Promise<void>;
export declare function parseHosts(hostsString: string): {
    name: string;
    version: string;
}[];
export declare function getExtensionPath(): string;
export declare function symlinkExtension({ bundleId, out }: {
    bundleId: string;
    out: string;
}): Promise<void>;
export declare function copyDependencies({ root, out, pkg }: {
    root: string;
    out: string;
    pkg: any;
}): Promise<void>;
export declare function copyIcons({ root, out, iconNormal, iconRollover, iconDarkNormal, iconDarkRollover }: any): Promise<void[]>;
interface CompileOptions {
    env?: string;
    root?: string;
    htmlFilename?: string;
    isDev?: boolean;
    pkg?: any;
}
export declare function compile(opts: CompileOptions): Promise<void>;
export {};
