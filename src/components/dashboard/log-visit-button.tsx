
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisitLogForm } from './visit-log-form';
import { PlusCircle } from 'lucide-react';

export function LogVisitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Log New Visit
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>New Student Visit</SheetTitle>
            <SheetDescription>Fill in the details for a new student visit. Click save when you're done.</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <VisitLogForm onSuccess={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
