// components/LoadingSkeleton.tsx
export default function LoadingSkeleton() {
  return (
    <section className="animate-pulse space-y-4">
      <div className="h-24 w-full rounded-2xl bg-blue-100/30" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-blue-100/30" />
        <div className="space-y-3">
          <div className="h-12 rounded-xl bg-blue-100/30" />
          <div className="h-12 rounded-xl bg-blue-100/30" />
          <div className="h-12 rounded-xl bg-blue-100/30" />
        </div>
      </div>
    </section>
  );
}
