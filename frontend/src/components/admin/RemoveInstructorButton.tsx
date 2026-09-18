"use client";

import { useTransition } from "react";
import { removeInstructor } from "@/actions/members";
import { UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RemoveInstructorButton({ instructorId }: { instructorId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm("Are you sure you want to remove the instructor role from this member? They will be unassigned from any batches.")) return;
    
    startTransition(async () => {
      const result = await removeInstructor(instructorId);
      if (!result.success) {
        alert(result.error);
      }
    });
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleRemove}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1 h-8"
      title="Remove Instructor Role"
    >
      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserMinus className="w-4 h-4 mr-2" />}
      Remove Role
    </Button>
  );
}
