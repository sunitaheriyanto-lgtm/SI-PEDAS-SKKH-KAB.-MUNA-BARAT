import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorScheme: "default" | "emerald" | "amber" | "indigo";
  trend?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
}: StatCardProps) {
  const schemeClasses = {
    indigo: {
      border: "border-gray-150 border-b-4 border-b-blue-500",
      bgGradient: "bg-white",
      iconContainer: "bg-blue-50 text-blue-600",
      titleColor: "text-blue-605 font-bold",
      textTheme: "text-slate-800",
      badge: "bg-blue-50 text-blue-700 border-blue-100",
      ripple: "bg-blue-300/5",
    },
    emerald: {
      border: "border-gray-150 border-b-4 border-b-emerald-500",
      bgGradient: "bg-white",
      iconContainer: "bg-emerald-50 text-emerald-600",
      titleColor: "text-emerald-605 font-bold",
      textTheme: "text-slate-800",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      ripple: "bg-emerald-300/5",
    },
    amber: {
      border: "border-gray-150 border-b-4 border-b-amber-500",
      bgGradient: "bg-white",
      iconContainer: "bg-amber-50 text-amber-605",
      titleColor: "text-amber-605 font-bold",
      textTheme: "text-slate-800",
      badge: "bg-amber-50 text-amber-700 border-amber-100",
      ripple: "bg-amber-300/5",
    },
    default: {
      border: "border-gray-150 border-b-4 border-b-rose-500",
      bgGradient: "bg-white",
      iconContainer: "bg-rose-50 text-rose-600",
      titleColor: "text-rose-605 font-bold",
      textTheme: "text-slate-800",
      badge: "bg-rose-50 text-rose-700 border-rose-100",
      ripple: "bg-rose-300/5",
    },
  };

  const scheme = schemeClasses[colorScheme] || schemeClasses.default;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border ${scheme.border} transition-all duration-300 flex flex-col justify-between`}
    >
      {/* Background Micro Ripples */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${scheme.ripple} rounded-full pointer-events-none`}></div>

      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <span className={`text-xs uppercase tracking-wider font-extrabold ${scheme.titleColor} block`}>
            {title}
          </span>
          <div className="space-y-1">
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${scheme.textTheme}`}>
              {value}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl ${scheme.iconContainer} shadow-sm border border-transparent shrink-0`}>
          <Icon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scheme.badge}`}>
            {trend}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase font-mono tracking-wider">Aktif</span>
        </div>
      )}
    </motion.div>
  );
}
