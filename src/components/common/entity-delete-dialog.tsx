import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Class } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

type EntityDeleteDialogProps = {
  affectedClasses?: Class[];
  affectedHeading?: string;
  description: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  subjectName?: (subjectId: string) => string;
};

export function EntityDeleteDialog({
  affectedClasses = [],
  affectedHeading,
  description,
  onConfirm,
  onOpenChange,
  open,
  subjectName,
}: EntityDeleteDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {affectedHeading && affectedClasses.length > 0 ? (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <p className="text-sm font-semibold text-orange-200">{affectedHeading}</p>
            <ul className="mt-1 space-y-0.5 text-sm text-orange-200/80">
              {affectedClasses.map((classItem) => (
                <li key={classItem.id}>
                  {formatDate(classItem.date)} · {formatTime(classItem.date)}
                  {subjectName ? ` · ${subjectName(classItem.subjectId)}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel size="default" variant="outline">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
