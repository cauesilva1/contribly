export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-hidden">{children}</div>
  );
}
