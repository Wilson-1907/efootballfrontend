import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Karatina Tournament",
  description: "Secure staff dashboard for registrations and match control.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
