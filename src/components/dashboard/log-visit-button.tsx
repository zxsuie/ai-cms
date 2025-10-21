
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisitLogForm } from './visit-log-form';
import { Plus } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function LogVisitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useUser();

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    onClick={() => setIsOpen(true)} 
                    className="w-14 h-14 rounded-full shadow-lg"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
                <p>Log New Visit</p>
            </TooltipContent>
        </Tooltip>
      </div>

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
