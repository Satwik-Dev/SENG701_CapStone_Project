import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link 
            to="/login" 
            className="inline-flex items-center text-[#5B6FB5] hover:text-[#4A5FA4] font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-xl flex items-center justify-center">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-1">Last updated: December 8, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              Welcome to SBOM Manager ("Service," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of the SBOM Manager platform, including our website, applications, and related services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By creating an account or using SBOM Manager, you confirm that:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2 ml-4">
              <li>You are at least 18 years of age or have parental/guardian consent</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information you provide is accurate and current</li>
            </ul>
          </section>

          {/* 2. Description of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Description of Service
            </h2>
            <p className="text-gray-700 leading-relaxed">
              SBOM Manager provides a platform for generating, managing, and analyzing Software Bills of Materials (SBOMs) for various software applications. Our Service includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2 ml-4">
              <li>Automated SBOM generation using Anchore Syft</li>
              <li>Multi-platform support (iOS, Android, macOS, Windows, Linux)</li>
              <li>Component analysis and license detection</li>
              <li>Application comparison and version tracking</li>
              <li>Export functionality in SPDX and CycloneDX formats</li>
              <li>Cloud-based storage and management</li>
            </ul>
          </section>

          {/* 3. User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Account Registration</h3>
                <p className="leading-relaxed">
                  You must create an account to use our Service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Account Security</h3>
                <p className="leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Account Termination</h3>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activities.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts to collect information or interact with the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Resell, redistribute, or commercialize the Service without authorization</li>
              <li>Upload content that infringes intellectual property rights</li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">5</span>
              Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.1 Our Content</h3>
                <p className="leading-relaxed">
                  The Service, including its original content, features, and functionality, is owned by SBOM Manager and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Your Content</h3>
                <p className="leading-relaxed">
                  You retain ownership of any software applications and related content you upload to the Service. By uploading content, you grant us a limited license to process, store, and analyze your content solely for the purpose of providing the Service to you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Generated SBOMs</h3>
                <p className="leading-relaxed">
                  You own the SBOMs generated from your uploaded applications. We do not claim ownership of the analysis results or reports generated by the Service.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Data and Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">6</span>
              Data and Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our collection, use, and protection of your personal information is governed by our{' '}
              <Link to="/privacy-policy" className="text-[#5B6FB5] hover:text-[#4A5FA4] font-medium underline">
                Privacy Policy
              </Link>
              . By using the Service, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          {/* 7. Payment and Fees */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">7</span>
              Payment and Fees
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7.1 Free Tier</h3>
                <p className="leading-relaxed">
                  We currently offer the Service free of charge during the beta period. We reserve the right to introduce paid plans in the future.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7.2 Future Pricing</h3>
                <p className="leading-relaxed">
                  If we introduce paid features, we will provide advance notice. Your continued use of paid features constitutes acceptance of the applicable fees.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Disclaimers and Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">8</span>
              Disclaimers and Limitations
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-4">
              <p className="text-gray-800 font-semibold mb-2">IMPORTANT DISCLAIMER</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>We do not guarantee that the Service will be uninterrupted, secure, or error-free</li>
              <li>SBOM analysis results are provided for informational purposes and should be verified</li>
              <li>We are not responsible for the accuracy or completeness of third-party data (e.g., Syft analysis)</li>
              <li>We do not warrant that vulnerabilities or compliance issues will be detected</li>
            </ul>
          </section>

          {/* 9. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">9</span>
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SBOM MANAGER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2 ml-4">
              <li>Your access to or use of (or inability to access or use) the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Unauthorized access, use, or alteration of your content</li>
              <li>Any security vulnerabilities or compliance issues not detected by the Service</li>
            </ul>
          </section>

          {/* 10. Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">10</span>
              Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless SBOM Manager, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2 ml-4">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you upload or transmit through the Service</li>
            </ul>
          </section>

          {/* 11. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">11</span>
              Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice on the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 12. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">12</span>
              Termination
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your access to the Service will be immediately revoked</li>
                <li>Your data may be deleted after a reasonable grace period</li>
                <li>Provisions that by their nature should survive termination will remain in effect</li>
              </ul>
            </div>
          </section>

          {/* 13. Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">13</span>
              Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Maryland, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in Baltimore County, Maryland.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">14</span>
              Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700"><strong>SBOM Manager</strong></p>
              <p className="text-gray-700 mt-2">Email: <a href="mailto:support@sbom-manager.com" className="text-[#5B6FB5] hover:underline">support@sbom-manager.com</a></p>
              <p className="text-gray-700">Address: University of Maryland, Baltimore County</p>
              <p className="text-gray-700">1000 Hilltop Circle, Baltimore, MD 21250</p>
            </div>
          </section>

          {/* Acceptance Notice */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold mb-2">Your Acceptance</p>
                <p className="text-blue-800 text-sm leading-relaxed">
                  By using SBOM Manager, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, please discontinue use of the Service immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[#5B6FB5] hover:text-[#4A5FA4] font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 rotate-90" />
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};