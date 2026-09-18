"use client";

import { useTransition } from "react";
import { deleteBatch } from "@/actions/batches";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteBatchButtonProps {
  id: string;
  name: string;
}

export default function DeleteBatchButton({ id, name }: DeleteBatchButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Delete batch "${name}" and all its enrollments/attendance? This cannot be undone.`)) return;
        startTransition(async () => {
          await deleteBatch(id);
        });
      }}
      className="rounded-lg text-red-600 hover:bg-red-50 font-bold text-xs h-8 gap-1"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Delete
    </Button>
  );
}
