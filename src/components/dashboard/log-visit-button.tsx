
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisitLogForm } from './visit-log-form';
import { PlusCircle } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { ScrollArea } from '../ui/scroll-area';

export function LogVisitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useUser();

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Log New Visit
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>New Student Visit</SheetTitle>
            <SheetDescription>Fill in the details for a new student visit. Click save when you're done.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow">
            <div className="py-4 pr-6">
                <VisitLogForm onSuccess={() => setIsOpen(false)} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
