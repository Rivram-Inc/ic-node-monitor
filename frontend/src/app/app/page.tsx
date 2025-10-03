"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    BarChart3,
    Bell,
    FileEdit,
    ArrowRight,
    ChevronDown,
    Eye,
    Shield,
    FileCheck
} from "lucide-react";
import { useState } from "react";

const LandingPage = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                IC Node Monitoring
                            </h1>
                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/app/node_providers"
                                    className="text-lg text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Public Dashboard
                                </Link>
                                <Link
                                    href="#about"
                                    className="text-lg text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    About
                                </Link>
                            </nav>
                        </div>

                        {/* Right side */}
                        <button className="px-5 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md hover:shadow-lg">
                            Join Waitlist
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            {/* Hero Section */}
<section className="relative min-h-screen flex items-center px-6 overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.5, 0.3, 0.5],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>

  <div className="max-w-7xl mx-auto w-full relative">
    <div className="grid md:grid-cols-2 gap-16 items-center">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Tools to Manage Your Nodes, All in One Place
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Join node providers using Node Monitor to simplify operations, stay informed, 
          and keep their nodes running smoothly—no setup required.
        </p>
        <button className="px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group">
          Join Waitlist
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Right Content - Product Images */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative h-[620px] flex items-center justify-center"
      >
        {/* Background Image - Dashboard 2 */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-[10%] left-[5%] w-[80%] rounded-xl shadow-2xl overflow-hidden border-4 border-white"
        >
          <Image
            src="/product-dashboard-2.png"
            alt="Product Dashboard 2"
            width={900}
            height={700}
            className="w-full h-auto"
            priority
          />
        </motion.div>

        {/* Foreground Image - Dashboard 1 (on top) */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: -30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-[10%] right-[5%] w-[80%] rounded-xl shadow-2xl overflow-hidden border-4 border-white z-10"
        >
          <Image
            src="/product-dashboard-1.png"
            alt="Product Dashboard 1"
            width={900}
            height={700}
            className="w-full h-auto"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  </div>
</section>
 

            {/* Key Features Section */}
            <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                <motion.h3
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16" // Reduced from 4xl/5xl to 3xl/4xl
    >
      Key Features
    </motion.h3>


                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <BarChart3 className="w-7 h-7 text-blue-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                Tailored Dashboard
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                                Get instant insights with charts on failure rates, key ID information,
                                and real-time node status.
                            </p>
                        </motion.div>

                        {/* Feature Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                                <Bell className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                Protocol-Level Alerts
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                                Monitor your node's performance at the protocol level using trustworthy
                                node metrics.
                            </p>
                        </motion.div>

                        {/* Feature Card 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <FileEdit className="w-7 h-7 text-purple-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                Proposal Editor
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                                Easily submit proposals with a user-friendly front end—no command line required.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Alternating Image/Text Sections */}


{/* Section 1 - Image Left */}
<section className="py-20 px-6">
    <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image/Animation Left */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="text-center"
                    >
                        <svg viewBox="0 0 200 200" className="w-80 h-80">
                            {/* Dashboard outline */}
                            <rect x="20" y="20" width="160" height="130" rx="10" fill="none" stroke="#3b82f6" strokeWidth="3"/>
                            
                            {/* Chart bars */}
                            <motion.rect
                                x="40" y="100" width="15" height="40"
                                fill="#60a5fa"
                                animate={{
                                    height: [40, 20, 40],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0
                                }}
                            />
                            <motion.rect
                                x="70" y="80" width="15" height="60"
                                fill="#3b82f6"
                                animate={{
                                    height: [60, 30, 60],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.2
                                }}
                            />
                            <motion.rect
                                x="100" y="60" width="15" height="80"
                                fill="#1d4ed8"
                                animate={{
                                    height: [80, 40, 80],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.4
                                }}
                            />
                            <motion.rect
                                x="130" y="90" width="15" height="50"
                                fill="#60a5fa"
                                animate={{
                                    height: [50, 25, 50],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.6
                                }}
                            />
                            
                            {/* Status indicators */}
                            <circle cx="40" cy="40" r="8" fill="#10b981"/>
                            <circle cx="70" cy="40" r="8" fill="#10b981"/>
                            <circle cx="100" cy="40" r="8" fill="#ef4444"/>
                            <circle cx="130" cy="40" r="8" fill="#10b981"/>
                            
                            {/* Node ID display */}
                            <rect x="40" y="160" width="120" height="20" rx="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1"/>
                            <text x="50" y="174" fontSize="10" fill="#6b7280">Node ID: 0x7a3b...9f2c</text>
                        </svg>
                    </motion.div>
                </div>
            </motion.div>

            {/* Text Right */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    Informed at a glance
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Get all your node data in one place—no more sifting through public dashboards.
                    Instantly spot alerts, check key IDs, and track performance effortlessly.
                </p>
                <button className="px-5 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
                    Gain full visibility now - Join waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    </div>
</section>

{/* Section 2 - Image Right */}
<section className="py-20 px-6 bg-white/30">
    <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Left */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    Stay ahead of penalties
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Be notified when your node is penalized and receive daily failure rate reports
                    to detect issues before they cost you.
                </p>
                <button className="px-5 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
                    Monitor your nodes proactively - Join waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            {/* Image/Animation Right */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="text-center"
                    >
                        <svg viewBox="0 0 200 200" className="w-80 h-80">
                            {/* Shield base */}
                            <path d="M100 20 L180 60 L180 140 L100 180 L20 140 L20 60 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3"/>
                            
                            {/* Warning symbol */}
                            <motion.path
                                d="M100 60 L100 110"
                                stroke="#d97706"
                                strokeWidth="4"
                                animate={{
                                    opacity: [1, 0.3, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <circle cx="100" cy="130" r="6" fill="#d97706"/>
                            
                            {/* Alert bell */}
                            <motion.path
                                d="M80 40 Q100 30 120 40 Q120 50 115 60 Q110 70 100 75 Q90 70 85 60 Q80 50 80 40"
                                fill="#fbbf24"
                                stroke="#d97706"
                                strokeWidth="2"
                                animate={{
                                    rotate: [-5, 5, -5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            
                            {/* Notification dots */}
                            <motion.circle
                                cx="140"
                                cy="45"
                                r="8"
                                fill="#ef4444"
                                animate={{
                                    scale: [1, 1.3, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5
                                }}
                            />
                            <motion.circle
                                cx="60"
                                cy="45"
                                r="6"
                                fill="#ef4444"
                                animate={{
                                    scale: [1, 1.3, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            />
                            
                            {/* Status text */}
                            <text x="100" y="160" textAnchor="middle" fontSize="12" fill="#92400e">Penalty Alert!</text>
                        </svg>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    </div>
</section>

{/* Section 3 - Image Left */}
<section className="py-20 px-6">
    <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image/Animation Left */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
                    <motion.div
                        animate={{
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="text-center"
                    >
                        <svg viewBox="0 0 200 200" className="w-80 h-80">
                            {/* Document outline */}
                            <rect x="30" y="40" width="140" height="120" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2"/>
                            
                            {/* Document header */}
                            <rect x="40" y="50" width="120" height="8" rx="4" fill="#e2e8f0"/>
                            <rect x="40" y="65" width="80" height="6" rx="3" fill="#e2e8f0"/>
                            
                            {/* Form fields */}
                            <rect x="40" y="85" width="120" height="4" rx="2" fill="#dbeafe"/>
                            <rect x="40" y="95" width="100" height="4" rx="2" fill="#dbeafe"/>
                            <rect x="40" y="105" width="110" height="4" rx="2" fill="#dbeafe"/>
                            
                            {/* Check marks */}
                            <motion.path
                                d="M50 125 L65 140 L85 120"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "easeInOut",
                                }}
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
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    delay: 0.5,
                                    ease: "easeInOut",
                                }}
                            />
                            
                            {/* Submit button */}
                            <motion.rect
                                x="110"
                                y="150"
                                width="50"
                                height="20"
                                rx="5"
                                fill="#8b5cf6"
                                whileHover={{ fill: "#7c3aed" }}
                            />
                            <text x="135" y="163" textAnchor="middle" fontSize="8" fill="white">Submit</text>
                            
                            {/* Success indicator */}
                            <motion.circle
                                cx="160"
                                cy="70"
                                r="12"
                                fill="#10b981"
                                animate={{
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <path d="M155 70 L158 73 L165 66" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </motion.div>
                </div>
            </motion.div>

            {/* Text Right */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    Proposals, Without the Headaches
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Save time and avoid rejection costs. No more digging through documentation
                    or dealing with the command line. The Proposal Editor ensures your proposals
                    are correctly formatted and validated, reducing the chances they get rejected.
                </p>
                <button className="px-5 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
                    Submit proposals the easy way - Join waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    </div>
</section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-white/50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"> {/* Reduced from 4xl/5xl to 3xl/4xl */}
                            Frequently Asked Questions
                        </h3>
                        <p className="text-xl text-gray-600">
                            Find answers to common questions about dashboards, alerts, and more.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={faq.question}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-6 h-6 text-gray-600 flex-shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openFaq === index ? "auto" : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with Card */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-center p-12">
                            {/* Left - Text */}
                            <div>
                                <h3 className="text-4xl font-bold text-white mb-6">
                                    Simplify Your Node Operations Today
                                </h3>
                                <p className="text-xl text-blue-50 leading-relaxed">
                                    Stay informed, reduce complexity, and manage your nodes with confidence.
                                    With Node Monitor, you get the tools you need—no setup, no hassle.
                                </p>
                            </div>

                            {/* Right - Button */}
                            <div className="flex justify-center md:justify-end">
                                <button className="px-6 py-2.5 text-base font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group">
                                    Unlock the tools you need today! - Join waitlist
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            IC Node Monitor
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Powered by Rivram INC
                        </p>
                        <Link href="/app/node_providers">
                            <button className="px-5 py-2 text-base font-medium text-white border-2 border-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors mb-8">
                                Dashboard
                            </button>
                        </Link>
                        <div className="border-t border-gray-700 pt-6">
                            <p className="text-gray-400">
                                All rights reserved | <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

