"use client";

/**
 * Resume header face: user photo or initials circle. ATS-safe (no icons in text flow).
 */
export function PhotoOrInitials({
  photoUrl,
  fullName,
  className = "w-14 h-14 rounded-full object-cover flex-shrink-0",
  borderClass = "border-2 border-gray-300",
}: {
  photoUrl?: string;
  fullName: string;
  className?: string;
  borderClass?: string;
}) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user photo can be data URL
      <img
        src={photoUrl}
        alt=""
        className={`${className} ${borderClass}`}
      />
    );
  }

  return (
    <div
      className={`${className} ${borderClass} bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-sm`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
