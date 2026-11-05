import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { accountEntryPath, accountLabels, accountTypes } from '@/features/accounts/model';
export function WelcomeUserTypeDialog({ open, onOpenChange }: { open: boolean; onOpenChange(value: boolean): void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90svh] overflow-y-auto motion-reduce:animate-none">
      <DialogHeader><DialogTitle className="text-2xl">Welcome to Ayuzee</DialogTitle><DialogDescription className="text-base">Choose your account type. Professional and student access requires review.</DialogDescription></DialogHeader>
      <div className="grid gap-3">{accountTypes.map(type => <Link key={type} className="flex min-h-12 items-center rounded-xl border border-border px-4 py-3 text-lg font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" to={accountEntryPath(type)} onClick={() => onOpenChange(false)}>{accountLabels[type]}</Link>)}</div>
    </DialogContent>
  </Dialog>;
}
