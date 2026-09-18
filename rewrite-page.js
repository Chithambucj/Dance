const fs = require('fs');
const file = '/home/selvan/PROJECTS/Dancing/dancing-app/src/app/member/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newBody = `export default async function MemberDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireAuth(["MEMBER"]);
  const { tab: rawTab } = await searchParams;
  const tab = rawTab || "dashboard";

  await checkAndExpireCurrentUserTrial();

  const freshMember = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { membershipStatus: true },
  });
  const currentStatus = freshMember?.membershipStatus ?? session.membershipStatus;

  const member = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const allPayments = await prisma.payment.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const freeTrial = await prisma.freeTrial.findUnique({
    where: { userId: session.userId },
  });

  const isFreeTrial    = currentStatus === "FREE_TRIAL";
  const isTrialExpired = currentStatus === "TRIAL_EXPIRED";

  // ── 1. Member Dashboard ──────────────────────────────────────────────────
  if (tab === "dashboard") {
    const now = new Date();
    const isExpired  = membership?.status === "EXPIRED" || (membership?.expiryDate && new Date(membership.expiryDate) < now);
    const isActive   = membership?.status === "ACTIVE"  && !isExpired;
    const isPending  = membership?.status === "PAYMENT_PENDING";
    const isPartial  = membership?.status === "PARTIALLY_PAID";

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Welcome back, {session.firstName}! <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your membership and payments.</p>
          </div>
        </div>

        {/* Free Trial Banner */}
        {freeTrial && isFreeTrial && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-[#FF7700]/15">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" /> Free Trial Active
                </div>
                <h3 className="text-xl font-black">7-Day Free Trial: {freeTrial.program}</h3>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  Valid until {new Date(freeTrial.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
                </p>
              </div>
            </div>
            <Link href="/plans" className="shrink-0">
              <Button className="h-11 px-6 rounded-2xl bg-white text-gray-900 font-bold hover:bg-white/90 shadow-md">
                Choose Membership Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Trial Expired Banner */}
        {isTrialExpired && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-red-600/15">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                  Trial Expired
                </div>
                <h3 className="text-xl font-black">Your Free Trial Has Ended</h3>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  Choose a membership plan to continue your dance journey.
                </p>
              </div>
            </div>
            <Link href="/plans" className="shrink-0">
              <Button className="h-11 px-6 rounded-2xl bg-white text-red-600 font-black hover:bg-white/90 shadow-md">
                Choose Membership Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Details */}
          <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white">
            <CardHeader className="border-b border-gray-50 p-6 pb-4">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Member Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{member?.firstName} {member?.lastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{member?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{member?.phone || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Plan Details */}
          <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 p-6 pb-4">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Current Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!membership ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-medium">No active membership</p>
                  <Link href="/plans">
                    <Button className="mt-4 rounded-xl font-bold bg-primary text-white">Choose a Plan</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded-full \${isActive ? "bg-green-100 text-green-700" : isExpired ? "bg-red-100 text-red-700" : isPartial ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700"}\`}>
                        {membership.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900">{membership.plan.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Started</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {new Date(membership.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expires</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>

                  <Link href="/plans" className="block pt-2">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-gray-200 text-gray-700">Change Plan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── 2. Payment History ───────────────────────────────────────────
  if (tab === "payments") {
    const totalPaid = allPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment History</h1>
          <p className="text-gray-500 mt-1 font-medium">Your fee receipts and payment records.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="px-5 py-3 rounded-2xl bg-green-50 border border-green-100 font-bold text-green-700 flex items-center gap-3">
            <span className="text-xl">₹{totalPaid.toLocaleString()}</span>
            <span className="text-xs font-semibold opacity-70">Total Paid</span>
          </div>
        </div>
        <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-50 hover:bg-transparent">
                  <TableHead className="font-bold text-gray-400 px-6 py-4">Description</TableHead>
                  <TableHead className="font-bold text-gray-400">Amount</TableHead>
                  <TableHead className="font-bold text-gray-400">Method</TableHead>
                  <TableHead className="font-bold text-gray-400">Date</TableHead>
                  <TableHead className="font-bold text-gray-400">Status</TableHead>
                  <TableHead className="font-bold text-gray-400 text-right px-6">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPayments.length > 0 ? allPayments.map((p) => (
                  <TableRow key={p.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <TableCell className="font-bold text-gray-800 px-6 py-4">{p.description || "Fee Payment"}</TableCell>
                    <TableCell className="font-black text-gray-900">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-gray-600 text-xs">{p.paymentMethod || "Direct"}</TableCell>
                    <TableCell className="font-medium text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <span className={\`text-xs font-bold px-2.5 py-1 rounded-full \${p.status === "COMPLETED" ? "bg-green-50 text-green-600" : p.status === "PENDING" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"}\`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <PaymentReceiptModal payment={{ ...p, user: member! }} />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400 font-medium">No payment records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── 3. Announcements ──────────────────────────────────────
  if (tab === "announcements") {
    const announcements = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Announcements &amp; Updates</h1>
          <p className="text-gray-500 mt-1 font-medium">Studio news and special notices from our studio.</p>
        </div>
        <div className="space-y-4">
          {announcements.length > 0 ? announcements.map((ann) => (
            <Card key={ann.id} className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{ann.title}</h3>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed font-medium">{ann.content}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-3">
                      {new Date(ann.createdAt).toLocaleDateString("en-IN", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="bg-white rounded-3xl border-0 shadow-sm shadow-gray-100 p-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold">No announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
`;

// Replace from export default async function... to the end
const startStr = 'export default async function MemberDashboardPage({';
const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
    const newContent = content.substring(0, startIndex) + newBody;
    fs.writeFileSync(file, newContent);
    console.log("Rewrote page.tsx successfully.");
} else {
    console.log("Could not find start string");
}
