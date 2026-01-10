import React, { useState, useEffect } from 'react';
import { Users, Mail, Star, Check, ExternalLink, RefreshCw, LogOut } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

// Platform connection component
const PlatformConnect = ({ platform }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${platform}/init`);
      const { authUrl } = await response.json();
      
      sessionStorage.setItem('connecting_platform', platform);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect. Please try again.');
      setLoading(false);
    }
  };

  const icons = {
    instagram: '📷',
    tiktok: '🎵',
    youtube: '▶️'
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-400 disabled:opacity-50"
    >
      <span className="text-3xl">{icons[platform]}</span>
      <div className="text-left">
        <div className="font-semibold text-gray-900 capitalize">{platform}</div>
        <div className="text-sm text-gray-500">
          {loading ? 'Redirecting...' : 'Click to connect'}
        </div>
      </div>
    </button>
  );
};

// Creator profile card
const CreatorCard = ({ creator, onReachOut, onSave, isSaved }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {creator.displayName?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{creator.displayName}</h3>
            <p className="text-sm text-gray-600">@{creator.username} • {creator.platform}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>{creator.followers?.toLocaleString()} followers</span>
              <span>{creator.engagement}% engagement</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <a 
            href={creator.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <button 
            onClick={() => onSave(creator.id)} 
            className={`transition-colors ${isSaved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
          >
            <Star className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {creator.recentTopics?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2 font-medium">Recent topics:</p>
          <div className="flex flex-wrap gap-2">
            {creator.recentTopics.map((topic, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          {expanded ? 'Show Less' : 'View Details'}
        </button>
        <button
          onClick={() => onReachOut(creator)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Generate Outreach
        </button>
      </div>

      {expanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Posts:</span>
              <span className="ml-2 font-medium">{creator.postCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Following:</span>
              <span className="ml-2 font-medium">{creator.following?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Platform:</span>
              <span className="ml-2 font-medium capitalize">{creator.platform}</span>
            </div>
            <div>
              <span className="text-gray-600">Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(creator.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function LocalCreatorNetwork({ user, onLogout }) {
  const [connectedPlatforms, setConnectedPlatforms] = useState({});
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showSetup, setShowSetup] = useState(true);

  // Handle OAuth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const platform = sessionStorage.getItem('connecting_platform');

    if (code && platform) {
      sessionStorage.removeItem('connecting_platform');
      handleOAuthCallback(platform, code);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Load saved social accounts on mount
  useEffect(() => {
    const loadSavedAccounts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/social-accounts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const accounts = await response.json();
          if (accounts.length > 0) {
            setCreators(accounts);
            setShowSetup(false);
          }
        }
      } catch (error) {
        console.error('Failed to load saved accounts:', error);
      }
    };

    loadSavedAccounts();
  }, []);

  const handleOAuthCallback = async (platform, code) => {
    setLoading(true);
    try {
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/${platform}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const { userId } = await tokenResponse.json();
      
      if (userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/creator/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const creatorData = await response.json();
        
        if (creatorData && !creatorData.error) {
          setConnectedPlatforms(prev => ({
            ...prev,
            [platform]: userId
          }));
          
          setCreators(prev => [...prev, { ...creatorData, id: userId }]);
          setShowSetup(false);
        } else {
          alert(`Failed to fetch ${platform} profile. Please try again.`);
        }
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Failed to connect. Please try again.');
    }
    setLoading(false);
  };

  const generateOutreach = async (creator) => {
    setSelectedCreator(creator);
    setLoading(true);
    
    setTimeout(() => {
      const message = `Hi ${creator.displayName}! 👋

I came across your ${creator.platform} content and absolutely love your approach to ${creator.recentTopics?.[0] || 'content creation'}. 

I'm a local creator in the area with ${creator.followers?.toLocaleString()} followers on ${creator.platform}, and I think there's great potential for us to collaborate. Our audiences seem to have similar interests and engagement levels.

Would you be interested in exploring a collaboration? I have a few ideas that could benefit both our communities.

Looking forward to connecting!

Best,
[Your Name]`;
      
      setOutreachMessage(message);
      setLoading(false);
    }, 1500);
  };

  const handleSave = (id) => {
    setSavedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const refreshCreatorData = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/creator/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await response.json();
      
      setCreators(prev => prev.map(c => 
        c.id === userId ? { ...updatedData, id: userId } : c
      ));
    } catch (error) {
      console.error('Failed to refresh creator data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Local Creator Network</h1>
                {user && (
                  <p className="text-sm text-gray-500">Welcome back, {user.name || user.email}!</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!showSetup && (
                <button
                  onClick={() => setShowSetup(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Connect More Platforms
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600">AI-powered collaboration matching with real social media data</p>
        </div>

        {/* Loading */}
        {loading && !selectedCreator && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connecting your account...</h3>
            <p className="text-gray-600">Please wait while we fetch your profile data</p>
          </div>
        )}

        {/* Platform Setup */}
        {showSetup && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['instagram', 'tiktok', 'youtube'].map(platform => (
                <PlatformConnect key={platform} platform={platform} />
              ))}
            </div>
            {Object.keys(connectedPlatforms).length > 0 && (
              <button
                onClick={() => setShowSetup(false)}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue to Dashboard
              </button>
            )}
          </div>
        )}

        {/* Connected Profiles */}
        {!showSetup && !loading && creators.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Connected Profiles ({creators.length})
              </h2>
              
              {creators.map(creator => (
                <div key={creator.id} className="mb-4">
                  <CreatorCard
                    creator={creator}
                    onReachOut={generateOutreach}
                    onSave={handleSave}
                    isSaved={savedIds.has(creator.id)}
                  />
                  <button
                    onClick={() => refreshCreatorData(creator.id)}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh data
                  </button>
                </div>
              ))}
            </div>

            {/* Outreach Generator */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Outreach Generator</h2>
                
                {!selectedCreator && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Generate Outreach" to create a personalized message</p>
                  </div>
                )}

                {loading && selectedCreator && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Crafting personalized outreach...</p>
                  </div>
                )}

                {selectedCreator && !loading && outreachMessage && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">To:</span> {selectedCreator.displayName}
                      </p>
                    </div>
                    
                    <textarea
                      value={outreachMessage}
                      onChange={(e) => setOutreachMessage(e.target.value)}
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(outreachMessage);
                          alert('Message copied to clipboard!');
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Copy Message
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCreator(null);
                          setOutreachMessage('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showSetup && !loading && creators.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Connected Platforms</h3>
            <p className="text-gray-600 mb-4">Connect your social media accounts to get started</p>
            <button
              onClick={() => setShowSetup(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect Platforms
            </button>
          </div>
        )}
      </div>
    </div>
  );
}