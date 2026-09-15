import React from 'react';
import { MaterialItem } from '../types';
import { Package, Repeat, Clock, Layers } from 'lucide-react';

interface MaterialStatsBarProps {
  materials: MaterialItem[];
  className?: string;
  activeUsageFilter?: string;
  onFilterUsage?: (filter: 'ทั้งหมด' | 'ประจำ' | 'ครั้งคราว') => void;
  compact?: boolean;
}

export const MaterialStatsBar: React.FC<MaterialStatsBarProps> = ({
  materials,
  className = '',
  activeUsageFilter,
  onFilterUsage,
  compact = false
}) => {
  const totalCount = materials.length;
  const regularCount = materials.filter(m => m.usageStatus === 'ประจำ').length;
  const occasionalCount = materials.filter(m => m.usageStatus === 'ครั้งคราว').length;

  const regularPercent = totalCount > 0 ? Math.round((regularCount / totalCount) * 100) : 0;
  const occasionalPercent = totalCount > 0 ? Math.round((occasionalCount / totalCount) * 100) : 0;

  if (compact) {
    return (
      <div
        id="material-stats-compact-bar"
        className={`flex flex-wrap items-center gap-2 text-xs ${className}`}
      >
        <button
          type="button"
          onClick={() => onFilterUsage?.('ทั้งหมด')}
          disabled={!onFilterUsage}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            onFilterUsage ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
          } ${
            activeUsageFilter === 'ทั้งหมด'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="จำนวนรายการชื่อวัสดุทั้งหมด"
        >
          <Package className="w-3.5 h-3.5 text-blue-500" />
          <span>วัสดุทั้งหมด:</span>
          <span className="font-bold font-mono text-xs">{totalCount}</span>
          <span>รายการ</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterUsage?.('ประจำ')}
          disabled={!onFilterUsage}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            onFilterUsage ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
          } ${
            activeUsageFilter === 'ประจำ'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
          }`}
          title="วัสดุที่ใช้ประจำ"
        >
          <Repeat className="w-3.5 h-3.5 text-blue-600" />
          <span>ใช้ประจำ:</span>
          <span className="font-bold font-mono text-xs">{regularCount}</span>
          <span className="text-[10px] opacity-75">({regularPercent}%)</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterUsage?.('ครั้งคราว')}
          disabled={!onFilterUsage}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            onFilterUsage ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
          } ${
            activeUsageFilter === 'ครั้งคราว'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
          title="วัสดุครั้งคราว"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>ใช้ครั้งคราว:</span>
          <span className="font-bold font-mono text-xs">{occasionalCount}</span>
          <span className="text-[10px] opacity-75">({occasionalPercent}%)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="material-stats-global-bar"
      className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 print:hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              ฐานข้อมูลวัสดุ วิทยาลัยการเมืองการปกครอง
            </span>
            <span className="text-xs font-bold text-slate-800">
              สถานะการใช้งานและจำนวนชนิดวัสดุ
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Total Materials */}
          <button
            type="button"
            onClick={() => onFilterUsage?.('ทั้งหมด')}
            disabled={!onFilterUsage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all ${
              onFilterUsage ? 'cursor-pointer hover:border-slate-400' : 'cursor-default'
            } ${
              activeUsageFilter === 'ทั้งหมด'
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                activeUsageFilter === 'ทั้งหมด' ? 'bg-white/10 text-white' : 'bg-white text-slate-700 shadow-2xs'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className={`text-[10px] block leading-tight ${activeUsageFilter === 'ทั้งหมด' ? 'text-slate-300' : 'text-slate-500'}`}>
                วัสดุทั้งหมด
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono leading-tight">{totalCount}</span>
                <span className={`text-[10px] ${activeUsageFilter === 'ทั้งหมด' ? 'text-slate-300' : 'text-slate-500'}`}>รายการ</span>
              </div>
            </div>
          </button>

          {/* Regular Usage Materials */}
          <button
            type="button"
            onClick={() => onFilterUsage?.('ประจำ')}
            disabled={!onFilterUsage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all ${
              onFilterUsage ? 'cursor-pointer hover:border-blue-400' : 'cursor-default'
            } ${
              activeUsageFilter === 'ประจำ'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                activeUsageFilter === 'ประจำ' ? 'bg-white/20 text-white' : 'bg-white text-blue-700 shadow-2xs'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className={`text-[10px] block leading-tight ${activeUsageFilter === 'ประจำ' ? 'text-blue-100' : 'text-blue-700'}`}>
                ใช้ประจำ
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono leading-tight">{regularCount}</span>
                <span className={`text-[10px] ${activeUsageFilter === 'ประจำ' ? 'text-blue-200' : 'text-blue-600'}`}>
                  ({regularPercent}%)
                </span>
              </div>
            </div>
          </button>

          {/* Occasional Usage Materials */}
          <button
            type="button"
            onClick={() => onFilterUsage?.('ครั้งคราว')}
            disabled={!onFilterUsage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all ${
              onFilterUsage ? 'cursor-pointer hover:border-amber-400' : 'cursor-default'
            } ${
              activeUsageFilter === 'ครั้งคราว'
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                activeUsageFilter === 'ครั้งคราว' ? 'bg-white/20 text-white' : 'bg-white text-amber-700 shadow-2xs'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <span className={`text-[10px] block leading-tight ${activeUsageFilter === 'ครั้งคราว' ? 'text-amber-100' : 'text-amber-700'}`}>
                ใช้ครั้งคราว
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono leading-tight">{occasionalCount}</span>
                <span className={`text-[10px] ${activeUsageFilter === 'ครั้งคราว' ? 'text-amber-200' : 'text-amber-600'}`}>
                  ({occasionalPercent}%)
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
