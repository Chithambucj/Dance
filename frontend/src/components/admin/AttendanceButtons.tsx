"use client";

import { useTransition } from "react";
import { markAttendance } from "@/actions/attendance";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceButtonsProps {
  userId: string;
  batchId: string;
}

export default function AttendanceButtons({ userId, batchId }: AttendanceButtonsProps) {
  const [isPresentPending, startPresent] = useTransition();
  const [isAbsentPending, startAbsent]   = useTransition();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        disabled={isPresentPending || isAbsentPending}
        onClick={() =>
          startPresent(async () => {
            await markAttendance(userId, batchId, true);
          })
        }
        className="rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-bold gap-1 shadow-none"
      >
        {isPresentPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
        Present
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPresentPending || isAbsentPending}
        onClick={() =>
          startAbsent(async () => {
            await markAttendance(userId, batchId, false);
          })
        }
        className="rounded-lg border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-bold gap-1"
      >
        {isAbsentPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-4 h-4" />}
        Absent
      </Button>
    </div>
  );
}
