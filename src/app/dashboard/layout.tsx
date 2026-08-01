import IdleLogoutHandler from "@/components/IdleLogoutHandler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <IdleLogoutHandler />
    </>
  );
}