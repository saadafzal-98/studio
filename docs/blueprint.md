# **App Name**: Urdu Poultry Receipt Generator

## Core Features:

- Data Input Form: Collects receipt details including date, weight, rate, and previous balance.
- Receipt Preview: Generates a visual representation of the receipt with accurate calculations and Urdu text.
- Receipt Image Generation: Creates a JPG image of the receipt for sharing.
- WhatsApp Sharing: Enables direct sharing of the receipt image via WhatsApp using `navigator.share` or a WhatsApp intent.
- Offline Support: Ensures the application functions without an internet connection.

## Style Guidelines:

- Primary color: Vibrant orange (#FF8C00) to highlight key elements and actions, creating a poultry-related theme.
- Background color: Light slate-gray (#F0F8FF) to provide a clean and modern base for the Urdu interface.
- Accent color: Darker gray (#A9A9A9) for subtle visual cues and separators, maintaining readability without distraction.
- Body and headline font: 'Noto Nastaliq Urdu', serif (system fallback). Note: currently only Google Fonts are supported.
- Mobile-first design with RTL (Right-to-Left) support for Urdu, card-based input sections, and a floating bottom bar.
- Lucide-react icons to provide clear visual cues in an Urdu-friendly context.
- Subtle transitions for generating the receipt, enhancing user experience with minimal disruption.