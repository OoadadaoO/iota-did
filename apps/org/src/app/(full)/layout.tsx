export default function NavLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  params;
  return (
    <div className={`flex min-h-dvh flex-col antialiased`}>{children}</div>
  );
}
