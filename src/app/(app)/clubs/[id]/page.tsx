import MemberTable from './MemberTable';
import AddPlayerModal from './modal/AddPlayerModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function Club() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-lg font-semibold text-foreground">Club</h1>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Members</span>
            <AddPlayerModal>
              <Button>
                <Plus data-icon="inline-start" />
                Add Player
              </Button>
            </AddPlayerModal>
          </div>
        </CardHeader>
        <CardContent>
          <MemberTable />
        </CardContent>
      </Card>
    </div>
  );
}
