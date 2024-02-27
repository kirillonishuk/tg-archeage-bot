declare namespace NodeJS {
  interface ProcessEnv {
    readonly BOT_TOKEN: string;
    readonly DB_HOST: string;
    readonly DB_PORT: string;
    readonly DB_DATABASE: string;
  }
}
