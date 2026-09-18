"use client";

import { useTransition } from "react";
import { deleteClassStyle } from "@/actions/classes";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DeleteClassStyleButtonProps {
  id: string;
  name: string;
}

export default function DeleteClassStyleButton({ id, name }: DeleteClassStyleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="relative">
      {error && (
        <div className="absolute bottom-full left-0 mb-1 w-64 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-medium z-10">
          {error}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
          setError("");
          startTransition(async () => {
            const res = await deleteClassStyle(id);
            if (!res.success) setError(res.error || "Failed to delete.");
          });
        }}
        className="rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs h-9"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Delete
      </Button>
    </div>
  );
}
