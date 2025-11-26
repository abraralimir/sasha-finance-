# **App Name**: Aurum Finance

## Core Features:

- KYC Verification: Collect user's full legal name, document number, and perform face scan. Gemini AI-powered system analyzes the data and document for KYC compliance and fraud detection, marking for admin approval or rejection.
- Admin Verification: Secure admin page (admin1333) to view user KYC details and approve or reject verification. Admin decisions reflected in real-time to the user.
- AI-Powered Loan Assessment: After KYC approval, the user states their desired loan amount; AI, acting as a tool, analyzes creditworthiness and loan eligibility. Decisions and rationale presented to the admin.
- Real-Time Approval/Rejection Notification: Push notifications inform users in real-time of their loan approval or rejection status, whether decided by AI or admin override.
- Secure User Home Page: Authenticated users access a personalized home page with loan status and account information.
- Firestore Integration: Utilize Firestore for storing user data, KYC results, loan requests, and admin decisions. Firebase rules are configured for access control, including temporary permissions for non-verified users during onboarding.

## Style Guidelines:

- Primary color: Deep gold (#D4AF37), evoking feelings of wealth and sophistication. The decision is motivated by the user request of golden themes, but made richer to better evoke luxury.
- Background color: Off-black (#121212), providing a stark contrast to the gold elements, emphasizing the luxury aesthetic.
- Accent color: Warm bronze (#CD7F32), subtly different from gold but visually in harmony.
- Body font: 'Alegreya', serif, for an elegant, intellectual feel that matches the golden theme.
- Headline font: 'Belleza', sans-serif, aligning to the app's implied connection to fashion and design. For body text use Alegreya.
- Two-page layout: Default 'Sasha Loans' page and secured '/admin1333' admin dashboard.
- Animated UI elements: Cool animated boxes slide in to display data, reflecting a modern luxury aesthetic.
- Custom icons with a line art style and golden fill, enhancing the luxurious visual appeal.