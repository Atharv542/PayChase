import { Check, Star } from "lucide-react";

export default function Pricing({ onNavigate }) {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for trying out PayChase",
      features: [
        "3 invoices per month",
        "Email reminders only",
        "Basic templates",
        "Payment tracking",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
      style:
        "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50",
    },
    {
      name: "Pro",
      price: "399",
      period: "month",
      description: "Best for freelancers and consultants",
      features: [
        "Unlimited invoices",
        "Email & WhatsApp reminders",
        "Professional templates",
        "Advanced payment tracking",
        "Custom reminder schedules",
        "Priority email support",
        "Analytics dashboard",
      ],
      cta: "Start Free Trial",
      popular: true,
      style:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow hover:shadow-md",
    },
    {
      name: "Business",
      price: "999",
      period: "month",
      description: "For growing teams and agencies",
      features: [
        "Everything in Pro",
        "Team access (up to 5 users)",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Dedicated account manager",
        "Priority support (24/7)",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
      style:
        "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow hover:shadow-md",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free
            trial.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div key={plan.name} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-xl p-8 shadow-md flex flex-col h-full ${
                  plan.popular
                    ? "border-2 border-emerald-500 shadow-xl"
                    : ""
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {plan.name}
                  </h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      / {plan.period}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("signup")}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition ${plan.style}`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOM PLAN */}
        <div className="bg-gradient-to-r from-emerald-50 to-orange-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need a custom plan?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We offer customized solutions for enterprises and large teams.
              Get in touch with our sales team to discuss your requirements.
            </p>
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow hover:shadow-md transition">
              Contact Sales Team
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept credit cards, debit cards, UPI, and net banking.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, all paid plans include a 14-day free trial.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel anytime with no fees.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
