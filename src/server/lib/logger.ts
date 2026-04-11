type LogLevel = "info" | "warn" | "error";

function writeLog(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data ? { data } : {}),
  };
  const output = JSON.stringify(payload);
  if (level === "error") {
    console.error(output);
    return;
  }
  if (level === "warn") {
    console.warn(output);
    return;
  }
  console.log(output);
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => writeLog("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => writeLog("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => writeLog("error", message, data),
};
