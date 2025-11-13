<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/about" class="inline-flex items-center text-primary-400 hover:text-primary-300 mb-4 transition-colors">
        <Icon name="mdi:arrow-left" class="w-5 h-5 mr-2" />
        Back to About
      </NuxtLink>
      <h1 class="text-4xl font-bold gradient-text mb-2">Privacy Policy</h1>
      <p class="text-gray-400">Last updated: {{ lastUpdated }}</p>
    </div>

    <!-- Content -->
    <div class="glass-card p-8 space-y-8">
      <!-- Introduction -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">1. Introduction</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>GeoFlags ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our geography learning platform and services.</p>
          <p>GeoFlags is an open-source project released under the MIT License. The source code is publicly available on GitHub. While the software itself is open-source, this privacy policy governs how we handle user data on our hosted instance of the service.</p>
        </div>
      </section>

      <!-- Information We Collect -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">2. Information We Collect</h2>
        
        <h3 class="text-xl font-semibold text-gray-200 mb-3 mt-6">Personal Information</h3>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>When you register for an account, we collect:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Username</li>
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Optional profile information (avatar, bio)</li>
          </ul>
        </div>

        <h3 class="text-xl font-semibold text-gray-200 mb-3 mt-6">Game Data</h3>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We automatically collect information about your gameplay:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Game scores and statistics</li>
            <li>Game modes played</li>
            <li>Time spent playing</li>
            <li>Progress and achievements</li>
            <li>Leaderboard rankings</li>
          </ul>
        </div>

        <h3 class="text-xl font-semibold text-gray-200 mb-3 mt-6">Technical Information</h3>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We automatically collect certain technical information:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Operating system</li>
            <li>Access times and dates</li>
            <li>Pages viewed and features used</li>
          </ul>
        </div>
      </section>

      <!-- How We Use Your Information -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">3. How We Use Your Information</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We use the collected information for various purposes:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>To provide and maintain our Service</li>
            <li>To manage your account and provide customer support</li>
            <li>To track your game progress and maintain leaderboards</li>
            <li>To personalize your experience</li>
            <li>To improve our Service and develop new features</li>
            <li>To send you updates, notifications, and promotional materials (with your consent)</li>
            <li>To monitor usage and analyze trends</li>
            <li>To detect and prevent fraud, abuse, and security issues</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>
      </section>

      <!-- Data Sharing -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">4. Data Sharing and Disclosure</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We may share your information in the following situations:</p>
          
          <h3 class="text-lg font-semibold text-gray-200 mt-4 mb-2">Public Information</h3>
          <p>Your username and game statistics are publicly visible on leaderboards and may be seen by other users of the Service.</p>

          <h3 class="text-lg font-semibold text-gray-200 mt-4 mb-2">Service Providers</h3>
          <p>We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer support.</p>

          <h3 class="text-lg font-semibold text-gray-200 mt-4 mb-2">Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

          <h3 class="text-lg font-semibold text-gray-200 mt-4 mb-2">Business Transfers</h3>
          <p>In connection with any merger, sale of company assets, financing, or acquisition, your information may be transferred to the acquiring entity.</p>
        </div>
      </section>

      <!-- Data Security -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">5. Data Security</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We implement appropriate technical and organizational security measures to protect your personal information:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Secure password hashing using bcrypt</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure server infrastructure</li>
          </ul>
          <p class="mt-3">As an open-source project, our security practices are transparent and can be reviewed in our public GitHub repository. We welcome responsible security disclosures from the community.</p>
          <p>However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.</p>
        </div>
      </section>

      <!-- Data Retention -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">6. Data Retention</h2>
        <p class="text-gray-300 leading-relaxed">
          We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legal, security, or operational purposes.
        </p>
      </section>

      <!-- Your Rights -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">7. Your Privacy Rights</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>Depending on your location, you may have certain rights regarding your personal information:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your information in a portable format</li>
            <li><strong>Objection:</strong> Object to processing of your personal information</li>
            <li><strong>Restriction:</strong> Request restriction of processing</li>
            <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p class="mt-3">To exercise these rights, please contact us through the contact information provided on our website.</p>
        </div>
      </section>

      <!-- Cookies -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">8. Cookies and Tracking</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>We use cookies and similar tracking technologies to track activity on our Service and store certain information:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
          <p class="mt-3">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
        </div>
      </section>

      <!-- Children's Privacy -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">9. Children's Privacy</h2>
        <p class="text-gray-300 leading-relaxed">
          Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
        </p>
      </section>

      <!-- Third-Party Links -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">10. Third-Party Links</h2>
        <p class="text-gray-300 leading-relaxed">
          Our Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
        </p>
      </section>

      <!-- International Data Transfers -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">11. International Data Transfers</h2>
        <p class="text-gray-300 leading-relaxed">
          Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our Service, you consent to such transfers.
        </p>
      </section>

      <!-- Changes to Privacy Policy -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">12. Changes to This Privacy Policy</h2>
        <p class="text-gray-300 leading-relaxed">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>
      </section>

      <!-- Contact -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">13. Contact Us</h2>
        <p class="text-gray-300 leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us through the About page or at the contact information provided on our website.
        </p>
      </section>
    </div>

    <!-- Back to Top -->
    <div class="mt-8 text-center">
      <button
        @click="scrollToTop"
        class="btn-secondary inline-flex items-center gap-2"
      >
        <Icon name="mdi:arrow-up" class="w-5 h-5" />
        Back to Top
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = 'November 1, 2025'

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({
  title: 'Privacy Policy - GeoFlags',
  description: 'Privacy Policy for GeoFlags - Learn how we collect, use, and protect your personal information.',
})
</script>
