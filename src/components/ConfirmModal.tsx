import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, RotateCcw, Trash2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  icon?: 'warning' | 'danger' | 'restore' | 'delete' | 'success';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'warning',
  icon = 'warning',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          headerBg: 'bg-rose-50 text-rose-800 border-rose-100',
          iconBg: 'bg-rose-100 text-rose-600',
          buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
        };
      case 'success':
        return {
          headerBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          iconBg: 'bg-emerald-100 text-emerald-600',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
        };
      case 'info':
        return {
          headerBg: 'bg-indigo-50 text-indigo-800 border-indigo-100',
          iconBg: 'bg-indigo-100 text-indigo-600',
          buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
        };
      case 'warning':
      default:
        return {
          headerBg: 'bg-amber-50 text-amber-900 border-amber-100',
          iconBg: 'bg-amber-100 text-amber-700',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
        };
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case 'restore':
        return <RotateCcw className="w-5 h-5" />;
      case 'delete':
        return <Trash2 className="w-5 h-5" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col scale-100 transition-transform"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-start justify-between border-b ${styles.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-snug">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs sm:text-sm text-slate-600">
          <p className="leading-relaxed text-slate-700 font-medium">{message}</p>
          {details && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed font-mono whitespace-pre-line">
              {details}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            id="btn-confirm-modal-cancel"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="btn-confirm-modal-ok"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                onConfirm();
              } finally {
                onClose();
              }
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
