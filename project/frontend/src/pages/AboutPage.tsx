import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  Shield, 
  Target, 
  Users, 
  Zap,
  CheckCircle,
  Award,
  Globe,
  Code,
  Sparkles,
  TrendingUp,
  Lock,
  FileText,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Building2,
  Mail,
  Linkedin,
  Lightbulb,
  Cpu,
  BarChart3
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption and access controls protecting your critical software inventory data.',
      color: 'from-[#5B6FB5] to-[#4A5FA4]'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Advanced algorithms deliver SBOM generation in under 2 minutes using Syft integration.',
      color: 'from-[#6B7FC5] to-[#5B6FB5]'
    },
    {
      icon: Globe,
      title: 'Universal Platform',
      description: 'Seamless analysis across iOS, Android, Windows, macOS, and Linux ecosystems.',
      color: 'from-[#4A5FA4] to-[#3A4F94]'
    },
    {
      icon: Code,
      title: 'Standards Compliant',
      description: 'Full SPDX and CycloneDX format support ensuring industry-wide compatibility.',
      color: 'from-[#7B8FD5] to-[#6B7FC5]'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Advanced visualization and trending analysis for comprehensive supply chain insights.',
      color: 'from-[#5B6FB5] to-[#4A5FA4]'
    },
    {
      icon: Lock,
      title: 'Compliance Ready',
      description: 'Built-in compliance reporting aligned with NIST and CISA SBOM requirements.',
      color: 'from-[#4A5FA4] to-[#3A4F94]'
    }
  ];

  const stats = [
    { label: 'Platforms Supported', value: '5+', icon: Globe },
    { label: 'Detection Accuracy', value: '>90%', icon: Target },
    { label: 'Avg Analysis Time', value: '<1min', icon: Zap },
    { label: 'Export Formats', value: '2+', icon: FileText }
  ];

  const contributors = [
    {
      name: 'Satwik Alla',
      role: 'Founder & Lead Developer',
      title: 'MPS Software Engineering Graduate Student',
      description: 'Built and maintained the entire SBOM Manager platform',
      linkedin: 'https://linkedin.com',
      email: 'satwik@brightaisolutions.com'
    },
    {
      name: 'Dr. Mohammad Samarah',
      role: 'Project Advisor',
      title: 'Project Sponsor',
      description: 'Academic guidance and project oversight',
      linkedin: 'https://linkedin.com',
      email: 'mohammadsamarah@example.com'
    },
    {
      name: 'Dr. Melissa Sahl',
      role: 'Project Advisor',
      title: 'Project Sponsor',
      description: 'Technical guidance and strategic direction',
      linkedin: 'https://linkedin.com',
      email: 'melissasahl@example.com'
    }
  ];

  const resources = [
    {
      title: 'An Empirical Study on Software Bill of Materials: Where We Stand and the Road Ahead',
      source: 'ACM ICSE 2023',
      url: 'https://dl.acm.org/doi/10.1109/ICSE48619.2023.00219',
      description: 'Comprehensive analysis of current SBOM practices and future directions in software security.'
    },
    {
      title: 'A Landscape Study of Open Source and Proprietary Tools for Software Bill of Materials (SBOM)',
      source: 'arXiv 2024',
      url: 'https://arxiv.org/abs/2402.11151',
      description: 'Comparative evaluation of existing SBOM generation tools and methodologies.'
    },
    {
      title: 'BOMs Away! Inside the Minds of Stakeholders: A Comprehensive Study of Bills of Materials for Software Systems',
      source: 'ACM Digital Library',
      url: 'https://dl.acm.org/doi/abs/10.1145/3597503.3623347',
      description: 'Stakeholder perspectives on SBOM adoption and implementation challenges.'
    },
    {
      title: 'Software Bill of Materials (SBOM)',
      source: 'CISA',
      url: 'https://www.cisa.gov/sbom',
      description: 'Official CISA guidelines and requirements for SBOM implementation.'
    },
    {
      title: 'Software Security in Supply Chains: Software Bill of Materials (SBOM)',
      source: 'NIST',
      url: 'https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-security-supply-chains-software-1',
      description: 'NIST framework for software supply chain security and SBOM standards.'
    },
    {
      title: 'Best Practices for Effective BOM Management',
      source: 'Rootstock Cloud ERP',
      url: 'https://www.rootstock.com/cloud-erp-blog/ebom-vs-mbom-management-best-practices/',
      description: 'Industry best practices for bill of materials management and optimization.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#5B6FB5] via-[#4A5FA4] to-[#3A4F94]">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }} />
          </div>
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              {/* Logo/Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/15 backdrop-blur-md rounded-3xl mb-8 border border-white/25 shadow-2xl">
                <div className="relative">
                  <Lightbulb className="w-12 h-12 text-white" />
                  <Cpu className="w-6 h-6 text-white absolute -bottom-1 -right-1" />
                </div>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
                BrightAI Solutions
              </h1>
              
              {/* Tagline */}
              <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto mb-4 leading-relaxed font-medium">
                Transforming Ideas to AI Realities
              </p>
              
              {/* Subtitle */}
              <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
                Revolutionizing Software Supply Chain Security Through Intelligent SBOM Management
              </p>
              
              {/* Badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-white/90 flex-wrap">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/25">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Enterprise-Grade</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/25">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">NIST Compliant</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/25">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Secure by Design</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {/* Mission Section */}
          <div className="mb-20">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#5B6FB5] to-[#3A4F94]" />
              <div className="p-8 lg:p-12">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">Our Mission</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      At <span className="font-semibold text-[#5B6FB5]">BrightAI Solutions</span>, we are dedicated to transforming software supply chain security 
                      through cutting-edge automation and intelligent analysis. We empower developers and organizations with a 
                      powerful, intuitive platform that streamlines SBOM generation, analysis, and comparison across multiple platforms.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Our mission is to make software transparency accessible, helping teams maintain security, compliance, and trust 
                      in an increasingly complex digital ecosystem. As a startup founded by innovators passionate about AI and software 
                      security, we're committed to delivering enterprise-grade solutions that scale with your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4] group-hover:from-[#6B7FC5] group-hover:to-[#5B6FB5] transition-all duration-300" />
                    <div className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-[#5B6FB5]" />
                      </div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Section - Layout */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built with cutting-edge technology to deliver unmatched performance and security
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
                  >
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                    <div className="p-8">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What We Do Section - Card Grid */}
          <div className="mb-20">
            <div className="bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 lg:p-12 text-white">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold">What We Do</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Automated SBOM Generation</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Upload your application files and our advanced Syft-powered system automatically 
                          detects and catalogs all software components, dependencies, and libraries with 
                          industry-leading accuracy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Deep Component Analysis</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Comprehensive analysis of component details including versions, licenses, 
                          vulnerabilities, and dependencies with powerful search and filtering capabilities 
                          for complete visibility.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Advanced Comparison Engine</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Compare SBOMs between different versions or applications to identify changes, 
                          additions, and potential security risks in your software supply chain with 
                          detailed diff analysis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Compliance & Reporting</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Generate compliance-ready reports and export SBOMs in industry-standard formats 
                          (SPDX, CycloneDX) for seamless integration with your existing tools and workflows.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Technology Stack</h2>
                </div>
              </div>
              
              <div className="p-8 lg:p-12">
                <p className="text-gray-700 mb-8 text-lg">
                  Built with modern, battle-tested technologies to ensure performance, security, and scalability:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">FE</span>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Frontend</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#5B6FB5] rounded-full" />
                        <span className="text-gray-700 font-medium">React 18 with TypeScript</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#6B7FC5] rounded-full" />
                        <span className="text-gray-700 font-medium">Tailwind CSS for styling</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#4A5FA4] rounded-full" />
                        <span className="text-gray-700 font-medium">React Router for navigation</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#7B8FD5] rounded-full" />
                        <span className="text-gray-700 font-medium">Recharts for visualization</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4A5FA4] to-[#3A4F94] rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">BE</span>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Backend</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#5B6FB5] rounded-full" />
                        <span className="text-gray-700 font-medium">FastAPI (Python 3.11+)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#6B7FC5] rounded-full" />
                        <span className="text-gray-700 font-medium">Supabase for database</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#4A5FA4] rounded-full" />
                        <span className="text-gray-700 font-medium">Syft for SBOM generation</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#5B6FB5]/5 to-[#4A5FA4]/5 rounded-lg border border-[#5B6FB5]/10">
                        <div className="w-2 h-2 bg-[#7B8FD5] rounded-full" />
                        <span className="text-gray-700 font-medium">JWT authentication</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contributors Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-2xl mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Contributors & Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet the dedicated team behind BrightAI Solutions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {contributors.map((contributor, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
                >
                  <div className="h-2 bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4]" />
                  <div className="p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-full flex items-center justify-center mb-5 mx-auto border-2 border-[#5B6FB5]/20">
                      <span className="text-3xl font-bold text-[#5B6FB5]">
                        {contributor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {contributor.name}
                    </h3>
                    <p className="text-[#5B6FB5] font-semibold text-center mb-1">
                      {contributor.role}
                    </p>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {contributor.title}
                    </p>
                    <p className="text-sm text-gray-700 text-center mb-6 leading-relaxed">
                      {contributor.description}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      {contributor.linkedin && (
                        <a
                          href={contributor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-md"
                        >
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {contributor.email && (
                        <a
                          href={`mailto:${contributor.email}`}
                          className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-md"
                        >
                          <Mail className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Sponsor */}
            <div className="bg-gradient-to-r from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-2xl border-2 border-[#5B6FB5]/20 p-8 lg:p-10">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Sponsor</h3>
                  <p className="text-lg font-semibold text-[#5B6FB5] mb-2">
                    Ethical Software Lab
                  </p>
                  <p className="text-gray-700 mb-1 font-medium">
                    College of Engineering and Information Technology (COEIT)
                  </p>
                  <p className="text-gray-700 font-medium">
                    University of Maryland, Baltimore County (UMBC)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-2xl mb-4 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Research & Resources</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Academic research and industry standards that inform our approach
              </p>
            </div>

            <div className="space-y-5">
              {resources.map((resource, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#5B6FB5]/20">
                            <FileText className="w-5 h-5 text-[#5B6FB5]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5B6FB5] transition-colors">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-[#5B6FB5] font-medium">
                              {resource.source}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed ml-13">
                          {resource.description}
                        </p>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg"
                      >
                        <ExternalLink className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Academic Foundation Note */}
            <div className="mt-10 bg-gradient-to-r from-[#5B6FB5]/10 to-[#4A5FA4]/10 rounded-xl border border-[#5B6FB5]/20 p-6">
              <div className="flex items-start gap-4">
                <GraduationCap className="w-6 h-6 text-[#5B6FB5] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Academic Foundation</h4>
                  <p className="text-gray-700 leading-relaxed">
                    This project is built on rigorous academic research and industry best practices. 
                    The resources listed above represent the cutting edge of SBOM research and have 
                    directly informed our platform's design and implementation. We're committed to 
                    advancing the state of software supply chain security through evidence-based approaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};