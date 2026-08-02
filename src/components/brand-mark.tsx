type BrandMarkProps = {
  className?: string;
  title?: string;
};

export function BrandMark({
  className = "h-7 w-7",
  title = "OpenMatch",
}: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Left brace */}
      <path
        d="M11 6c-2.8 0-4.5 1.7-4.5 4.2v3.2c0 1.4-.7 2.3-2.2 2.6 1.5.3 2.2 1.2 2.2 2.6v3.2c0 2.5 1.7 4.2 4.5 4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right brace */}
      <path
        d="M21 6c2.8 0 4.5 1.7 4.5 4.2v3.2c0 1.4.7 2.3 2.2 2.6-1.5.3-2.2 1.2-2.2 2.6v3.2c0 2.5-1.7 4.2-4.5 4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Match arcs */}
      <path
        d="M13.2 16a3.2 3.2 0 0 1 2.8-1.6c1.2 0 2.2.7 2.8 1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13.2 16a3.2 3.2 0 0 0 2.8 1.6c1.2 0 2.2-.7 2.8-1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
