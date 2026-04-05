"use client";

type ApiErrorBannerProps = {
  message?: string;
  className?: string;
};

type ApiLoadingTextProps = {
  message: string;
  className?: string;
};

export function ApiErrorBanner({ message, className = "" }: ApiErrorBannerProps) {
  if (!message) return null;
  return (
    <div className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ${className}`}>
      {message}
    </div>
  );
}

export function ApiLoadingText({ message, className = "" }: ApiLoadingTextProps) {
  return <div className={`text-sm font-bold text-gray-500 ${className}`}>{message}</div>;
}
