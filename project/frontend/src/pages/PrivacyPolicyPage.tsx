import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Server, UserCheck, Globe } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              At SBOM Manager ("we," "us," or "our"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully to understand our practices regarding your personal data.
            </p>
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-semibold mb-2">Your Privacy Matters</p>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    We are committed to protecting your personal information and being transparent about our data practices. If you have any questions about this Privacy Policy, please contact us at privacy@sbom-manager.com.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#5B6FB5]" />
                  1.1 Information You Provide Directly
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  When you register for an account or use our Service, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                  <li><strong>Profile Information:</strong> Optional profile details you choose to provide</li>
                  <li><strong>Application Files:</strong> Software applications you upload for SBOM generation</li>
                  <li><strong>Communications:</strong> Messages you send through our contact forms or support channels</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#5B6FB5]" />
                  1.2 Information Collected Automatically
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  When you access the Service, we automatically collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on the Service</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
                  <li><strong>Cookies:</strong> Session identifiers and authentication tokens (see Section 7)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#5B6FB5]" />
                  1.3 Information from Third Parties
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We may receive information from:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Anchore Syft:</strong> Component analysis results from uploaded applications</li>
                  <li><strong>Authentication Providers:</strong> If using OAuth (future feature)</li>
                  <li><strong>Analytics Services:</strong> Aggregated usage statistics (anonymized)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>• Provide and maintain the Service</li>
                  <li>• Generate and store SBOMs</li>
                  <li>• Process application uploads</li>
                  <li>• Enable comparison features</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Account Management</h4>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>• Create and manage your account</li>
                  <li>• Authenticate your identity</li>
                  <li>• Send password reset emails</li>
                  <li>• Respond to your requests</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Improvement & Analytics</h4>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>• Analyze usage patterns</li>
                  <li>• Improve Service features</li>
                  <li>• Fix bugs and errors</li>
                  <li>• Optimize performance</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>• Send service notifications</li>
                  <li>• Provide customer support</li>
                  <li>• Send security alerts</li>
                  <li>• Share product updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. How We Share Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              How We Share Your Information
            </h2>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg mb-4">
              <p className="text-green-900 font-semibold mb-2">We Do Not Sell Your Data</p>
              <p className="text-green-800 text-sm leading-relaxed">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information only in the following limited circumstances:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may share information with trusted third-party service providers who assist us in operating the Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                  <li><strong>Supabase:</strong> Database hosting and authentication</li>
                  <li><strong>Vercel:</strong> Frontend hosting</li>
                  <li><strong>Render:</strong> Backend API hosting</li>
                  <li><strong>Resend:</strong> Email delivery service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                  <li>Comply with legal obligations</li>
                  <li>Protect our rights or property</li>
                  <li>Prevent fraud or security threats</li>
                  <li>Protect the safety of users or the public</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you via email and/or prominent notice on our Service of any such change in ownership.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <Lock className="w-10 h-10 text-[#5B6FB5] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                <p className="text-sm text-gray-700">
                  All data is encrypted in transit (HTTPS/TLS 1.3) and at rest
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-10 h-10 text-[#5B6FB5] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Authentication</h4>
                <p className="text-sm text-gray-700">
                  JWT tokens with bcrypt password hashing and secure sessions
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <Server className="w-10 h-10 text-[#5B6FB5] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Access Control</h4>
                <p className="text-sm text-gray-700">
                  Row-level security and restricted database access
                </p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900 font-semibold mb-2">Security Disclaimer</p>
              <p className="text-yellow-800 text-sm leading-relaxed">
                While we implement robust security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </div>
          </section>

          {/* 5. Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">5</span>
              Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Application Files & SBOMs:</strong> Retained until you delete them or close your account</li>
              <li><strong>Usage Logs:</strong> Retained for up to 90 days for security and analytics</li>
              <li><strong>Legal Compliance:</strong> Some data may be retained longer if required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          {/* 6. Your Privacy Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">6</span>
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#5B6FB5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B6FB5] font-bold">→</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Right to Access</h4>
                  <p className="text-gray-700 text-sm">Request a copy of your personal data</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#5B6FB5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B6FB5] font-bold">→</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Right to Correction</h4>
                  <p className="text-gray-700 text-sm">Update or correct inaccurate information</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#5B6FB5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B6FB5] font-bold">→</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Right to Deletion</h4>
                  <p className="text-gray-700 text-sm">Request deletion of your personal data</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#5B6FB5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B6FB5] font-bold">→</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Right to Portability</h4>
                  <p className="text-gray-700 text-sm">Export your data in a machine-readable format</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#5B6FB5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B6FB5] font-bold">→</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Right to Opt-Out</h4>
                  <p className="text-gray-700 text-sm">Unsubscribe from marketing communications</p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@sbom-manager.com" className="text-[#5B6FB5] hover:underline font-medium">
                privacy@sbom-manager.com
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          {/* 7. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">7</span>
              Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 text-gray-900 font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b">Cookie Type</th>
                    <th className="px-6 py-3 border-b">Purpose</th>
                    <th className="px-6 py-3 border-b">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="px-6 py-4 font-medium">Essential</td>
                    <td className="px-6 py-4">Authentication, security, session management</td>
                    <td className="px-6 py-4">Session / 7 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-6 py-4 font-medium">Functional</td>
                    <td className="px-6 py-4">Remember preferences and settings</td>
                    <td className="px-6 py-4">30 days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Analytics</td>
                    <td className="px-6 py-4">Usage statistics and performance monitoring</td>
                    <td className="px-6 py-4">90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookie preferences through your browser settings. Note that disabling essential cookies may affect Service functionality.
            </p>
          </section>

          {/* 8. Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">8</span>
              Third-Party Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service uses the following third-party providers:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database and authentication (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#5B6FB5] hover:underline">Privacy Policy</a>)</li>
              <li><strong>Vercel:</strong> Frontend hosting (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#5B6FB5] hover:underline">Privacy Policy</a>)</li>
              <li><strong>Render:</strong> Backend hosting (<a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#5B6FB5] hover:underline">Privacy Policy</a>)</li>
              <li><strong>Resend:</strong> Email delivery (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#5B6FB5] hover:underline">Privacy Policy</a>)</li>
              <li><strong>Anchore Syft:</strong> SBOM generation (open-source, runs on our servers)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These providers have their own privacy policies. We encourage you to review their policies to understand how they handle your data.
            </p>
          </section>

          {/* 9. International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">9</span>
              International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have data protection laws different from your jurisdiction. By using the Service, you consent to such transfers. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">10</span>
              Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information from our systems.
            </p>
          </section>

          {/* 11. Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">11</span>
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2 ml-4">
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last updated" date at the top</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Your continued use of the Service after such modifications constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* 12. Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#5B6FB5] text-white rounded-lg flex items-center justify-center text-sm font-bold">12</span>
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700"><strong>Privacy Officer - SBOM Manager</strong></p>
              <p className="text-gray-700 mt-2">Email: <a href="mailto:privacy@sbom-manager.com" className="text-[#5B6FB5] hover:underline">privacy@sbom-manager.com</a></p>
              <p className="text-gray-700">Support: <a href="mailto:support@sbom-manager.com" className="text-[#5B6FB5] hover:underline">support@sbom-manager.com</a></p>
              <p className="text-gray-700 mt-2">Address: University of Maryland, Baltimore County</p>
              <p className="text-gray-700">1000 Hilltop Circle, Baltimore, MD 21250</p>
            </div>
          </section>

          {/* GDPR & CCPA Notice */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-900 font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Privacy Rights Under GDPR & CCPA
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>European Users (GDPR):</strong> You have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. Contact us to exercise these rights.
              </p>
              <p>
                <strong>California Residents (CCPA):</strong> You have the right to know what personal information is collected, request deletion, opt-out of sale (we don't sell data), and non-discrimination for exercising your rights.
              </p>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900 font-semibold mb-2">Your Consent</p>
                <p className="text-green-800 text-sm leading-relaxed">
                  By using SBOM Manager, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
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