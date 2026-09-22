import Link from "next/link";

interface Props {
  title: string;
  value: number | string | undefined;
  href?: string;
  onClick?: () => void;
  /** 点击后关闭弹框回调（href 模式触发） */
  onClose?: () => void;
  /** 强调色，默认主色 #198348 */
  accent?: string;
}

/** 通知铃铛下拉统计卡片 V2 — 微渐变背景 + 顶部色条 + 大数字 */
const NoticeCard = ({
  title,
  value,
  href,
  onClick,
  onClose,
  accent = "#198348",
}: Props) => {
  const content = (
    <div
      className="
        group relative px-3.5 py-2.5 min-w-[110px] rounded-lg overflow-hidden cursor-pointer
        bg-white border border-gray-100
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:border-transparent
      "
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 6%, transparent) 0%, transparent 55%)`,
      }}
    >
      {/* 顶部强调色条（带渐变） */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, color-mix(in srgb, ${accent} 50%, transparent) 100%)`,
        }}
      />

      {/* 右上角状态小点 */}
      <div
        className="absolute top-2 right-2 w-1 h-1 rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accent }}
      />

      <div className="text-[12px] uppercase tracking-[0.08em] text-gray-500 font-medium mb-1">
        {title}
      </div>
      <div
        className="text-[18px] font-bold leading-none transition-all duration-300 origin-left group-hover:scale-105"
        style={{ color: accent }}
      >
        {value ?? 0}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClose} className="no-underline">
        {content}
      </Link>
    );
  }
  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  );
};

export default NoticeCard;
