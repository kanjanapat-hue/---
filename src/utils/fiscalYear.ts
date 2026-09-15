/**
 * Helper utility for Thai Government Fiscal Year (ปีงบประมาณภาครัฐ)
 * The fiscal year runs from October 1 of previous year to September 30 of current year.
 * Months order in fiscal year:
 * 1. ตุลาคม (October)
 * 2. พฤศจิกายน (November)
 * 3. ธันวาคม (December)
 * 4. มกราคม (January)
 * 5. กุมภาพันธ์ (February)
 * 6. มีนาคม (March)
 * 7. เมษายน (April)
 * 8. พฤษภาคม (May)
 * 9. มิถุนายน (June)
 * 10. กรกฎาคม (July)
 * 11. สิงหาคม (August)
 * 12. กันยายน (September)
 */

export interface FiscalYearInfo {
  fiscalYearBE: number; // e.g. 2569
  fiscalYearCE: number; // e.g. 2026
  elapsedMonths: number; // 1 to 12
  startMonthName: string; // "ต.ค."
  currentMonthName: string; // e.g. "ก.ย."
  periodLabel: string; // "ปีงบประมาณ พ.ศ. 2569 (ต.ค. - ก.ย. รวม 12 เดือน)"
  monthIndex: number; // 1 to 12
}

export const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_MONTH_NAMES_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Returns fiscal year details and elapsed months based on a given date.
 */
export function getFiscalYearInfo(date: Date = new Date()): FiscalYearInfo {
  const month = date.getMonth(); // 0 (Jan) - 11 (Dec)
  const yearCE = date.getFullYear();

  // If month is Oct (9), Nov (10), Dec (11), it belongs to next CE fiscal year
  const fiscalYearCE = month >= 9 ? yearCE + 1 : yearCE;
  const fiscalYearBE = fiscalYearCE + 543;

  // Number of months elapsed from October 1 to current month (inclusive)
  const elapsedMonths = month >= 9 ? (month - 9 + 1) : (month + 4);
  const clampedMonths = Math.max(1, Math.min(12, elapsedMonths));

  const currentMonthName = THAI_MONTH_NAMES_SHORT[month];
  const startMonthName = 'ต.ค.';

  return {
    fiscalYearBE,
    fiscalYearCE,
    elapsedMonths: clampedMonths,
    startMonthName,
    currentMonthName,
    monthIndex: clampedMonths,
    periodLabel: `ปีงบประมาณ พ.ศ. ${fiscalYearBE} (${startMonthName} - ${currentMonthName}: รวม ${clampedMonths} เดือน)`
  };
}

/**
 * Calculates the monthly average withdrawal based on total withdrawn and elapsed fiscal months.
 */
export function calculateFiscalMonthlyAverage(totalWithdrawn: number, elapsedMonths: number): number {
  if (!totalWithdrawn || totalWithdrawn <= 0 || !elapsedMonths || elapsedMonths <= 0) {
    return 0;
  }
  const avg = totalWithdrawn / elapsedMonths;
  // Round to 1 decimal place, e.g. 2.5 or 3.0
  const rounded = Math.round(avg * 10) / 10;
  return rounded;
}
