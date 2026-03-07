"use client";

const COMPANIES = [
  { name: "Google", color: "#4285F4" },
  { name: "Meta", color: "#0668E1" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Microsoft", color: "#00A4EF" },
  { name: "Apple", color: "#555555" },
  { name: "Netflix", color: "#E50914" },
  { name: "Stripe", color: "#635BFF" },
  { name: "Spotify", color: "#1DB954" },
  { name: "Uber", color: "#000000" },
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Adobe", color: "#FF0000" },
  { name: "Salesforce", color: "#00A1E0" },
  { name: "Tesla", color: "#CC0000" },
  { name: "Oracle", color: "#F80000" },
  { name: "IBM", color: "#0530AD" },
];

export function LogoTicker() {
  const doubled = [...COMPANIES, ...COMPANIES];

  return (
    <div className="relative overflow-hidden py-6">
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-r from-[#faf6f0] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-l from-[#faf6f0] to-transparent pointer-events-none" />
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((c, i) => (
          <span
            key={`${c.name}-${i}`}
            className="flex-shrink-0 mx-6 sm:mx-10 text-base sm:text-lg font-bold tracking-wide select-none transition-opacity hover:opacity-100 opacity-60"
            style={{ color: c.color }}
          >
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}
