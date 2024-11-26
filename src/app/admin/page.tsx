// src/app/admin/page.tsx
import { ListManager } from '@/components/admin/ListManager';

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      <ListManager />
    </div>
  );
}