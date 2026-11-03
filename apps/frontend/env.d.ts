/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

// Vite CSS ?url imports
declare module "*.css?url" {
    const url: string;
    export default url;
}
