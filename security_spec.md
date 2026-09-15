# Firebase Security Specification

## 1. Data Invariants
1. **Material Document Invariant**:
   - `id` must be non-empty string <= 64 chars matching alphanumeric/Thai code structure.
   - `name` must be a valid string <= 200 chars.
   - `currentStock`, `unitPrice`, `minQty`, and `maxQty` must be non-negative numbers.
   - `refillStatus` must be one of `['OK', 'ใกล้หมด', 'วัสดุหมด']`.
   - `usageStatus` must be one of `['ประจำ', 'ครั้งคราว']`.

2. **Order Document Invariant**:
   - `docNo` must be non-empty string <= 64 chars.
   - `requesterName` and `department` are required strings <= 150 chars.
   - `status` must be one of `['รออนุมัติ', 'อนุมัติแล้ว', 'เบิกจ่ายแล้ว', 'ยกเลิก']`.
   - `totalItems` and `totalAmount` must be non-negative numbers.

3. **StockIn Record Invariant**:
   - `quantity` must be positive (> 0).
   - `materialId` must reference a valid material identifier.
   - `docNo`, `date`, `receiverName` are required non-empty strings.

4. **StockOut Record Invariant**:
   - `quantity` must be positive (> 0).
   - `materialId` must reference a valid material identifier.
   - `requisitionDocNo`, `date`, `requesterName` are required non-empty strings.

---

## 2. The Dirty Dozen Attack Payloads
1. **Ghost Field Poisoning**: Payload with unauthorized `isAdmin: true` in user or material profile. (Result: REJECTED)
2. **Negative Stock Insertion**: `currentStock: -999` in material create/update. (Result: REJECTED)
3. **Huge String DOS**: `name: 'A' * 200000` attempting buffer/memory bloat. (Result: REJECTED)
4. **Invalid Status Transition**: Setting `status: 'hacked_approved'` on an order. (Result: REJECTED)
5. **Path ID Poisoning**: Document ID with `/../etc/passwd` or oversized junk strings. (Result: REJECTED)
6. **Negative Price Attack**: `unitPrice: -500` to corrupt accounting balance. (Result: REJECTED)
7. **Zero Quantity Stock In**: `quantity: 0` or negative quantity in stock log. (Result: REJECTED)
8. **Spoofed Email Access**: Attempting writes without proper validation checks. (Result: REJECTED)
9. **Blank Document Number**: `docNo: ""` attempting to bypass audit trails. (Result: REJECTED)
10. **Malicious Image Script**: `imageUrl: "javascript:alert(1)"` or oversized payloads exceeding constraints. (Result: REJECTED)
11. **Orphaned Stock Out**: StockOut transaction without `materialId` or `requisitionDocNo`. (Result: REJECTED)
12. **Double State Shortcutting**: Overwriting an already disbursed order back to pending without admin authorization. (Result: REJECTED)
