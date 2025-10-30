import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { contactService } from '../services/contactService';
import { 
  Mail, 
  MessageSquare, 
  Send,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await contactService.sendMessage(formData);
      toast.success(result.message);
      setFormData({ subject: '', message: '', category: 'general' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@brightaisolutions.com',
      link: 'mailto:support@brightaisolutions.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      detail: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Address',
      detail: 'UMBC, Baltimore, MD 21250',
      link: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      detail: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
      link: null
    }
  ];

  const socialLinks = [
    { icon: Github, name: 'GitHub', url: 'https://github.com' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com' }
  ];

  const faqs = [
    {
      question: 'How do I upload an application?',
      answer: 'Navigate to the Upload page from the sidebar, drag and drop your application file, or click to browse. Supported formats include APK, IPA, EXE, and more.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support various formats including APK (Android), IPA (iOS), EXE (Windows), DMG (macOS), and source code archives (ZIP, TAR).'
    },
    {
      question: 'How long does SBOM generation take?',
      answer: 'Most SBOMs are generated within 1-2 minutes, depending on the application size and complexity.'
    },
    {
      question: 'Can I export my SBOM data?',
      answer: 'Yes! You can export your SBOMs in industry-standard formats like SPDX and CycloneDX from the application detail page.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600">
              Have questions? We're here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-xl flex items-center justify-center shadow-md">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 ml-4">Send us a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B6FB5] focus:border-transparent transition-all duration-200 bg-white"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="technical">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your inquiry"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B6FB5] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B6FB5] focus:border-transparent resize-none transition-all duration-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#4A5FA4] hover:to-[#3A4F94] focus:outline-none focus:ring-2 focus:ring-[#5B6FB5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-[#5B6FB5]/20 group-hover:to-[#4A5FA4]/20 transition-colors duration-200">
                          <Icon className="w-5 h-5 text-[#5B6FB5]" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          {item.link ? (
                            <a 
                              href={item.link}
                              className="text-sm text-[#5B6FB5] hover:text-[#4A5FA4] transition-colors duration-200 font-medium"
                            >
                              {item.detail}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-600">{item.detail}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center hover:from-[#5B6FB5] hover:to-[#4A5FA4] hover:text-white text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title={social.name}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Response Time */}
              <div className="bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-7 h-7 mr-2" />
                  <h3 className="text-xl font-bold">Quick Response</h3>
                </div>
                <p className="text-sm text-white/95 leading-relaxed">
                  We typically respond to inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600">Quick answers to common questions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-8 h-1 bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4] rounded-full mb-4" />
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{faq.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};