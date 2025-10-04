
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function AgreementPage() {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);

  const handleAgree = () => {
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl sm:text-2xl">
            AI-Powered Clinical Management System
          </CardTitle>
          <CardDescription>User Agreement and Terms of Service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-80 w-full rounded-md border p-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <h3 className="font-bold text-foreground">PROPONENTS:</h3>
              <ul className="list-disc pl-5">
                <li>CHRISTIAN B. JACOB</li>
                <li>MANUEL DIEGO PESUELO</li>
                <li>LESTER ANABE</li>
              </ul>
              <p className="font-bold text-foreground">SEPTEMBER 9, 2025</p>

              <h3 className="font-bold text-foreground pt-4">Terms and Conditions</h3>
              <p>
                These Terms and Conditions (“Terms”) govern the use of the AI-Powered Summarization of Patients’ Medical Records with Online Consultation Support (the “System”). By accessing or using this System, medical professionals, administrators, and authorized staff (“Users”) agree to abide by these Terms.
              </p>

              <h4 className="font-semibold text-foreground">1. User Eligibility</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Only authorized healthcare professionals, administrative staff, and licensed practitioners granted access credentials may use the System.</li>
                <li>Unauthorized access, data tampering, or misuse of credentials is strictly prohibited.</li>
              </ul>

              <h4 className="font-semibold text-foreground">2. User Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Users must ensure that patient data entered into the System is accurate, complete, and up to date.</li>
                <li>Health professionals may use the System only for legitimate healthcare functions such as reviewing summarized medical records, conducting online consultations, or updating patient profiles.</li>
                <li>Administrators are responsible for configuring, maintaining, and monitoring the System in compliance with hospital or clinic policies.</li>
                <li>Users agree not to upload malicious code, attempt unauthorized access, or interfere with the System’s functionality.</li>
              </ul>

              <h4 className="font-semibold text-foreground">3. Data Privacy and Security</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>The System collects and processes sensitive patient health information. All data will be protected in accordance with applicable health data protection laws (e.g., HIPAA, GDPR, or local privacy regulations).</li>
                <li>User credentials must remain confidential. Users are accountable for any activity conducted under their accounts.</li>
                <li>Security analysts and system administrators continuously monitor and safeguard the System against unauthorized access, breaches, or misuse.</li>
              </ul>

              <h4 className="font-semibold text-foreground">4. Acceptable Use Policy</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Users may not exploit the System for fraudulent, unethical, or non-medical purposes.</li>
                <li>Misuse of AI-generated summaries or online consultation tools (e.g., altering patient diagnoses or unauthorized disclosure) is prohibited.</li>
                <li>Data extracted from the System must be used only for legitimate healthcare purposes and not disclosed to unauthorized third parties.</li>
              </ul>

              <h4 className="font-semibold text-foreground">5. System Availability and Maintenance</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>The System strives for high availability; however, occasional downtime may occur due to updates, security patches, or unforeseen technical issues.</li>
                <li>Administrators reserve the right to perform scheduled maintenance to ensure performance, reliability, and security.</li>
                <li>Users will be notified in advance, whenever possible, of major updates or maintenance that could impact usage.</li>
              </ul>

              <h4 className="font-semibold text-foreground">6. AI Summarization and Consultation Disclaimer</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>The AI-powered summarization and online consultation features provide data-driven support, not absolute clinical decisions.</li>
                <li>Final medical judgment must be exercised by licensed practitioners.</li>
                <li>The organization is not liable for misinterpretations or misuse of AI-generated outputs.</li>
              </ul>

              <h4 className="font-semibold text-foreground">7. Intellectual Property</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>All source code, documentation, AI models, and healthcare algorithms within the System remain the intellectual property of the organization.</li>
                <li>Users are granted limited access rights strictly for healthcare operations and may not copy, modify, or redistribute the System without authorization.</li>
              </ul>

              <h4 className="font-semibold text-foreground">8. Accountability and Disciplinary Actions</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violations of these Terms may result in disciplinary actions, including suspension of access, employment-related sanctions, or legal consequences.</li>
                <li>Administrators reserve the right to revoke user access if misuse, negligence, or malicious activity is detected.</li>
              </ul>

              <h4 className="font-semibold text-foreground">9. Amendments</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>These Terms may be updated periodically to reflect organizational policies, regulatory requirements, or system upgrades.</li>
                <li>Continued use of the System after updates constitutes acceptance of the revised Terms.</li>
              </ul>
            </div>
          </ScrollArea>
          <div className="items-top flex space-x-2">
            <Checkbox id="terms1" onCheckedChange={(checked) => setIsAgreed(checked as boolean)} />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the terms and conditions.
              </Label>
            </div>
          </div>
          <Button onClick={handleAgree} disabled={!isAgreed} className="w-full">
            Agree & Continue
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
