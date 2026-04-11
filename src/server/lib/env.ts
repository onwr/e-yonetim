function getEnvValue(key: string): string | undefined {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
}

export const env = {
  DATABASE_URL: getEnvValue("DATABASE_URL"),
  JWT_SECRET: getEnvValue("JWT_SECRET") ?? "dev-jwt-secret-change-me",
  JWT_REFRESH_SECRET: getEnvValue("JWT_REFRESH_SECRET") ?? getEnvValue("JWT_SECRET") ?? "dev-refresh-secret-change-me",
  API_RATE_LIMIT_WINDOW_MS: Number(getEnvValue("API_RATE_LIMIT_WINDOW_MS") ?? "60000"),
  API_RATE_LIMIT_MAX: Number(getEnvValue("API_RATE_LIMIT_MAX") ?? "120"),
  NEXT_PUBLIC_USE_API_BACKEND: (getEnvValue("NEXT_PUBLIC_USE_API_BACKEND") ?? "true") === "true",
  NETGSM_USERNAME: getEnvValue("NETGSM_USERNAME"),
  NETGSM_PASSWORD: getEnvValue("NETGSM_PASSWORD"),
  NETGSM_HEADER: getEnvValue("NETGSM_HEADER"),
};
