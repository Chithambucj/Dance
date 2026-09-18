"use client";

import { useTransition } from "react";
import { deleteMember } from "@/actions/members";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteMemberButton({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this member? All their data (enrollments, attendances, payments) will be permanently lost.")) return;
    
    startTransition(async () => {
      const result = await deleteMember(memberId);
      if (!result.success) {
        alert(result.error);
      }
    });
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
      className="w-full justify-start rounded-md hover:bg-red-50 text-red-600 hover:text-red-700"
    >
      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
      Delete Member
    </Button>
  );
}
