// components/ErrorCard.tsx
export default function ErrorCard({
  message = "ไม่สามารถโหลดข้อมูลได้ในขณะนี้",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="font-semibold">เกิดข้อผิดพลาด</div>
      <div className="mt-1 opacity-90">{message}</div>
    </div>
  );
}
