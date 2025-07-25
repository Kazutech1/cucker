import React, { useState } from 'react';
import {
  Headphones,
  MessageSquare,
  FileText,
  HelpCircle,
  Shield,
  CreditCard,
  Truck,
  Box,
  User,
  Mail,
  Phone,
  ChevronRight
} from 'lucide-react';

const CustomerService = () => {
  const [activeTab, setActiveTab] = useState('help');

  const helpTopics = [
    {
      icon: <Box size={20} className="text-blue-500" />,
      title: "Order Status",
      description: "Track your order or check order history",
      link: "#order-status"
    },
    {
      icon: <Truck size={20} className="text-green-500" />,
      title: "Shipping & Delivery",
      description: "Shipping options, tracking, and delivery info",
      link: "#shipping"
    },
    {
      icon: <CreditCard size={20} className="text-purple-500" />,
      title: "Returns & Refunds",
      description: "How to return items and refund policies",
      link: "#returns"
    },
    {
      icon: <Shield size={20} className="text-orange-500" />,
      title: "Product Support",
      description: "Troubleshooting and product assistance",
      link: "#support"
    }
  ];

  const contactMethods = [
    {
      icon: <MessageSquare size={20} className="text-blue-500" />,
      title: "Live Chat",
      description: "Chat with a customer service representative",
      availability: "Available 24/7",
      link: "#live-chat"
    },
    {
      icon: <Phone size={20} className="text-green-500" />,
      title: "Phone Support",
      description: "Call our customer service team",
      availability: "Mon-Fri, 8AM-8PM EST",
      link: "#phone"
    },
    {
      icon: <Mail size={20} className="text-purple-500" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      availability: "Typically responds within 24 hours",
      link: "#email"
    }
  ];

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order through your account dashboard or using the tracking link in your confirmation email."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of purchase. Items must be in original condition with tags attached."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express options are available at checkout."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to most countries. Shipping costs and delivery times vary by destination."
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <Headphones className="mr-2" size={24} />
            Customer Service
          </h2>
          <p className="text-gray-600 mt-2">
            We're here to help. Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('help')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'help' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <HelpCircle className="inline mr-2" size={16} />
              Help Center
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <User className="inline mr-2" size={16} />
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faq' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FileText className="inline mr-2" size={16} />
              FAQs
            </button>
          </nav>
        </div>

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">How can we help you today?</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpTopics.map((topic, index) => (
                <a
                  key={index}
                  href={topic.link}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-black">{topic.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-black" size={20} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Contact Options</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.link}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group text-center"
                >
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200">
                    {method.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{method.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{method.description}</p>
                  <p className="text-xs text-gray-400">{method.availability}</p>
                </a>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Visit Our Support Center</h4>
              <p className="text-sm text-gray-600 mb-4">
                For more detailed help, visit our comprehensive support center with articles, guides, and troubleshooting tips.
              </p>
              <a href="#support-center" className="text-black font-medium flex items-center">
                Go to Support Center <ChevronRight className="ml-1" size={18} />
              </a>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Frequently Asked Questions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer">
                      <h4 className="font-medium text-gray-900 group-open:text-black">{faq.question}</h4>
                      <ChevronRight className="text-gray-400 transform group-open:rotate-90 transition-transform" size={20} />
                    </summary>
                    <p className="mt-3 text-gray-600">{faq.answer}</p>
                  </details>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Didn't find what you're looking for? <a href="#contact" className="text-black font-medium">Contact our support team</a>.
              </p>
            </div>
          </div>
        )}

        {/* Additional Resources */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">Additional Resources</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="#size-guide" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="text-blue-500 mr-4" size={20} />
              <div>
                <h4 className="font-medium">Size Guide</h4>
                <p className="text-sm text-gray-500 mt-1">Find the right fit for your products</p>
              </div>
            </a>
            <a href="#care-instructions" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="text-green-500 mr-4" size={20} />
              <div>
                <h4 className="font-medium">Care Instructions</h4>
                <p className="text-sm text-gray-500 mt-1">How to care for your products</p>
              </div>
            </a>
            <a href="#store-locator" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Truck className="text-purple-500 mr-4" size={20} />
              <div>
                <h4 className="font-medium">Store Locator</h4>
                <p className="text-sm text-gray-500 mt-1">Find our physical store locations</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;