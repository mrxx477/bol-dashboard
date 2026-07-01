type Status = 'open' | 'verzonden' | 'geannuleerd' | 'actief' | 'inactief';

const styles: Record<Status, string> = {
  open: 'bg-orange-100 text-orange-700',
  verzonden: 'bg-green-100 text-green-700',
  geannuleerd: 'bg-red-100 text-red-600',
  actief: 'bg-green-100 text-green-700',
  inactief: 'bg-gray-100 text-gray-500',
};

const labels: Record<Status, string> = {
  open: 'Open',
  verzonden: 'Verzonden',
  geannuleerd: 'Geannuleerd',
  actief: 'Actief',
  inactief: 'Inactief',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
