"use client";

import { motion } from "framer-motion";
import Header from "@/app/app/componenets/Header";
import Hero from "@/app/app/componenets/Hero";
import KeyFeatures from "@/app/app/componenets/KeyFeatures";
import FeatureSection from "@/app/app/componenets/FeatureSection";
import FAQ from "@/app/app/componenets/FAQ";
import CTA from "@/app/app/componenets/CTA";
import Footer from "@/app/app/componenets/Footer";

// SVG Components for Feature Sections
const DashboardSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <rect x="20" y="20" width="160" height="130" rx="15" fill="none" stroke="#3b82f6" strokeWidth="3"/>
    <motion.rect
      x="40" y="100" width="15" height="40"
      fill="#60a5fa"
      animate={{ height: [40, 20, 40] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
    />
    <motion.rect
      x="70" y="80" width="15" height="60"
      fill="#3b82f6"
      animate={{ height: [60, 30, 60] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
    />
    <motion.rect
      x="100" y="60" width="15" height="80"
      fill="#1d4ed8"
      animate={{ height: [80, 40, 80] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
    />
    <motion.rect
      x="130" y="90" width="15" height="50"
      fill="#60a5fa"
      animate={{ height: [50, 25, 50] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
    />
    <circle cx="40" cy="40" r="8" fill="#10b981"/>
    <circle cx="70" cy="40" r="8" fill="#10b981"/>
    <circle cx="100" cy="40" r="8" fill="#ef4444"/>
    <circle cx="130" cy="40" r="8" fill="#10b981"/>
    <rect x="40" y="160" width="120" height="20" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="50" y="174" fontSize="10" fill="#6b7280">Node ID: 0x7a3b...9f2c</text>
  </svg>
);

const AlertSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <path d="M100 20 L180 60 L180 140 L100 180 L20 140 L20 60 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4"/>
    <motion.path
      d="M100 60 L100 110"
      stroke="#d97706"
      strokeWidth="5"
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <circle cx="100" cy="130" r="7" fill="#d97706"/>
    <motion.path
      d="M80 40 Q100 30 120 40 Q120 50 115 60 Q110 70 100 75 Q90 70 85 60 Q80 50 80 40"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="140"
      cy="45"
      r="9"
      fill="#ef4444"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    />
    <motion.circle
      cx="60"
      cy="45"
      r="7"
      fill="#ef4444"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <text x="100" y="160" textAnchor="middle" fontSize="14" fill="#92400e" fontWeight="bold">Penalty Alert!</text>
  </svg>
);

const ProposalSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <rect x="30" y="40" width="140" height="120" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2"/>
    <rect x="40" y="50" width="120" height="8" rx="4" fill="#e2e8f0"/>
    <rect x="40" y="65" width="80" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="40" y="85" width="120" height="4" rx="2" fill="#dbeafe"/>
    <rect x="40" y="95" width="100" height="4" rx="2" fill="#dbeafe"/>
    <rect x="40" y="105" width="110" height="4" rx="2" fill="#dbeafe"/>
    <motion.path
      d="M50 125 L65 140 L85 120"
      fill="none"
      stroke="#10b981"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
    />
    <motion.path
      d="M50 140 L65 155 L85 135"
      fill="none"
      stroke="#10b981"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: 0.5, ease: "easeInOut" }}
    />
    <motion.rect
      x="110"
      y="150"
      width="50"
      height="20"
      rx="8"
      fill="#8b5cf6"
      whileHover={{ fill: "#7c3aed" }}
    />
    <text x="135" y="163" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Submit</text>
    <motion.circle
      cx="160"
      cy="70"
      r="12"
      fill="#10b981"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <path d="M155 70 L158 73 L165 66" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HomePage = () => {
  const faqs = [
    {
      question: "What metrics can I monitor with IC Node Monitor?",
      answer: "IC Node Monitor provides comprehensive metrics including failure rates, uptime statistics, key ID information, real-time node status, protocol-level performance data, and penalty notifications. You get a complete overview of your node's health and performance in one dashboard."
    },
    {
      question: "How do I get notified about node penalties or failures?",
      answer: "You'll receive instant notifications when your node is penalized. Additionally, you get daily failure rate reports that help you identify and address issues proactively before they impact your operations or result in penalties."
    },
    {
      question: "Do I need technical expertise to use the Proposal Editor?",
      answer: "No! The Proposal Editor is designed to be user-friendly with no command line knowledge required. It automatically validates and formats your proposals, reducing rejection risks and saving you time. Simply use the intuitive interface to submit proposals correctly formatted."
    },
    {
      question: "Is there any setup required to start monitoring my nodes?",
      answer: "No setup is required! IC Node Monitor is designed to work out of the box. Once you join, you can immediately start monitoring your nodes without any complex configuration or installation process."
    },
    {
      question: "Can I monitor multiple nodes from different providers?",
      answer: "Yes! IC Node Monitor allows you to track all your nodes in one centralized dashboard, regardless of the provider. You get a unified view of your entire node infrastructure with individual metrics and alerts for each node."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      <Hero />
      <KeyFeatures />
      
      <FeatureSection
        title="Informed at a Glance"
        description="Get all your node data in one place—no more sifting through public dashboards. Instantly spot alerts, check key IDs, and track performance effortlessly with our intuitive interface."
        buttonText="Gain full visibility now"
        svgContent={<DashboardSVG />}
        theme="blue"
      />
      
      <FeatureSection
        title="Stay Ahead of Penalties"
        description="Be notified immediately when your node is penalized and receive daily failure rate reports to detect and resolve issues before they impact your revenue and reputation."
        buttonText="Monitor proactively"
        svgContent={<AlertSVG />}
        reverse
        theme="orange"
      />
      
      <FeatureSection
        title="Proposals, Without the Headaches"
        description="Save time and avoid rejection costs. No more digging through documentation or dealing with the command line. The Proposal Editor ensures your proposals are correctly formatted and validated, reducing the chances they get rejected."
        buttonText="Submit proposals easily"
        svgContent={<ProposalSVG />}
        theme="purple"
      />

      <FAQ faqs={faqs} />
      <CTA />
      <Footer />
    </div>
  );
};

export default HomePage;
