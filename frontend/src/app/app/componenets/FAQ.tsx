import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import SectionHeader from "./SectionHeader";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
}

const FAQ = ({ faqs }: FAQProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Get answers to the most common questions about our node monitoring platform"
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className={`bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${
                openFaq === index ? 'ring-2 ring-blue-500/20' : ''
              }`}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-all duration-300 group-hover:bg-gray-50/80"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openFaq === index 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                    }`}>
                      <span className="text-sm font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180 text-blue-600" : "group-hover:text-blue-600"
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === index ? "auto" : 0,
                    opacity: openFaq === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6 ml-12">
                    <div className="text-gray-600 leading-relaxed text-lg border-l-2 border-blue-200 pl-6 py-2">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
