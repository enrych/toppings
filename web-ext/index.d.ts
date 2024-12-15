declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_BASE_URI: string;
    }
  }
}

export {};
