import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ItemActionsProps = {
  editLabel?: string;
  deleteLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function ItemActions({
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  onEdit,
  onDelete,
  className,
}: ItemActionsProps) {
  if (!onEdit && !onDelete) {
    return null;
  }

  return (
    <div className={cn('flex shrink-0 items-center gap-1.5', className)}>
      {onEdit ? (
        <Button aria-label={editLabel} onClick={onEdit} size="icon" type="button" variant="outline">
          <Pencil />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          aria-label={deleteLabel}
          className="text-destructive hover:bg-destructive/20 hover:text-destructive"
          onClick={onDelete}
          size="icon"
          type="button"
          variant="outline"
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}
