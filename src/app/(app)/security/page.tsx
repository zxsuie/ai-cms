
import { RlsPolicies } from "@/components/security/rls-policies";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Data Security</h1>
        <p className="text-muted-foreground">
          Manage database Row Level Security (RLS) policies.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Row Level Security</CardTitle>
            <CardDescription>
                Enable or disable RLS for each table. When RLS is enabled, data access is blocked by default until you create policies to grant access.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <RlsPolicies />
        </CardContent>
      </Card>
    </div>
  );
}
