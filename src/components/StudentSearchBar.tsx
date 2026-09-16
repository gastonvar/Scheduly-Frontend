import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type StudentSearchBarProps = {
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function StudentSearchBar({
  id,
  onChange,
  placeholder = 'Buscar por nombre o contacto...',
  value,
}: StudentSearchBarProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={placeholder}
        autoComplete="off"
        className="pl-9"
        enterKeyHint="search"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}
