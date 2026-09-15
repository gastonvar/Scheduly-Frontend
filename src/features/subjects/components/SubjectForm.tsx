import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { PRICE_STEP, SUBJECT_PRICE_REFERENCES } from '@/config/constants';
import type { SubjectInput } from '@/features/subjects/api/subjects-api';
import { useSubjectForm } from '@/features/subjects/hooks/useSubjectForm';
import type { Subject } from '@/types';
import { formatCurrency } from '@/utils/format';

type SubjectFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: SubjectInput | Partial<Subject>) => Promise<void>;
  subject?: Subject | null;
};

export function SubjectForm({ isOpen, onClose, onSave, subject }: SubjectFormProps) {
  const {
    error,
    handleSubmit,
    name,
    pricePerHour,
    saving,
    setName,
    setPricePerHour,
    snapPrice,
    snappedPrice,
  } = useSubjectForm({ isOpen, onClose, onSave, subject });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="subject-name">Nombre</Label>
            <Input
              id="subject-name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject-price">Precio por hora</Label>
            <Input
              id="subject-price"
              min={0}
              onBlur={snapPrice}
              onChange={(event) => setPricePerHour(Number(event.target.value))}
              step={PRICE_STEP}
              type="number"
              value={pricePerHour}
            />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <PriceDisplay amount={snappedPrice} label="Vista previa / hora" />
            <p className="mt-2 text-sm text-muted-foreground">
              Referencias:{' '}
              {SUBJECT_PRICE_REFERENCES.map((item, index) => (
                <span key={item.name}>
                  {index > 0 ? ', ' : ''}
                  {item.name}: {formatCurrency(item.pricePerHour)}
                </span>
              ))}
              .
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
