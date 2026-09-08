import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
      <p className="text-5xl font-black text-[#0e2a5e]">404</p>
      <p className="mt-3 text-sm font-medium text-slate-600">
        页面不存在，或课程尚未上线
      </p>
      <Link
        href="/"
        className="mt-5 rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
      >
        回到仪表盘
      </Link>
    </div>
  );
}
