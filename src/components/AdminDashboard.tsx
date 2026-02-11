"use client";

import { useState, useEffect, useCallback } from "react";
import { Project, ValidationErrors } from "@/lib/types";
import { ToastContainer, ToastMessage } from "./Toast";
import { ProjectForm } from "./ProjectForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge } from "./StatusBadge";
import { TableSkeleton } from "./Skeleton";
import { NavManager } from "./NavManager";
import { ContentManager } from "./ContentManager";

type AdminTab = "projects" | "navigation" | "content";

export function AdminDashboard({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authValid, setAuthValid] = useState<boolean | null>(null);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headers = useCallback(
    (): HeadersInit => ({
      "Content-Type": "application/json",
      "X-Admin-Token": token,
    }),
    [token]
  );

  // Verify auth on mount
  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: headers(),
        });
        setAuthValid(res.ok);
      } catch {
        setAuthValid(false);
      }
    }
    verify();
  }, [headers]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      addToast("error", "Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (authValid) fetchProjects();
  }, [authValid, fetchProjects]);

  // Create
  const handleCreate = async (
    data: Record<string, unknown>
  ): Promise<ValidationErrors | null> => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.fields) return result.fields as ValidationErrors;
        addToast("error", result.error ?? "Failed to create project");
        return null;
      }
      addToast("success", "Project created successfully!");
      setFormOpen(false);
      await fetchProjects();
      return null;
    } catch {
      addToast("error", "Connection failed. Please try again.");
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Update
  const handleUpdate = async (
    data: Record<string, unknown>
  ): Promise<ValidationErrors | null> => {
    if (!editingProject) return null;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.slug}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.fields) return result.fields as ValidationErrors;
        addToast("error", result.error ?? "Failed to update project");
        return null;
      }
      addToast("success", "Project updated successfully!");
      setEditingProject(null);
      await fetchProjects();
      return null;
    } catch {
      addToast("error", "Connection failed. Please try again.");
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.slug}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!res.ok && res.status !== 204) {
        const result = await res.json();
        addToast("error", result.error ?? "Failed to delete project");
        return;
      }
      addToast("success", "Project deleted successfully!");
      setDeleteTarget(null);
      await fetchProjects();
    } catch {
      addToast("error", "Connection failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Auth check loading
  if (authValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
        <svg className="h-8 w-8 animate-spin text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Auth failed
  if (!authValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200">401</h1>
          <p className="mt-4 text-xl font-medium text-gray-900">Unauthorized</p>
          <p className="mt-2 text-sm text-gray-500">
            Admin token verification failed.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your showcase</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Site
              </a>
              {activeTab === "projects" && (
                <button
                  onClick={() => setFormOpen(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Project
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 -mb-px">
            {(
              [
                { key: "projects", label: "Projects" },
                { key: "content", label: "Content" },
                { key: "navigation", label: "Navigation" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {activeTab === "projects" && (
          <>
            {loading ? (
              <TableSkeleton rows={3} />
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                <p className="mt-1 text-sm text-gray-500">Create your first project to get started.</p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Add Project
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map((project) => (
                      <tr
                        key={project.slug}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 text-sm">
                            {project.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-500">
                            {project.tags.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-500">
                            {formatDate(project.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProject(project)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              aria-label={`Edit ${project.title}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(project)}
                              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${project.title}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "content" && (
          <ContentManager token={token} onToast={addToast} />
        )}

        {activeTab === "navigation" && (
          <NavManager token={token} onToast={addToast} />
        )}
      </main>

      {/* Create form modal */}
      {formOpen && (
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
          loading={actionLoading}
          token={token}
        />
      )}

      {/* Edit form modal */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleUpdate}
          onCancel={() => setEditingProject(null)}
          loading={actionLoading}
          token={token}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
