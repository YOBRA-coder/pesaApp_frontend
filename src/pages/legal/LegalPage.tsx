import { useState } from 'react';
import { ArrowLeft, FileText, Shield, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TERMS = {
  title: 'Terms of Use',
  effective: 'Effective: January 1, 2025',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      body: `By accessing or using PesaApp ("the App", "we", "us"), you agree to be bound by these Terms of Use. If you do not agree, you must not use the App. These terms constitute a legally binding agreement between you and PesaApp Technologies Limited, a company incorporated in Kenya.`,
    },
    {
      heading: '2. Eligibility',
      body: `You must be at least 18 years of age to use PesaApp. By registering, you confirm you are 18 or older. We reserve the right to require proof of age at any time. Users found to be under 18 will have their accounts terminated immediately and any funds held will be handled per applicable law.`,
    },
    {
      heading: '3. Account Registration & KYC',
      body: `You must register with a valid Kenyan mobile number. We are required by the Central Bank of Kenya (CBK) and the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) to verify your identity. You agree to provide accurate KYC documents including a government-issued ID and selfie. False documents will result in permanent account suspension and may be reported to authorities.`,
    },
    {
      heading: '4. Wallet & Transactions',
      body: `PesaApp is not a bank. Your wallet balance represents e-money held by PesaApp on your behalf. Deposits are processed via M-Pesa (Safaricom) and Flutterwave. Withdrawals are subject to verification and may take up to 24 hours. Transaction fees are disclosed before each transaction. We reserve the right to hold funds pending investigation of suspicious activity.`,
    },
    {
      heading: '5. Games & Gambling',
      body: `PesaApp offers provably fair games including Aviator, Mines, Plinko, and Dice. All games involve risk and you may lose your entire bet. Games are licensed under [relevant Kenyan gaming authority]. You must not use bots, scripts, or any automated systems. We reserve the right to void winnings suspected of being obtained through exploitation. The house edge is disclosed for each game. Problem gambling resources are available at www.responsiblegambling.co.ke.`,
    },
    {
      heading: '6. Investment Signals',
      body: `Trading signals are for informational purposes only and do not constitute financial advice. Past performance is not indicative of future results. Forex, cryptocurrency, and commodity trading involves substantial risk of loss. You should only trade with funds you can afford to lose. PesaApp is not responsible for any financial losses from acting on signals.`,
    },
    {
      heading: '7. Referral Program',
      body: `The referral program is subject to change or termination at any time. Referral bonuses are credited only when the referred user completes registration, KYC, and their first deposit. Fraudulent referrals (fake accounts, self-referrals) will result in forfeiture of all bonuses and account suspension.`,
    },
    {
      heading: '8. Prohibited Activities',
      body: `You must not: (a) use the App for money laundering or terrorist financing; (b) create multiple accounts; (c) reverse engineer or hack the App; (d) use the App for any illegal purpose; (e) impersonate another person; (f) manipulate game outcomes; (g) share your account with third parties. Violation will result in immediate termination and possible legal action.`,
    },
    {
      heading: '9. Termination',
      body: `We reserve the right to terminate your account at our sole discretion with or without notice. Upon termination, your wallet balance will be paid out to your registered M-Pesa number within 7 business days, subject to verification and any outstanding investigations.`,
    },
    {
      heading: '10. Limitation of Liability',
      body: `To the maximum extent permitted by Kenyan law, PesaApp shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you deposited in the 30 days preceding the claim.`,
    },
    {
      heading: '11. Governing Law',
      body: `These terms are governed by the laws of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.`,
    },
    {
      heading: '12. Changes to Terms',
      body: `We may update these terms at any time. Continued use of the App after changes constitutes acceptance. We will notify users of material changes via SMS or in-app notification.`,
    },
  ],
};

const PRIVACY = {
  title: 'Privacy Policy',
  effective: 'Effective: January 1, 2025',
  sections: [
    {
      heading: '1. Information We Collect',
      body: `We collect: (a) Registration data: phone number, email, name; (b) Identity documents: ID/passport images, selfies for KYC; (c) Transaction data: deposits, withdrawals, game history; (d) Device data: IP address, device type, browser; (e) Usage data: pages visited, features used, timestamps.`,
    },
    {
      heading: '2. How We Use Your Information',
      body: `We use your data to: verify your identity and comply with KYC/AML regulations; process transactions and maintain your wallet; provide customer support; detect and prevent fraud; send transaction notifications and OTPs via SMS; improve our services; comply with legal obligations.`,
    },
    {
      heading: '3. KYC Data',
      body: `Identity documents are stored encrypted on secure servers hosted within East Africa. Documents are shared only with our KYC partner (Smile Identity) for verification purposes. We retain KYC documents for 7 years as required by Kenyan AML law. You may not request deletion of KYC documents during this period.`,
    },
    {
      heading: '4. Data Sharing',
      body: `We share data with: M-Pesa/Safaricom for payment processing; Flutterwave for payment processing; Africa's Talking for SMS delivery; Smile Identity for KYC verification; Cloudinary for secure file storage; Law enforcement when legally required. We do NOT sell your personal data to third parties for marketing.`,
    },
    {
      heading: '5. Data Security',
      body: `We implement industry-standard security: all data encrypted in transit (TLS 1.3) and at rest (AES-256); passwords hashed with bcrypt; JWT tokens for session management; Redis for rate limiting and fraud prevention; regular security audits.`,
    },
    {
      heading: '6. Your Rights (Kenya Data Protection Act 2019)',
      body: `Under the Kenya Data Protection Act, you have the right to: access your personal data; correct inaccurate data; object to certain processing; data portability; lodge a complaint with the Office of the Data Protection Commissioner (ODPC). Contact us at privacy@pesaapp.co.ke to exercise these rights.`,
    },
    {
      heading: '7. Cookies & Tracking',
      body: `We use essential cookies for authentication and session management. We do not use third-party advertising cookies. Analytics are collected anonymously to improve app performance.`,
    },
    {
      heading: '8. Children\'s Privacy',
      body: `PesaApp is strictly for users 18 and older. We do not knowingly collect information from minors. If we discover a minor has registered, we will immediately terminate the account.`,
    },
    {
      heading: '9. Contact',
      body: `Data Controller: PesaApp Technologies Limited\nAddress: Nairobi, Kenya\nEmail: privacy@pesaapp.co.ke\nPhone: +254 700 000 000\nData Protection Officer: dpo@pesaapp.co.ke`,
    },
  ],
};

export default function LegalPage() {
  const navigate = useNavigate();
  const [doc, setDoc] = useState<'terms' | 'privacy'>('terms');
  const content = doc === 'terms' ? TERMS : PRIVACY;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-subtle hover:text-white transition-all">
          <ArrowLeft size={14} />
        </button>
        <h1 className="page-header">Legal</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'terms', label: 'Terms of Use', icon: Scale },
          { id: 'privacy', label: 'Privacy Policy', icon: Shield },
        ].map(t => (
          <button key={t.id} onClick={() => setDoc(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${doc === t.id ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:border-border2'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Document */}
      <div className="card space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-green" />
            <h2 className="font-display font-bold text-xl text-white">{content.title}</h2>
          </div>
          <p className="text-xs text-subtle">{content.effective}</p>
          {doc === 'terms' && (
            <div className="mt-3 p-3 bg-gold/5 border border-gold/20 rounded-xl">
              <p className="text-xs text-gold font-semibold">⚠️ Important</p>
              <p className="text-xs text-muted mt-1">Please read these terms carefully. Using PesaApp means you accept all terms below. If you do not agree, discontinue use immediately.</p>
            </div>
          )}
        </div>

        {content.sections.map((section, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-display font-bold text-white text-sm">{section.heading}</h3>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{section.body}</p>
            {i < content.sections.length - 1 && <div className="border-b border-border mt-4" />}
          </div>
        ))}

        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-subtle">
            Questions? Contact us at{' '}
            <a href="mailto:legal@pesaapp.co.ke" className="text-green hover:underline">legal@pesaapp.co.ke</a>
          </p>
        </div>
      </div>
    </div>
  );
}
