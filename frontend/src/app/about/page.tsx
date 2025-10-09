"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, 
  Bell, 
  FileEdit, 
  Users, 
  Shield, 
  Zap,
  Target,
  Eye,
  CheckCircle
} from "lucide-react";
import Header from "@/app/app/componenets/Header";
import Footer from "@/app/app/componenets/Footer";
import Button from "@/app/app/componenets/Button";

const AboutPage = () => {
  const values = [
    {
      icon: Eye,
      title: "Transparency",
      description: "Clear, honest metrics and straightforward pricing without hidden costs or surprises."
    },
    {
      icon: Target,
      title: "Reliability",
      description: "Built for node operators who need dependable tools they can count on 24/7."
    },
    {
      icon: Users,
      title: "Community",
      description: "Tools designed by node operators, for node operators, with continuous feedback integration."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Staying ahead of network changes and providing cutting-edge monitoring solutions."
    }
  ];

  const timeline = [
    {
      year: "2024",
      title: "The Beginning",
      description: "Founded by experienced node operators who faced the same monitoring challenges you do every day."
    },
    {
      year: "Present",
      title: "Building the Future",
      description: "Developing comprehensive tools to simplify node operations and prevent costly penalties."
    },
    {
      year: "2025",
      title: "Expansion",
      description: "Growing our feature set based on community feedback and network evolution."
    }
  ];

  const teamPrinciples = [
    "Built by node operators, for node operators",
    "No setup required - start monitoring immediately",
    "Transparent pricing with no hidden fees",
    "Continuous improvement based on user feedback",
    "24/7 reliable monitoring and alerting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">IC Node Monitor</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
              We're building the tools we wish we had when running our own nodes - 
              making node management simpler, smarter, and more accessible for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app/node_providers">
                <Button variant="primary" size="lg" withArrow>
                  Explore Dashboard
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Meet the Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-900">
                  Our Mission: Simplify Node Operations
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  After running nodes ourselves and experiencing firsthand the challenges of monitoring 
                  and maintenance, we knew there had to be a better way. Traditional monitoring tools 
                  were either too complex, too expensive, or didn't provide the specific insights node 
                  operators actually need.
                </p>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We created IC Node Monitor to fill that gap - providing comprehensive, easy-to-use 
                  tools that give you real visibility into your node's performance without the overhead 
                  of complex setup or maintenance.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600">Monitoring</div>
                </div>
                <div className="text-center p-6 bg-indigo-50 rounded-2xl">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
                  <div className="text-gray-600">Setup Required</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">Focus on Nodes</div>
                </div>
                <div className="text-center p-6 bg-pink-50 rounded-2xl">
                  <div className="text-3xl font-bold text-pink-600 mb-2">Real-time</div>
                  <div className="text-gray-600">Alerts</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-200/20 p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Built for Node Operators</h3>
                  <p className="text-gray-600">
                    By people who understand the unique challenges of running nodes
                  </p>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -right-4 w-6 h-6 bg-indigo-500 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we build for the node operator community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From facing node operation challenges to building solutions for the community
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex items-center gap-8 mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                    <div className="text-2xl font-bold mb-2">{item.year}</div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-blue-100 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-blue-500 rounded-full relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping" />
                </div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Principles Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built on Real Experience
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our team consists of seasoned node operators who've faced the same challenges you're 
                dealing with today. We've experienced penalties, struggled with opaque monitoring tools, 
                and spent countless hours troubleshooting issues that could have been prevented with 
                better visibility.
              </p>
              
              <div className="space-y-4">
                {teamPrinciples.map((principle, index) => (
                  <motion.div
                    key={principle}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-700">{principle}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Real Metrics</h4>
                  <p className="text-gray-600 text-sm">Data that actually matters for node operations</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <Bell className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Smart Alerts</h4>
                  <p className="text-gray-600 text-sm">Get notified before issues become problems</p>
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <FileEdit className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Easy Proposals</h4>
                  <p className="text-gray-600 text-sm">Submit without command line complexity</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Reliable</h4>
                  <p className="text-gray-600 text-sm">Built for 24/7 node operations</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden relative text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[size:20px_20px] animate-shimmer"></div>
            </div>
            
            <div className="relative px-12 py-16">
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Simplify Your Node Operations?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join the growing community of node operators who trust our platform to keep their 
                infrastructure running smoothly and profitably.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="secondary" size="lg" withArrow>
                    Join Waitlist
                  </Button>
                </Link>
                <Link href="/app/node_providers">
                  <Button variant="outline" size="lg">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
