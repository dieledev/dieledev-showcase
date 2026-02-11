import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-200">401</h1>
          <p className="mt-4 text-xl font-medium text-gray-900">
            Unauthorized
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Admin access is not configured. Set the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">ADMIN_TOKEN</code> environment variable.
          </p>
        </div>
      </main>
    );
  }

  return <AdminDashboard token={token} />;
}
