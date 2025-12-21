import React, { useState } from 'react';
import { BookOpen, MessageSquare, Trophy, Target, TrendingUp, Clock, Award, Users } from 'lucide-react';

export default function Dashboard() {
  const [user] = useState({
    name: "John Mugisha",
    class: "S3",
    school: "King's College Budo",
    streak: 12,
    rank: "Tutor",
    points: 487
  });

  const [progress] = useState({
    overall: 30,
    subjects: [
      { name: "Mathematics", progress: 65, avgScore: 82, color: "bg-blue-500" },
      { name: "Physics", progress: 40, avgScore: 75, color: "bg-purple-500" },
      { name: "Chemistry", progress: 35, avgScore: 68, color: "bg-green-500" },
      { name: "Biology", progress: 45, avgScore: 80, color: "bg-orange-500" }
    ],
    topicsCompleted: 45,
    totalTopics: 150,
    studyTime: 28.5,
    quizzesTaken: 23
  });

  const [todayGoal] = useState({
    title: "Complete 'Quadratic Formula'",
    progress: 80,
    minutesRemaining: 10
  });

  const [quickActions] = useState([
    {
      type: "continue",
      title: "Continue Quadratic Equations",
      subject: "Mathematics",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      type: "quiz",
      title: "Test your Physics knowledge",
      subject: "Physics",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      type: "community",
      title: "Join Math discussion",
      subject: "Community",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-green-600"
    }
  ]);

  const [recentActivity] = useState([
    { type: "completed", title: "Quadratic Equations - Intro", subject: "Mathematics", time: "2 hours ago" },
    { type: "quiz", title: "Scored 85% on Algebra Quiz", subject: "Mathematics", time: "5 hours ago" },
    { type: "badge", title: "Earned 'Math Wizard' badge", subject: "Achievement", time: "Yesterday" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
              <p className="text-gray-600">{user.class} • {user.school}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Study Streak</div>
                <div className="text-2xl font-bold text-orange-500 flex items-center">
                  🔥 {user.streak} days
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Rank</div>
                <div className="text-lg font-bold text-blue-600">{user.rank}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Goal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Today's Goal 🎯</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {todayGoal.minutesRemaining} min left
                </span>
              </div>
              <p className="text-lg mb-4">{todayGoal.title}</p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div 
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${todayGoal.progress}%` }}
                />
              </div>
              <p className="text-sm text-blue-100">{todayGoal.progress}% complete</p>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className={`bg-gradient-to-br ${action.color} p-6 rounded-xl text-white hover:shadow-lg transition text-left`}
                  >
                    <div className="mb-3">{action.icon}</div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-white/80">{action.subject}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Progress by Subject</h2>
              <div className="space-y-6">
                {progress.subjects.map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">Avg: {subject.avgScore}%</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {subject.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${subject.color} h-2 rounded-full transition-all`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'completed' ? 'bg-green-500' :
                      activity.type === 'quiz' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Topics</p>
                      <p className="font-bold text-gray-900">{progress.topicsCompleted}/{progress.totalTopics}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quizzes</p>
                      <p className="font-bold text-gray-900">{progress.quizzesTaken}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Study Time</p>
                      <p className="font-bold text-gray-900">{progress.studyTime}h</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-bold text-gray-900">{user.points}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-orange-500" />
                Your Rank
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">#47</div>
                <p className="text-sm text-gray-600">out of 1,250 students</p>
              </div>
              <button className="w-full bg-white text-gray-900 py-2 rounded-lg hover:bg-gray-50 font-medium transition">
                View Full Leaderboard
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-500" />
                Recent Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🧮</span>
                  </div>
                  <p className="text-xs text-gray-600">Math Wizard</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-xs text-gray-600">On Fire</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <p className="text-xs text-gray-600">Team Player</p>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-lg font-medium mb-2">"Success is the sum of small efforts repeated day in and day out."</p>
              <p className="text-sm text-blue-100">- Robert Collier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
