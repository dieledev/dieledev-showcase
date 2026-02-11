"use client";

import { useState, useEffect, useCallback } from "react";
import { NavItem } from "@/lib/types";

interface NavManagerProps {
  token: string;
  onToast: (type: "success" | "error", message: string) => void;
}

export function NavManager({ token, onToast }: NavManagerProps) {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/navigation");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      onToast("error", "Failed to load navigation.");
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateItem = (id: string, field: "label" | "href", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setDirty(true);
  };

  const addItem = () => {
    const newItem: NavItem = {
      id: crypto.randomUUID(),
      label: "New Link",
      href: "/",
      order: items.length,
    };
    setItems((prev) => [...prev, newItem]);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.map((item, i) => ({ ...item, order: i }));
    });
    setDirty(true);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
    setDirty(true);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
    setDirty(true);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/navigation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const data = await res.json();
        onToast("error", data.error ?? "Failed to save navigation.");
        return;
      }

      onToast("success", "Navigation saved successfully!");
      setDirty(false);
    } catch {
      onToast("error", "Connection failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg bg-white p-4 border border-gray-200"
          >
            <div className="h-4 w-8 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Description */}
      <p className="text-sm text-gray-500 mb-6">
        Manage navigation links. Use <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">#section</code> or{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/#section</code> for same-page anchors,
        or a full path like <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/about</code> for separate pages.
      </p>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
            {/* Order arrows */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                aria-label="Move up"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index >= items.length - 1}
                className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                aria-label="Move down"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <label className="sr-only">Label</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(item.id, "label", e.target.value)}
                placeholder="Label"
                className="w-full rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Href */}
            <div className="flex-1 min-w-0">
              <label className="sr-only">URL</label>
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem(item.id, "href", e.target.value)}
                placeholder="/path or /#anchor"
                className="w-full rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Delete */}
            <button
              onClick={() => removeItem(item.id)}
              className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label={`Remove ${item.label}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={addItem}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>

        {dirty && (
          <button
            onClick={saveAll}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Save Changes
          </button>
        )}

        {dirty && (
          <span className="text-xs text-amber-600 font-medium">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
