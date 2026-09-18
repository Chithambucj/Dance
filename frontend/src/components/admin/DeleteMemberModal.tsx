"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMember } from "@/actions/members";

export default function DeleteMemberModal({ 
  memberId, 
  memberName,
  isControlledOpen,
  onClose
}: { 
  memberId: string;
  memberName: string;
  isControlledOpen?: boolean;
  onClose?: () => void;
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOpen = isControlledOpen !== undefined ? isControlledOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (isControlledOpen === undefined) setInternalIsOpen(val);
    if (!val && onClose) onClose();
  };

  function handleDelete() {
    startTransition(async () => {
      await deleteMember(memberId);
      setIsOpen(false);
    });
  }

  return (
    <>
      {isControlledOpen === undefined && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Member?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-900">{memberName}</span>? This action cannot be undone and will remove all their enrollments, payments, and attendance records.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDelete} 
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete Member"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
