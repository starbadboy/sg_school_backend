import React from 'react'
import { MapPin, BarChart3, Brain, Users } from 'lucide-react'

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





  return (
    <div className="text-center space-y-20">
      {/* How It Works Section */}
      <div className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-xl text-gray-600">Get started in 3 simple steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 hidden md:block">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3 pt-8">
              <h3 className="text-xl font-bold text-gray-900">Enter Your Location</h3>
              <p className="text-gray-600 leading-relaxed">
                Input your Singapore address or postal code to find nearby schools
              </p>
            </div>
            {/* Connecting line */}
            <div className="absolute top-10 left-full w-full h-0.5 bg-gray-200 hidden md:block transform -translate-x-1/2"></div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 hidden md:block">
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3 pt-8">
              <h3 className="text-xl font-bold text-gray-900">Analyze & Compare</h3>
              <p className="text-gray-600 leading-relaxed">
                Review schools with comprehensive P1 data, rankings, and success rates
              </p>
            </div>
            {/* Connecting line */}
            <div className="absolute top-10 left-full w-full h-0.5 bg-gray-200 hidden md:block transform -translate-x-1/2"></div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 hidden md:block">
              <Brain className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3 pt-8">
              <h3 className="text-xl font-bold text-gray-900">Get AI Strategy</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive personalized admission recommendations and action plans
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Features Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Core Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to find and secure your ideal primary school
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              {/* Subtle background gradient */}
              <div className={`absolute inset-0 opacity-5 ${feature.bgColor}`}></div>
              
              <div className="relative z-10 text-center space-y-6">
                {/* Icon */}
                <div className="inline-flex">
                  <div className={`flex items-center justify-center w-20 h-20 ${feature.bgColor} rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-10 w-10 ${feature.color}`} />
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg max-w-md mx-auto">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>






    </div>
  )
}

export default LandingPage 