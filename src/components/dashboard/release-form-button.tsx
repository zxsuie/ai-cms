'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { StudentVisit } from '@/lib/types';
import { generateAndSaveReleaseForm } from '@/app/(app)/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

export function ReleaseFormButton({ visit }: { visit: StudentVisit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateAndSaveReleaseForm(visit.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        // In a real app, you might open the link: window.open(result.link, '_blank');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate form.',
        });
      }
    });
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Form
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Release Form</DialogTitle>
            <DialogDescription>
              This is a preview of the generated release form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <strong>Student Name:</strong>
              <span>{visit.studentName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <strong>Student ID:</strong>
              <span>{visit.studentId}</span>
            </div>
             <div className="grid grid-cols-2 gap-2">
              <strong>Year & Section:</strong>
              <span>{visit.studentYear} - {visit.studentSection}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <strong>Visit Date:</strong>
              <span>{new Date(visit.timestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <strong>Visit Time:</strong>
              <span>{new Date(visit.timestamp).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })}</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              <strong>Reason for Visit:</strong>
              <p className="text-muted-foreground">{visit.reason}</p>
            </div>
            <div className="grid grid-cols-1 gap-1">
              <strong>Symptoms Reported:</strong>
              <p className="text-muted-foreground">{visit.symptoms}</p>
            </div>
            <div className="grid grid-cols-1 gap-1">
              <strong>Nurse's Note/Suggestion:</strong>
              <p className="text-muted-foreground">{visit.aiSuggestion}</p>
            </div>
             {visit.releaseFormLink && (
              <div className="flex items-center gap-2 pt-4 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Form previously generated: {visit.releaseFormLink}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={handleGenerate} disabled={isPending || !!visit.releaseFormLink}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {visit.releaseFormLink ? 'Generated' : 'Generate & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
