import React from 'react'
import { MapPin, BarChart3, Brain, Users, TrendingUp, Shield, Clock, Award, Zap, Target, ChevronDown } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Smart Location Search',
      description: 'Find primary schools near your location with AI-powered distance calculations and priority rankings based on MOE guidelines.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive P1 Analytics',
      description: 'Deep insights into historical P1 ballot results, success rates, and competition analysis across all registration phases.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      icon: Brain,
      title: 'AI-Powered Strategy',
      description: 'Get personalized admission strategies using advanced AI that considers your family situation and school preferences.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Users,
      title: 'Advanced School Comparison',
      description: 'Compare multiple schools side-by-side with interactive charts, detailed metrics, and visual performance indicators.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ]

  const stats = [
    { label: 'Primary Schools', value: '180+', icon: Award, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Districts Covered', value: '28', icon: MapPin, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Years of Data', value: '5+', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Success Rate', value: '94%', icon: Shield, color: 'text-amber-600', bgColor: 'bg-amber-50' }
  ]



  return (
    <div className="text-center space-y-20">
      {/* Enhanced Hero Section */}
      <div className="space-y-8">
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Singapore's #1 School Finder</span>
          </div>

          <h1 className="hero-title bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent leading-tight">
            Find the Perfect
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text">
              Primary School
            </span>
            in Singapore
          </h1>
          
          <p className="text-responsive-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            AI-powered school search with comprehensive P1 data and personalized admission strategies 
            for Singapore primary schools.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="card-hover group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`flex items-center justify-center w-12 h-12 ${stat.bgColor} rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Features Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="section-header">
            <span className="text-blue-600">Core Features</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to find and secure your ideal primary school
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className={`card-hover text-left group border-l-4 ${feature.borderColor} animate-slide-up`} 
                 style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-start space-x-6">
                <div className={`flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600">
                    <span>Learn more</span>
                    <ChevronDown className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="card-gradient border-2 border-blue-200 max-w-5xl mx-auto animate-scale-in">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900">Ready to Find Your School?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Enter your address to discover nearby primary schools and get AI-powered recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Takes less than 2 minutes</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">100% Free to use</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="section-header">How It Works</h2>
          <p className="text-xl text-slate-600">Get started in 3 simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { 
              step: '1', 
              title: 'Enter Your Location', 
              desc: 'Input your Singapore address or postal code to find nearby schools',
              icon: MapPin,
              color: 'from-blue-500 to-blue-600'
            },
            { 
              step: '2', 
              title: 'Analyze & Compare', 
              desc: 'Review schools with comprehensive P1 data, rankings, and success rates',
              icon: BarChart3,
              color: 'from-emerald-500 to-emerald-600'
            },
            { 
              step: '3', 
              title: 'Get AI Strategy', 
              desc: 'Receive personalized admission recommendations and action plans',
              icon: Brain,
              color: 'from-purple-500 to-purple-600'
            }
          ].map((item, index) => (
            <div key={index} className="text-center space-y-6 group animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
              <div className="relative">
                <div className={`flex items-center justify-center w-20 h-20 bg-gradient-to-r ${item.color} text-white font-bold text-2xl rounded-3xl mx-auto shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform duration-300`}>
                  {item.step}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-transparent"></div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

export default LandingPage 