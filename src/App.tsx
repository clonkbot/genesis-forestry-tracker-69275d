import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeEntry {
  id: string;
  person: string;
  count: number;
  date: string;
  location: string;
}

const TEAM_MEMBERS = ['Robbie', 'Ross', 'Harry', 'Scott', 'Drew', 'Alex', 'Jo'];

const LOCATIONS = [
  'North Ridge',
  'Cedar Valley',
  'Pinewood Basin',
  'Oakmont Hills',
  'Spruce Creek',
  'Maple Grove',
  'Birch Hollow',
  'Aspen Meadow'
];

function App() {
  const [entries, setEntries] = useState<TreeEntry[]>(() => {
    const saved = localStorage.getItem('genesis-trees');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPerson, setSelectedPerson] = useState('');
  const [treeCount, setTreeCount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeTab, setActiveTab] = useState<'entry' | 'stats' | 'calendar'>('entry');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('genesis-trees', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = () => {
    if (!selectedPerson || !treeCount || parseInt(treeCount) <= 0) return;

    const newEntry: TreeEntry = {
      id: Date.now().toString(),
      person: selectedPerson,
      count: parseInt(treeCount),
      date: selectedDate,
      location: selectedLocation || 'Unspecified'
    };

    setEntries([...entries, newEntry]);
    setTreeCount('');
    setSelectedLocation('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getTotalTrees = () => entries.reduce((sum, e) => sum + e.count, 0);

  const getPersonStats = () => {
    const stats: Record<string, number> = {};
    TEAM_MEMBERS.forEach(p => stats[p] = 0);
    entries.forEach(e => {
      if (stats[e.person] !== undefined) {
        stats[e.person] += e.count;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const getEntriesForDate = (dateStr: string) => {
    return entries.filter(e => e.date === dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

  const getLocationStats = () => {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      stats[e.location] = (stats[e.location] || 0) + e.count;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="min-h-screen bg-[#1a1a18] text-[#e8e4dc] relative overflow-x-hidden">
      {/* Wood grain texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative border-b-4 border-[#2d5a27] bg-[#0f0f0e]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="#e8e4dc"/>
                <path d="M50 10 Q25 35 50 45 Q75 35 50 10" fill="#1a1a18"/>
                <path d="M50 35 Q30 55 50 62 Q70 55 50 35" fill="#1a1a18"/>
                <path d="M50 55 Q35 75 50 90 Q65 75 50 55" fill="#1a1a18"/>
              </svg>
            </motion.div>

            <div className="text-center sm:text-left flex-1">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#e8e4dc]"
              >
                GENESIS FORESTRY
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-body text-[#8b9a7d] text-sm md:text-base tracking-widest uppercase mt-1"
              >
                Tree Planting Tracker
              </motion.p>
            </div>

            {/* Total Counter */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#2d5a27] px-4 md:px-6 py-2 md:py-3 border-2 border-[#4a7c43]"
            >
              <div className="text-center">
                <p className="text-xs text-[#8b9a7d] uppercase tracking-wider font-body">Total Planted</p>
                <p className="font-display text-2xl md:text-4xl font-bold text-[#c5e063]">
                  {getTotalTrees().toLocaleString()}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-4 md:mt-6 overflow-x-auto pb-2">
            {(['entry', 'calendar', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2 md:py-3 font-display text-sm md:text-base uppercase tracking-wider transition-all flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#2d5a27] text-[#c5e063] border-2 border-[#4a7c43]'
                    : 'bg-[#1a1a18] text-[#6b7264] border-2 border-[#2a2a26] hover:border-[#3a3a34] hover:text-[#8b9a7d]'
                }`}
              >
                {tab === 'entry' ? '📝 Log Trees' : tab === 'calendar' ? '📅 Calendar' : '📊 Stats'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
            >
              {/* Entry Form */}
              <div className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8">
                <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-[#c5e063] flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">🌲</span> LOG TREES PLANTED
                </h2>

                <div className="space-y-5 md:space-y-6">
                  {/* Person Select */}
                  <div>
                    <label className="block font-body text-sm uppercase tracking-wider text-[#8b9a7d] mb-2 md:mb-3">
                      Select Planter
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TEAM_MEMBERS.map((person) => (
                        <button
                          key={person}
                          onClick={() => setSelectedPerson(person)}
                          className={`px-2 md:px-3 py-3 md:py-4 font-display text-xs md:text-sm uppercase transition-all ${
                            selectedPerson === person
                              ? 'bg-[#2d5a27] text-[#c5e063] border-2 border-[#4a7c43] scale-105'
                              : 'bg-[#1a1a18] text-[#6b7264] border-2 border-[#2a2a26] hover:border-[#4a7c43] hover:text-[#8b9a7d]'
                          }`}
                        >
                          {person}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tree Count */}
                  <div>
                    <label className="block font-body text-sm uppercase tracking-wider text-[#8b9a7d] mb-2 md:mb-3">
                      Trees Planted
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={treeCount}
                      onChange={(e) => setTreeCount(e.target.value)}
                      placeholder="Enter count..."
                      className="w-full bg-[#1a1a18] border-2 border-[#3a3a34] px-4 py-4 md:py-5 font-display text-xl md:text-2xl text-[#e8e4dc] placeholder-[#4a4a44] focus:border-[#4a7c43] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-body text-sm uppercase tracking-wider text-[#8b9a7d] mb-2 md:mb-3">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#1a1a18] border-2 border-[#3a3a34] px-4 py-4 font-body text-[#e8e4dc] focus:border-[#4a7c43] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block font-body text-sm uppercase tracking-wider text-[#8b9a7d] mb-2 md:mb-3">
                      Location (Optional)
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-[#1a1a18] border-2 border-[#3a3a34] px-4 py-4 font-body text-[#e8e4dc] focus:border-[#4a7c43] focus:outline-none transition-all"
                    >
                      <option value="">Select location...</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!selectedPerson || !treeCount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 md:py-5 font-display text-lg md:text-xl uppercase tracking-wider transition-all ${
                      selectedPerson && treeCount
                        ? 'bg-[#2d5a27] text-[#c5e063] border-2 border-[#4a7c43] hover:bg-[#3a7333]'
                        : 'bg-[#2a2a26] text-[#4a4a44] border-2 border-[#3a3a34] cursor-not-allowed'
                    }`}
                  >
                    🌲 Plant Trees
                  </motion.button>

                  {/* Success Message */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#2d5a27] border-2 border-[#4a7c43] p-4 text-center"
                      >
                        <p className="font-display text-[#c5e063] text-lg">
                          ✓ {treeCount || 'Trees'} Trees Logged for {selectedPerson}!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8">
                <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-[#c5e063] flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">🏆</span> LEADERBOARD
                </h2>

                <div className="space-y-3">
                  {getPersonStats().map(([person, count], index) => (
                    <motion.div
                      key={person}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border-2 ${
                        index === 0 && count > 0
                          ? 'border-[#ffd700] bg-[#2d2a1a]'
                          : index === 1 && count > 0
                          ? 'border-[#c0c0c0] bg-[#252525]'
                          : index === 2 && count > 0
                          ? 'border-[#cd7f32] bg-[#2a2520]'
                          : 'border-[#3a3a34] bg-[#1a1a18]'
                      }`}
                    >
                      <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-display text-lg md:text-xl font-bold ${
                        index === 0 && count > 0 ? 'text-[#ffd700]' :
                        index === 1 && count > 0 ? 'text-[#c0c0c0]' :
                        index === 2 && count > 0 ? 'text-[#cd7f32]' : 'text-[#6b7264]'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-base md:text-lg text-[#e8e4dc]">{person}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl md:text-2xl font-bold text-[#c5e063]">
                          {count.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6b7264] font-body">trees</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#c5e063]">
                  📅 {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                    className="px-4 py-2 bg-[#1a1a18] border-2 border-[#3a3a34] text-[#8b9a7d] hover:border-[#4a7c43] transition-all font-display"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date())}
                    className="px-4 py-2 bg-[#2d5a27] border-2 border-[#4a7c43] text-[#c5e063] hover:bg-[#3a7333] transition-all font-display"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                    className="px-4 py-2 bg-[#1a1a18] border-2 border-[#3a3a34] text-[#8b9a7d] hover:border-[#4a7c43] transition-all font-display"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-body text-xs md:text-sm text-[#6b7264] py-2 uppercase tracking-wider">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
                {getDaysInMonth(calendarDate).map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

                  const dateStr = formatDateStr(day);
                  const dayEntries = getEntriesForDate(dateStr);
                  const totalForDay = dayEntries.reduce((sum, e) => sum + e.count, 0);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <motion.div
                      key={dateStr}
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square p-1 md:p-2 border-2 cursor-pointer transition-all ${
                        isToday
                          ? 'border-[#c5e063] bg-[#2d5a27]'
                          : totalForDay > 0
                          ? 'border-[#4a7c43] bg-[#1a2a18]'
                          : 'border-[#3a3a34] bg-[#1a1a18] hover:border-[#4a7c43]'
                      }`}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setActiveTab('entry');
                      }}
                    >
                      <div className="h-full flex flex-col">
                        <span className={`font-display text-xs md:text-sm ${isToday ? 'text-[#c5e063]' : 'text-[#8b9a7d]'}`}>
                          {day.getDate()}
                        </span>
                        {totalForDay > 0 && (
                          <div className="flex-1 flex items-end">
                            <span className="text-[8px] md:text-xs text-[#c5e063] font-display font-bold">
                              🌲{totalForDay}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Selected Date Details */}
              <div className="mt-6 md:mt-8 border-t-2 border-[#3a3a34] pt-6">
                <h3 className="font-display text-lg md:text-xl text-[#c5e063] mb-4">
                  Entries for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                {getEntriesForDate(selectedDate).length === 0 ? (
                  <p className="text-[#6b7264] font-body">No trees logged for this date.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getEntriesForDate(selectedDate).map((entry) => (
                      <div key={entry.id} className="bg-[#1a1a18] border-2 border-[#3a3a34] p-3 md:p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-display text-base md:text-lg text-[#e8e4dc]">{entry.person}</p>
                            <p className="text-xs md:text-sm text-[#6b7264] font-body">{entry.location}</p>
                          </div>
                          <p className="font-display text-xl md:text-2xl font-bold text-[#c5e063]">
                            {entry.count} 🌲
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Total Trees', value: getTotalTrees(), icon: '🌲' },
                  { label: 'Total Entries', value: entries.length, icon: '📝' },
                  { label: 'Active Planters', value: new Set(entries.map(e => e.person)).size, icon: '👷' },
                  { label: 'Locations', value: new Set(entries.map(e => e.location)).size, icon: '📍' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-6 text-center"
                  >
                    <p className="text-2xl md:text-3xl mb-2">{stat.icon}</p>
                    <p className="font-display text-2xl md:text-4xl font-bold text-[#c5e063]">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="font-body text-xs md:text-sm text-[#6b7264] uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Person Stats */}
                <div className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-[#c5e063]">
                    👷 Planter Breakdown
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    {getPersonStats().map(([person, count]) => {
                      const maxCount = Math.max(...getPersonStats().map(([_, c]) => c));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                      return (
                        <div key={person}>
                          <div className="flex justify-between mb-1">
                            <span className="font-display text-sm md:text-base text-[#e8e4dc]">{person}</span>
                            <span className="font-display text-sm md:text-base text-[#c5e063]">{count.toLocaleString()}</span>
                          </div>
                          <div className="h-3 md:h-4 bg-[#1a1a18] border border-[#3a3a34]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full bg-[#2d5a27]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location Stats */}
                <div className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-[#c5e063]">
                    📍 Location Breakdown
                  </h2>
                  {getLocationStats().length === 0 ? (
                    <p className="text-[#6b7264] font-body">No entries yet.</p>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {getLocationStats().slice(0, 8).map(([location, count]) => {
                        const maxCount = Math.max(...getLocationStats().map(([_, c]) => c));
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={location}>
                            <div className="flex justify-between mb-1">
                              <span className="font-display text-sm md:text-base text-[#e8e4dc] truncate mr-2">{location}</span>
                              <span className="font-display text-sm md:text-base text-[#c5e063] flex-shrink-0">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-3 md:h-4 bg-[#1a1a18] border border-[#3a3a34]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="h-full bg-[#4a7c43]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#222220] border-2 border-[#3a3a34] p-4 md:p-8">
                <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-[#c5e063]">
                  📋 Recent Activity
                </h2>
                {entries.length === 0 ? (
                  <p className="text-[#6b7264] font-body">No entries yet. Start logging trees!</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b-2 border-[#3a3a34]">
                          <th className="text-left font-display text-xs md:text-sm text-[#8b9a7d] uppercase tracking-wider py-2 md:py-3 px-4 md:px-0">Date</th>
                          <th className="text-left font-display text-xs md:text-sm text-[#8b9a7d] uppercase tracking-wider py-2 md:py-3">Planter</th>
                          <th className="text-left font-display text-xs md:text-sm text-[#8b9a7d] uppercase tracking-wider py-2 md:py-3">Location</th>
                          <th className="text-right font-display text-xs md:text-sm text-[#8b9a7d] uppercase tracking-wider py-2 md:py-3 px-4 md:px-0">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...entries].reverse().slice(0, 10).map((entry) => (
                          <tr key={entry.id} className="border-b border-[#2a2a26]">
                            <td className="font-body text-xs md:text-sm text-[#e8e4dc] py-2 md:py-3 px-4 md:px-0">
                              {new Date(entry.date + 'T12:00:00').toLocaleDateString()}
                            </td>
                            <td className="font-display text-xs md:text-sm text-[#e8e4dc] py-2 md:py-3">{entry.person}</td>
                            <td className="font-body text-xs md:text-sm text-[#6b7264] py-2 md:py-3">{entry.location}</td>
                            <td className="font-display text-base md:text-lg text-[#c5e063] text-right py-2 md:py-3 px-4 md:px-0">
                              {entry.count} 🌲
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#2a2a26] mt-10 md:mt-16 py-4 md:py-6">
        <p className="text-center font-body text-xs text-[#4a4a44]">
          Requested by @Salmong · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;
