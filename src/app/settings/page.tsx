"use client";

import { useRef, useState } from "react";
import { orderedLessons } from "@/lib/ordering";
import { useAcademy } from "@/hooks/use-academy";
import { STORAGE_KEY } from "@/lib/storage";
import { favoriteCount, totalProgress } from "@/lib/progress";

export default function SettingsPage() {
  const {
    state,
    resetProgress,
    resetFavorites,
    resetAll,
    importData,
    buildExport,
  } = useAcademy();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const stat = totalProgress(state);
  const favs = favoriteCount(state);

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    window.setTimeout(() => setMsg(null), 4000);
  }

  function handleExport() {
    const payload = buildExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate()
    ).padStart(2, "0")}`;
    a.href = url;
    a.download = `fund-admin-academy-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash(true, "学习记录已导出为 JSON 文件");
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        const okImport =
          window.confirm(
            "导入将覆盖当前全部学习进度与收藏，且不可撤销。确定继续？"
          ) && importData(payload);
        flash(
          okImport,
          okImport ? "导入成功，数据已恢复" : "导入失败：文件格式不正确"
        );
      } catch {
        flash(false, "导入失败：无法解析该 JSON 文件");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">设置</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          管理本地学习数据 · 数据仅保存在本机浏览器（{STORAGE_KEY}）
        </p>
      </header>

      {msg && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            msg.ok
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* 数据操作 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-800">学习数据</h2>
        <p className="mt-1 text-xs text-slate-400">
          当前：已完成 {stat.done}/{stat.total} 个模块（{stat.percent}%）· 收藏 {favs}{" "}
          项 · {stat.completedLessons}/{stat.totalLessons} 门课
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ActionCard
            title="导出学习记录"
            desc="把进度与收藏下载为 JSON 备份文件"
            action="导出 JSON"
            onClick={handleExport}
          />
          <ActionCard
            title="导入学习记录"
            desc="从 JSON 备份恢复（覆盖当前数据）"
            action="选择文件"
            onClick={() => fileRef.current?.click()}
            danger={false}
          />
          <ActionCard
            title="重置全部进度"
            desc="清空所有模块完成标记（保留收藏）"
            action="重置进度"
            onClick={() => {
              if (window.confirm("确定清空全部学习进度？此操作不可撤销。")) {
                resetProgress();
                flash(true, "学习进度已重置");
              }
            }}
            danger
          />
          <ActionCard
            title="清空收藏"
            desc="移除所有收藏的课程与模块（保留进度）"
            action="清空收藏"
            onClick={() => {
              if (window.confirm("确定清空全部收藏？此操作不可撤销。")) {
                resetFavorites();
                flash(true, "收藏已清空");
              }
            }}
            danger
          />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "重置全部数据（进度 + 收藏 + 最近记录）？此操作不可撤销，建议先导出备份。"
                )
              ) {
                resetAll();
                flash(true, "已恢复出厂状态");
              }
            }}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            重置全部数据
          </button>
          <span className="ml-3 text-xs text-slate-400">
            进度、收藏、最近记录一并清空
          </span>
        </div>
      </section>

      {/* 课程体系 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-800">课程体系</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
          {orderedLessons.map((l) => (
            <li key={l.id} className="flex items-center gap-2">
              <span className="w-6 font-bold text-[#0e2a5e]">{l.id}</span>
              {l.title}
            </li>
          ))}
        </ul>
      </section>

      {/* 第二阶段预留 */}
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-500">规划中的模块</h2>
        <p className="mt-1 text-xs text-slate-400">
          以下模块将分阶段加入，当前版本未启用业务逻辑
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "我的笔记",
            "错题本",
            "案例库",
            "Investor Onboarding",
            "Trust & PTC",
            "Fund Documents",
            "AI 导师",
            "商业阅读",
            "登录系统",
            "团队同步",
          ].map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500"
            >
              {name}
              <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-400">
                二期
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* 隐藏的导入 input */}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ActionCard({
  title,
  desc,
  action,
  onClick,
  danger = false,
}: {
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
          danger
            ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
            : "bg-[#0e2a5e] text-white hover:bg-blue-900"
        }`}
      >
        {action}
      </button>
    </div>
  );
}
