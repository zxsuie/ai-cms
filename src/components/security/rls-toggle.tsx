'use client'

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { toggleRls } from "@/app/(app)/security/actions";


export function RlsToggle({ table, isEnabled }: { table: string, isEnabled: boolean }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleRls(table, !isEnabled);
            if (result.success) {
                toast({
                    title: "Success",
                    description: `RLS for table '${table}' has been ${!isEnabled ? 'enabled' : 'disabled'}.`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            }
        });
    }

    return (
        <div className="flex items-center space-x-2 justify-end">
            <Label htmlFor={`rls-toggle-${table}`} className="text-muted-foreground">
                {isEnabled ? 'Disable' : 'Enable'}
            </Label>
            <Switch
                id={`rls-toggle-${table}`}
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
        </div>
    )
}
