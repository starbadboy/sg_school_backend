import React from 'react'
import { MapPin, BarChart3, Brain, Users, TrendingUp, Shield, Clock, Award } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Search',
      description: 'Find primary schools near your location with precise distance calculations and priority rankings.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: 'P1 Data Analysis',
      description: 'Comprehensive analysis of historical P1 ballot results, success rates, and competitiveness indicators.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Brain,
      title: 'AI-Powered Strategy',
      description: 'Get personalized admission strategies powered by DeepSeek AI based on your family situation.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'School Comparison',
      description: 'Compare multiple schools side-by-side with detailed metrics and visual indicators.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const stats = [
    { label: 'Primary Schools', value: '180+', icon: Award },
    { label: 'Districts Covered', value: '28', icon: MapPin },
    { label: 'Years of P1 Data', value: '5+', icon: TrendingUp },
    { label: 'Success Rate', value: '94%', icon: Shield }
  ]

  return (
    <div className="text-center space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Find the Perfect
            <span className="text-primary-600 block">Primary School</span>
            in Singapore
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Analyze P1 data, discover nearby schools, and get AI-powered admission strategies 
            to maximize your child's chances of getting into their ideal primary school.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg mx-auto mb-2">
                <stat.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="card-hover text-left group">
            <div className="flex items-start space-x-4">
              <div className={`flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white max-w-4xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-primary-100 text-lg">
            Enter your address below to discover nearby primary schools and begin your school selection journey.
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary-200">
            <Clock className="h-5 w-5" />
            <span>Takes less than 2 minutes</span>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Enter Location', desc: 'Input your Singapore address or postal code' },
            { step: '2', title: 'Analyze Schools', desc: 'Review nearby schools with P1 data and rankings' },
            { step: '3', title: 'Get Strategy', desc: 'Receive AI-powered admission recommendations' }
          ].map((item, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white font-bold text-lg rounded-full mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandingPage 