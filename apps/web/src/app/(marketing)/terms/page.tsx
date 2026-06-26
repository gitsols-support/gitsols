import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY } from '@gitsols/constants'
import PageHero from '@/components/marketing/PageHero'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms governing use of the GITSOLS LLC marketing website. Engagement terms are governed by the signed MSA and SoW.',
  alternates: { canonical: '/terms' },
}

const LAST_UPDATED = '2026-05-29'

export default function TermsPage() {
  return (
    <article className="bg-white">
      <PageHero
        eyebrow={`Terms of Use · Last updated ${LAST_UPDATED}`}
        title="Terms for using this website."
        size="sm"
      />

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12 text-[15px] text-gray-700 leading-relaxed">
        <Section id="scope" title="What these terms cover">
          <p>
            These Terms of Use govern your use of the GITSOLS marketing website at gitsols.com.
            They do not govern engagements for services. Engagements are governed by the Master
            Services Agreement (MSA) and Statement of Work (SoW) you sign with{' '}
            {COMPANY.legalName}. If anything in these terms conflicts with a signed MSA or SoW,
            the signed agreement governs that relationship.
          </p>
        </Section>

        <Section id="use" title="Use of the website">
          <p>By accessing or using this site you agree:</p>
          <ul>
            <li>To use the site for lawful purposes only.</li>
            <li>Not to interfere with the operation of the site or with other users.</li>
            <li>
              Not to attempt to access non-public areas of the site (including admin or portal
              surfaces) without authorization.
            </li>
            <li>Not to scrape, crawl, or harvest data at a rate that disrupts service.</li>
            <li>
              To respect rate limits applied to forms and APIs. Excessive submissions may be
              throttled or blocked.
            </li>
          </ul>
        </Section>

        <Section id="content" title="Content & intellectual property">
          <p>
            All content on this site — text, design, code, logos, marks, illustrations — is owned
            by {COMPANY.legalName} or its licensors, and is protected by copyright, trademark,
            and other intellectual-property laws. You may view and share content with attribution
            and a link back. You may not copy substantial portions of the site for republication
            without written permission.
          </p>
          <p>
            Resources we make available for download (such as the free IT audit checklist) are
            provided for your own use. You may use them inside your organization and share with
            advisors; you may not resell them or strip attribution.
          </p>
        </Section>

        <Section id="forms" title="Forms & inquiries">
          <p>
            When you submit a form (contact, free IT audit, service inquiry), you confirm that the
            information is accurate and that you have authority to submit it on behalf of your
            organization. We use the information per our{' '}
            <Link href="/privacy" className="text-[#14B8A6] hover:text-[#0D9488]">
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            Submitting a form does not create a binding agreement to provide services. Engagements
            begin only when both parties sign an MSA and SoW.
          </p>
        </Section>

        <Section id="no-warranty" title="No warranty on website content">
          <p>
            Content on this site (including service descriptions, case studies, blog posts, and
            downloadable resources) is provided &ldquo;as is&rdquo; for informational purposes.
            We do not warrant that content is error-free, current, or fit for any particular
            decision you may make. For specific advice about your environment, engage us under an
            SoW.
          </p>
        </Section>

        <Section id="liability" title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, {COMPANY.legalName} is not liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your
            use of the website. Our total liability for any claim arising from your use of the
            website is limited to one hundred US dollars (US$100).
          </p>
          <p>
            This limitation does not apply to liability that cannot be limited by law (for
            example, gross negligence or willful misconduct), and it does not modify any
            limitations or commitments in a signed MSA, SoW, or BAA, which govern those
            relationships on their own terms.
          </p>
        </Section>

        <Section id="third-party" title="Third-party links">
          <p>
            The site may link to third-party websites or services. We do not control and are not
            responsible for the content or practices of those third parties. Visit them at your
            own risk and review their own terms and privacy policies.
          </p>
        </Section>

        <Section id="changes" title="Changes to these terms">
          <p>
            We may update these Terms of Use from time to time. Material changes will be posted
            here with a revised &ldquo;Last updated&rdquo; date. Continued use of the site after
            the change constitutes acceptance.
          </p>
        </Section>

        <Section id="governing-law" title="Governing law">
          <p>
            These terms are governed by the laws of the State of New Jersey, United States,
            without regard to its conflict of laws principles. Any dispute arising from these
            terms or your use of the site will be brought in the state or federal courts located
            in Middlesex County, New Jersey, and you consent to personal jurisdiction there.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>Questions about these Terms of Use:</p>
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
            These Terms of Use are provided as the public statement of our website terms. They
            are not legal advice and they do not substitute for the specific terms of an MSA, SoW,
            or BAA. Engagements are governed by the signed agreement, not by this page.
          </p>
          <p className="mt-4">
            <Link href="/privacy" className="text-[#14B8A6] hover:text-[#0D9488] font-medium">
              See also: Privacy Policy
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
