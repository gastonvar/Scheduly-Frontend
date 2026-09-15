import { formatCurrency } from '@/utils/format';

type PriceDisplayProps = {
  amount: number;
  label?: string;
  className?: string;
};

export function PriceDisplay({ amount, className = '', label }: PriceDisplayProps) {
  return (
    <span className={`inline-flex flex-col ${className}`}>
      {label ? <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span> : null}
      <span className="font-bold text-white">{formatCurrency(amount)}</span>
    </span>
  );
}
