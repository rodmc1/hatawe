import { ClubList } from './_components/ClubList';

export default function ClubsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-lg font-semibold text-foreground">Clubs</h1>
      <ClubList />
    </div>
  );
}
