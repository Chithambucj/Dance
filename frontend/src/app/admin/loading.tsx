import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-450">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64 rounded-xl" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-lg" />
        </div>
        <Skeleton className="h-11 sm:h-10 w-full sm:w-36 rounded-xl shrink-0" />
      </div>

      {/* 4 Summary Cards Skeleton (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-3 sm:p-5 border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-3 w-16 sm:w-24 rounded" />
                <Skeleton className="h-7 sm:h-9 w-10 sm:w-16 rounded-lg" />
                {i === 3 && <Skeleton className="h-2.5 w-16 rounded" />}
              </div>
              <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0" />
            </div>
            <div className="hidden sm:block pt-2 border-t border-gray-50">
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-100 space-y-2.5 md:space-y-0 md:flex md:items-center md:gap-3">
        <Skeleton className="h-11 md:h-10 flex-1 w-full rounded-xl" />
        <Skeleton className="h-11 md:h-10 w-full md:w-40 rounded-xl shrink-0" />
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 md:gap-3 w-full md:w-auto">
          <Skeleton className="h-11 md:h-10 w-full md:w-36 rounded-xl" />
          <Skeleton className="h-11 md:h-10 w-full md:w-40 rounded-xl" />
          <Skeleton className="h-11 md:h-10 w-full md:w-36 rounded-xl" />
        </div>
      </div>

      {/* Data Content Skeletons */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                <th className="px-4 py-4"><Skeleton className="h-4 w-20" /></th>
                <th className="px-4 py-4 text-center"><Skeleton className="h-4 w-24 mx-auto" /></th>
                <th className="px-4 py-4"><Skeleton className="h-4 w-16" /></th>
                <th className="px-4 py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></th>
                <th className="px-4 py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></th>
                <th className="px-4 py-4 text-center"><Skeleton className="h-4 w-24 mx-auto" /></th>
                <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="h-[75px]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-20 rounded-lg" />
                      <Skeleton className="h-8 w-12 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="md:hidden space-y-3 p-3 sm:p-4 bg-gray-50/50">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/70 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              {/* 2-column details skeleton */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-10" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-14" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-14" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
