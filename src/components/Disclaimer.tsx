/** 统一课程免责声明：内容依据 + 时点性提醒 + 非意见声明 */
export default function Disclaimer() {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0e2a5e] text-xs text-white">
          i
        </span>
        <div className="text-[13px] leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-700">免责声明</p>
          <p className="mt-1.5">
            本课程根据 2024 年 7 月版《境外私募基金募集与运营法律实务指南》的知识框架，
            并结合 Fund Admin 实务重新整理，仅供学习参考。监管规则、申报要求、表格、期限
            和监管口径可能发生变化。实际工作应根据适用司法辖区的现行法规、官方指引、
            基金文件、服务协议及适当专业意见复核。
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            本内容不构成法律、税务或监管意见，亦不替代任何基金文件或服务协议的约定。
          </p>
        </div>
      </div>
    </section>
  );
}
