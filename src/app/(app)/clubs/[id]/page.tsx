import MemberTable from './MemberTable';
import AddPlayerModal from './modal/AddPlayerModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Club() {
  return (
    <div>
      <h1>Club</h1>
      <AddPlayerModal>
        <Button>
          <Plus data-icon="inline-start" />
          Add Player
        </Button>
      </AddPlayerModal>
      <MemberTable />
    </div>
  );
}
