import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY } from '@gitsols/constants'
import PageHero from '@/components/marketing/PageHero'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How GITSOLS LLC collects, uses, and protects information from the marketing site, the client portal, and the services we deliver — including HIPAA and financial-services-specific handling.',
  alternates: { canonical: '/privacy' },
}

const LAST_UPDATED = '2026-05-29'

export default function PrivacyPage() {
  return (
    <article className="bg-white">
      <PageHero
        eyebrow={`Privacy Policy · Last updated ${LAST_UPDATED}`}
        title="How we handle your information."
        size="sm"
      />

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12 text-[15px] text-gray-700 leading-relaxed">
        <Section id="overview" title="Overview">
          <p>
            {COMPANY.legalName} (&ldquo;GITSOLS,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
            provides managed IT, cybersecurity, compliance, and software development services to
            businesses in regulated industries. This Privacy Policy describes how we collect, use,
            disclose, and protect information through our marketing website, client portal, and
            the services we deliver.
          </p>
          <p>
            This page is written in plain language. If anything here conflicts with the Master
            Services Agreement (MSA) signed by a client, or with a Business Associate Agreement
            (BAA) entered into under HIPAA, the signed agreement governs that relationship.
          </p>
        </Section>

        <Section id="information-we-collect" title="Information we collect">
          <p>We collect three categories of information:</p>

          <h3 className="mt-6 text-base font-semibold text-[#0F4C4C]">From the marketing site</h3>
          <ul>
            <li>
              Information you submit through forms (free IT audit, contact, service inquiry,
              bespoke scope request): name, work email, phone number, company name, message, and
              the service or industry you indicated.
            </li>
            <li>
              Technical information automatically logged when you visit: IP address, browser
              user-agent, referring URL, pages visited, and timestamps.
            </li>
            <li>
              Cookies and similar technologies used for session management and basic analytics.
              We do not place advertising trackers.
            </li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-[#0F4C4C]">From client engagements</h3>
          <ul>
            <li>Authentication metadata — name, work email, role, and account membership.</li>
            <li>Engagement and project metadata — milestones, approvals, status, and feedback you submit.</li>
            <li>Files and documents you upload to the client portal (SoWs, runbooks, reports).</li>
            <li>Support tickets and the conversation history they generate.</li>
            <li>Usage logs of the platform, including access times, IP, and actions taken.</li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-[#0F4C4C]">
            From the services we deliver
          </h3>
          <ul>
            <li>
              Operational information about your environment that we need to run the contracted
              service — asset inventories, network topology, system configurations, monitoring
              telemetry, and security event data.
            </li>
            <li>
              Where the engagement requires it, Protected Health Information (PHI) under HIPAA or
              other regulated data. We handle PHI under the terms of a signed BAA.
            </li>
          </ul>
        </Section>

        <Section id="how-we-use" title="How we use information">
          <ul>
            <li>To respond to your inquiry and deliver the services you have engaged us for.</li>
            <li>To operate, maintain, secure, and improve the marketing site and client portal.</li>
            <li>To send transactional communications about engagements (status, approvals, invoices).</li>
            <li>To send occasional educational communications about our services (you can opt out at any time).</li>
            <li>To detect, investigate, and respond to security events.</li>
            <li>To comply with legal obligations and to enforce our agreements.</li>
          </ul>
          <p>
            We do not sell information. We do not share information with third-party advertisers.
            We do not use client data to train general-purpose AI models.
          </p>
        </Section>

        <Section id="sharing" title="When we share information">
          <p>We share information only in the following situations:</p>
          <ul>
            <li>
              <strong>Service providers and subprocessors</strong> we use to operate our business
              (e.g. cloud hosting, transactional email, e-signature). They are bound by confidentiality
              and security obligations and use information only to perform services for us.
            </li>
            <li>
              <strong>With your direction</strong> — for example, contacting a vendor on your behalf
              during an engagement, or sharing audit findings with your auditor.
            </li>
            <li>
              <strong>Legal requirements</strong> — when required by law, valid legal process, or to
              protect the rights, safety, or property of GITSOLS, our clients, or others.
            </li>
            <li>
              <strong>Business transfers</strong> — if GITSOLS is involved in a merger, acquisition,
              or sale of assets, information may be transferred subject to this Privacy Policy.
            </li>
          </ul>
        </Section>

        <Section id="security" title="Security">
          <ul>
            <li>Encryption in transit (TLS 1.3) and at rest (AES-256) for the platform and managed environments.</li>
            <li>Multi-factor authentication enforced for staff and for client portal Primary Contacts.</li>
            <li>Audit logging on access to client data — append-only, retained for 7 years.</li>
            <li>Network segmentation, vulnerability scanning, and quarterly access reviews.</li>
            <li>Documented incident response, with notification commitments per agreement and law.</li>
          </ul>
          <p>
            For engagements that involve PHI under HIPAA, additional administrative, physical, and
            technical safeguards apply as documented in the BAA and our HIPAA Risk Assessment.
          </p>
        </Section>

        <Section id="retention" title="Retention">
          <p>
            We retain information for as long as needed to deliver services, meet legal and
            regulatory obligations (including 7-year audit-log retention for clients in regulated
            industries), resolve disputes, and enforce agreements. When information is no longer
            needed, we delete or de-identify it.
          </p>
        </Section>

        <Section id="your-rights" title="Your rights">
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or port
            information we hold about you, and to object to or restrict certain processing.
            Contact us at{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-[#14B8A6] hover:text-[#0D9488]">
              {COMPANY.email}
            </a>{' '}
            to exercise these rights.
          </p>
          <p>
            Marketing emails include an unsubscribe link. Unsubscribing does not stop transactional
            messages tied to an active engagement.
          </p>
        </Section>

        <Section id="children" title="Children">
          <p>
            Our services are not directed to children under 16, and we do not knowingly collect
            information from children.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be posted
            here with a revised &ldquo;Last updated&rdquo; date. Continued use of our services after
            the change constitutes acceptance.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>
            Questions about this policy or about how we handle your information:
          </p>
          <p className="mt-2">
            {COMPANY.legalName}
            <br />
            {COMPANY.address.street}
            <br />
            {COMPANY.address.city}, {COMPANY.address.regionCode} {COMPANY.address.postalCode}
            <br />
            <a href={`mailto:${COMPANY.email}`} className="text-[#14B8A6] hover:text-[#0D9488]">
              {COMPANY.email}
            </a>
            {' · '}
            <a href={`tel:${COMPANY.phoneE164}`} className="text-[#14B8A6] hover:text-[#0D9488]">
              {COMPANY.phone}
            </a>
          </p>
        </Section>

        <div className="border-t border-[#E2E8E8] pt-8 text-xs text-gray-500">
          <p>
            This Privacy Policy is provided as the public statement of our practices. It is not
            legal advice, and it does not substitute for the specific terms of an MSA or BAA. If you
            need detailed information about how we will handle data for a specific engagement, ask
            for the data-handling addendum to the SoW.
          </p>
          <p className="mt-4">
            <Link href="/terms" className="text-[#14B8A6] hover:text-[#0D9488] font-medium">
              See also: Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </article>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="prose-section">
      <h2 className="text-2xl font-bold text-[#0F4C4C] mb-4 scroll-mt-24">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-3 [&_strong]:text-[#0F4C4C]">
        {children}
      </div>
    </section>
  )
}
