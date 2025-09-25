# **App Name**: Project Name

## Core Features:

- Student Visit Logging: Nurses can log student visits with details like name, ID, symptoms, and reason for visit, automatically saved to Google Sheets.
- AI Symptom Suggestion Tool: An AI-powered tool suggests possible diagnoses or next steps based on entered symptoms. This AI suggestion is saved alongside the visit log in Google Sheets.
- Release Form Generation: Generates a PDF release form with student details and stores it in Firebase Storage, linking it back to the student's visit log in Google Sheets.
- Medicine Inventory Management: Tracks medicine stock levels, updates Google Sheets on each dispense, and provides low-stock alerts based on a set threshold.
- Refill Request: Allows nurses to request medicine refills, adding a new row to the 'Requests' sheet in Google Sheets.
- AI-Powered Report Generation: Generates weekly or monthly reports summarizing visit data (number of visits, common symptoms, medicine usage) and exports them as PDFs.
- Role-Based Authentication: Firebase Authentication for secure access, supporting Nurse and Admin roles, without student login.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a sense of trust and professionalism.
- Background color: Light blue (#E8EAF6), subtly desaturated, creating a calm and clean backdrop.
- Accent color: Orange (#FF9800) to draw attention to actions and alerts.
- Headline font: 'Poppins' (sans-serif) for a modern and accessible feel in headings and key UI elements.
- Body font: 'PT Sans' (sans-serif) for clear readability in forms, descriptions and reports.
- Use clear, accessible icons from a material design library.
- Subtle transitions and animations to enhance user experience and provide feedback for interactions.