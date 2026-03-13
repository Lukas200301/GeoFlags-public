<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink
        to="/about"
        class="inline-flex items-center text-primary-400 hover:text-primary-300 mb-4 transition-colors"
      >
        <Icon name="mdi:arrow-left" class="w-5 h-5 mr-2" />
        Back to About
      </NuxtLink>
      <h1 class="text-4xl font-bold gradient-text mb-2">Terms of Service</h1>
      <p class="text-gray-400">Last updated: {{ lastUpdated }}</p>
    </div>

    <!-- Content -->
    <div class="glass-card p-8 space-y-8">
      <!-- Introduction -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">1. Agreement to Terms</h2>
        <p class="text-gray-300 leading-relaxed">
          By accessing and using GeoFlags ("the Service"), you accept and agree to be bound by the
          terms and provision of this agreement. If you do not agree to abide by the above, please
          do not use this service.
        </p>
      </section>

      <!-- Use of Service -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">2. Use of Service</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            You must be at least 13 years old to use this Service. By using this Service, you
            represent and warrant that you meet this requirement.
          </p>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these
            Terms. You agree not to:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>
              Use the Service in any way that violates any applicable national or international law
              or regulation
            </li>
            <li>Transmit any material that is defamatory, offensive, or otherwise objectionable</li>
            <li>Attempt to interfere with the proper functioning of the Service</li>
            <li>
              Engage in any automated use of the system, such as using scripts to send comments or
              messages
            </li>
            <li>
              Impersonate or attempt to impersonate the Service, a Service employee, another user,
              or any other person or entity
            </li>
          </ul>
        </div>
      </section>

      <!-- User Accounts -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">3. User Accounts</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. Failure to do so constitutes a breach of the Terms,
            which may result in immediate termination of your account.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and
            for any activities or actions under your password.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us
            immediately upon becoming aware of any breach of security or unauthorized use of your
            account.
          </p>
        </div>
      </section>

      <!-- Intellectual Property -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">
          4. Intellectual Property and License
        </h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            GeoFlags is an open-source project released under the MIT License. The source code is
            available on GitHub and you are free to use, copy, modify, merge, publish, distribute,
            sublicense, and/or sell copies of the software, subject to the terms of the MIT License.
          </p>
          <p>
            The MIT License is provided "AS IS", without warranty of any kind, express or implied.
            For the full license text, please refer to the LICENSE file in the project repository.
          </p>
          <p>
            While the software is open-source, certain assets such as logos, trademarks, and
            user-generated content may be subject to different licensing terms. Third-party
            dependencies and libraries used in this project retain their respective licenses.
          </p>
        </div>
      </section>

      <!-- User Content -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">5. User Content</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            Our Service may allow you to post, link, store, share and otherwise make available
            certain information, text, graphics, or other material ("Content"). You are responsible
            for the Content that you post on or through the Service.
          </p>
          <p>
            By posting Content on or through the Service, you grant us the right and license to use,
            modify, publicly perform, publicly display, reproduce, and distribute such Content on
            and through the Service.
          </p>
          <p>
            You retain any and all of your rights to any Content you submit, post or display on or
            through the Service and you are responsible for protecting those rights.
          </p>
        </div>
      </section>

      <!-- Open Source Contributions -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">5a. Open Source Contributions</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            GeoFlags is an open-source project and welcomes contributions from the community. By
            contributing code, documentation, or other materials to the project, you agree that:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Your contributions will be licensed under the MIT License</li>
            <li>You have the right to submit the contributions</li>
            <li>Your contributions do not violate any third-party rights</li>
            <li>
              You understand that contributions may be modified or rejected at the project
              maintainers' discretion
            </li>
          </ul>
          <p>
            For more information about contributing, please see the project's GitHub repository.
          </p>
        </div>
      </section>

      <!-- Game Scores and Leaderboards -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">6. Game Scores and Leaderboards</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            All game scores and statistics are recorded and displayed through our leaderboard
            system. By playing games on our platform, you consent to your scores being publicly
            displayed.
          </p>
          <p>
            We reserve the right to remove or adjust scores that we determine to be fraudulent,
            achieved through cheating, or otherwise obtained in violation of these Terms.
          </p>
          <p>
            Users found to be manipulating scores or using automated systems to play games will have
            their accounts suspended or terminated.
          </p>
        </div>
      </section>

      <!-- Termination -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">7. Termination</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            We may terminate or suspend your account and bar access to the Service immediately,
            without prior notice or liability, under our sole discretion, for any reason whatsoever
            and without limitation, including but not limited to a breach of the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue using the Service or
            contact us to request account deletion.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall
            survive termination, including, without limitation, ownership provisions, warranty
            disclaimers, indemnity and limitations of liability.
          </p>
        </div>
      </section>

      <!-- Disclaimer -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">8. Disclaimer</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and
            "AS AVAILABLE" basis, in accordance with the MIT License. The Service is provided
            without warranties of any kind, whether express or implied, including, but not limited
            to, implied warranties of merchantability, fitness for a particular purpose,
            non-infringement or course of performance.
          </p>
          <p>
            As stated in the MIT License: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          </p>
          <p>
            GeoFlags does not warrant that (a) the Service will function uninterrupted, secure or
            available at any particular time or location; (b) any errors or defects will be
            corrected; (c) the Service is free of viruses or other harmful components; or (d) the
            results of using the Service will meet your requirements.
          </p>
        </div>
      </section>

      <!-- Limitation of Liability -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">9. Limitation of Liability</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            In no event shall GeoFlags, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential or
            punitive damages, including without limitation, loss of profits, data, use, goodwill, or
            other intangible losses, resulting from:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use or alteration of your transmissions or content</li>
          </ul>
        </div>
      </section>

      <!-- Changes to Terms -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">10. Changes to Terms</h2>
        <div class="text-gray-300 leading-relaxed space-y-3">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. If a revision is material, we will provide at least 30 days notice prior to any
            new terms taking effect.
          </p>
          <p>
            By continuing to access or use our Service after any revisions become effective, you
            agree to be bound by the revised terms. If you do not agree to the new terms, you are no
            longer authorized to use the Service.
          </p>
        </div>
      </section>

      <!-- Governing Law -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">11. Governing Law</h2>
        <p class="text-gray-300 leading-relaxed">
          These Terms shall be governed and construed in accordance with the laws of your
          jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any
          right or provision of these Terms will not be considered a waiver of those rights.
        </p>
      </section>

      <!-- Contact -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-100 mb-4">12. Contact Us</h2>
        <p class="text-gray-300 leading-relaxed">
          If you have any questions about these Terms, please contact us through the About page or
          at the contact information provided on our website.
        </p>
      </section>
    </div>

    <!-- Back to Top -->
    <div class="mt-8 text-center">
      <button @click="scrollToTop" class="btn-secondary inline-flex items-center gap-2">
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
  title: 'Terms of Service - GeoFlags',
  description:
    'Terms of Service for GeoFlags - Read our terms and conditions for using our geography learning platform.',
})
</script>
