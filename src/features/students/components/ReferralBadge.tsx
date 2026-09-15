import { Badge } from '@/components/ui/badge';

type ReferralBadgeProps = {
  discountPercent: number;
  paidReferralCount: number;
};

export function ReferralBadge({ discountPercent, paidReferralCount }: ReferralBadgeProps) {
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Badge variant={discountPercent > 0 ? 'default' : 'secondary'}>
        {discountPercent}% OFF
      </Badge>
      <span className="text-xs text-muted-foreground">{paidReferralCount} referido(s) con clase paga</span>
    </span>
  );
}
