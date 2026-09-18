"use client";

import { useState } from "react";
import { MoreVertical, User, Edit2, Calendar, CreditCard, Layers, Trash2, Ban } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import MemberDetailModal from "@/components/admin/MemberDetailModal";
import EditMemberModal from "@/components/admin/EditMemberModal";
import DeleteMemberModal from "@/components/admin/DeleteMemberModal";
import { toggleMemberStatus } from "@/actions/members";
import { useRouter } from "next/navigation";

export default function MemberActionsMenu({ member }: { member: any }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();

  const handleDeactivate = async () => {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await toggleMemberStatus(member.id, newStatus);
    router.refresh();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100">
          <DropdownMenuItem onClick={() => setActiveModal("view_overview")} className="cursor-pointer py-2">
            <User className="w-4 h-4 mr-2 text-gray-500" /> View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("edit")} className="cursor-pointer py-2">
            <Edit2 className="w-4 h-4 mr-2 text-gray-500" /> Edit Member
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveModal("view_attendance")} className="cursor-pointer py-2">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" /> View Attendance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("view_payments")} className="cursor-pointer py-2">
            <CreditCard className="w-4 h-4 mr-2 text-green-500" /> View Payments
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("view_batches")} className="cursor-pointer py-2">
            <Layers className="w-4 h-4 mr-2 text-purple-500" /> View Enrolled Batches
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeactivate} className="cursor-pointer py-2">
            <Ban className="w-4 h-4 mr-2 text-orange-500" /> {member.status === "ACTIVE" ? "Deactivate Member" : "Activate Member"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("delete")} className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Controlled modals */}
      {activeModal === "view_overview" && <MemberDetailModal memberId={member.id} triggerContext="none" initialTab="overview" isOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === "view_attendance" && <MemberDetailModal memberId={member.id} triggerContext="none" initialTab="attendance" isOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === "view_payments" && <MemberDetailModal memberId={member.id} triggerContext="none" initialTab="payments" isOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === "view_batches" && <MemberDetailModal memberId={member.id} triggerContext="none" initialTab="batches" isOpen={true} onClose={() => setActiveModal(null)} />}
      
      {activeModal === "edit" && <EditMemberModal member={member} isControlledOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === "delete" && <DeleteMemberModal memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} isControlledOpen={true} onClose={() => setActiveModal(null)} />}
    </>
  );
}
