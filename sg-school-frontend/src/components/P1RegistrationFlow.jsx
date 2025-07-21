import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, CheckCircle, AlertCircle, ArrowRight, Clock, Award, Home } from 'lucide-react';

const P1RegistrationFlow = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [animatedElements, setAnimatedElements] = useState(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedElements(prev => {
        const newSet = new Set(prev);
        newSet.add(Math.floor(Math.random() * 5));
        return newSet;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const phases = [
    {
      id: 1,
      name: "Phase 1",
      color: "from-purple-500 to-purple-700",
      icon: Award,
      criteria: [
        "Child has a sibling in the primary school",
        "Child's parent is a former student of the primary school and has registered with the alumni association"
      ],
      timeline: "TBA",
      priority: "Highest"
    },
    {
      id: 2,
      name: "Phase 2A",
      color: "from-blue-500 to-blue-700",
      icon: Users,
      criteria: [
        "Child's parent is a member of the School Advisory Committee",
        "Child's parent is a member of the School Management Committee",
        "Child is sponsored by an organisation"
      ],
      timeline: "TBA",
      priority: "Very High"
    },
    {
      id: 3,
      name: "Phase 2B",
      color: "from-green-500 to-green-700",
      icon: Home,
      criteria: [
        "Parent volunteer (40+ hours by June 30)",
        "Parent endorsed by church/clan connected to school",
        "Parent endorsed as active community leader"
      ],
      timeline: "July 21-22, 2025",
      priority: "High",
      active: true
    },
    {
      id: 4,
      name: "Phase 2C",
      color: "from-orange-500 to-orange-700",
      icon: MapPin,
      criteria: [
        "Child not yet registered in a primary school",
        "Lives within 1km of the school",
        "Lives within 2km of the school"
      ],
      timeline: "TBA",
      priority: "Medium"
    },
    {
      id: 5,
      name: "Phase 2C Supplementary",
      color: "from-red-500 to-red-700",
      icon: Clock,
      criteria: [
        "Child not yet registered in a primary school",
        "No distance restrictions",
        "Final opportunity for registration"
      ],
      timeline: "TBA",
      priority: "Last Chance"
    }
  ];

  const processStages = [
    {
      title: "Before Registration",
      icon: Calendar,
      steps: ["Understand phases", "Check eligibility", "Choose school", "Prepare documents"],
      color: "text-blue-600"
    },
    {
      title: "During Registration",
      icon: CheckCircle,
      steps: ["Submit application", "Monitor vacancies", "Wait for balloting", "Check results"],
      color: "text-green-600"
    },
    {
      title: "After Results",
      icon: AlertCircle,
      steps: ["Report to school", "Arrange student care", "Prepare for transition"],
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Singapore P1 Registration Flow
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive visualization of the Primary 1 registration process for Singapore Citizens and Permanent Residents
          </p>
        </div>

        {/* Timeline Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registration Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-2 w-full bg-gradient-to-r from-purple-200 via-blue-200 via-green-200 via-orange-200 to-red-200 rounded-full"></div>
            <div className="flex justify-between items-center relative z-10">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    activePhase === index ? 'scale-110' : 'hover:scale-105'
                  }`}
                  onClick={() => setActivePhase(index)}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} 
                    flex items-center justify-center text-white shadow-lg ${
                    phase.active ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                  } ${animatedElements.has(index) ? 'animate-bounce' : ''}`}>
                    {React.createElement(phase.icon, { className: "w-8 h-8" })}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-gray-800">{phase.name}</p>
                    <p className={`text-xs ${phase.active ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                      {phase.active ? 'ACTIVE NOW' : phase.timeline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Details */}
        <div className="mb-12">
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-l-8 bg-gradient-to-r ${phases[activePhase].color}`}>
            <div className="bg-white rounded-xl p-6 m-2">
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${phases[activePhase].color} 
                  flex items-center justify-center text-white mr-4`}>
                  {React.createElement(phases[activePhase].icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{phases[activePhase].name}</h3>
                  <p className="text-gray-600">Priority: {phases[activePhase].priority}</p>
                </div>
                {phases[activePhase].active && (
                  <div className="ml-auto">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      Currently Active
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Eligibility Criteria:</h4>
                <div className="space-y-2">
                  {phases[activePhase].criteria.map((criterion, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {phases[activePhase].active && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">
                      Registration Period: July 21-22, 2025 (9:00 AM - 4:30 PM)
                    </span>
                  </div>
                  <p className="text-yellow-700 mt-1">Results announced: July 28, 2025</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Process Stages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registration Process</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {processStages.map((stage, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {React.createElement(stage.icon, { className: `w-8 h-8 ${stage.color} mr-3` })}
                  <h3 className="text-xl font-semibold text-gray-800">{stage.title}</h3>
                </div>
                <div className="space-y-3">
                  {stage.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Facts */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Key Registration Facts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5</div>
              <div className="text-blue-100">Registration Phases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">1</div>
              <div className="text-blue-100">School Per Phase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">30</div>
              <div className="text-blue-100">Month Stay Requirement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">2km</div>
              <div className="text-blue-100">Distance Priority</div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-amber-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Important Notes:</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• Only one application per child per phase is allowed</li>
                <li>• If unsuccessful in a phase, you can register in the next eligible phase</li>
                <li>• Distance from home to school affects admission priority</li>
                <li>• Some phases may require balloting if oversubscribed</li>
                <li>• International students follow a different registration process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P1RegistrationFlow; 