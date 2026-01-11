import React, { useState, useEffect } from 'react';
import { Users, Mail, Star, Check, ExternalLink, RefreshCw, LogOut, MapPin, Sparkles } from 'lucide-react';
import LocationSetup from './LocationSetup';
import CollaboratorMatches from './CollaboratorMatches';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
  const [activeTab, setActiveTab] = useState('platforms'); // platforms, location, matches
  const [userProfile, setUserProfile] = useState(null);

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

  // Load user profile to check location
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);

          // Auto-navigate to appropriate tab based on setup status
          if (creators.length === 0) {
            setActiveTab('platforms');
          } else if (!profile.city || !profile.latitude) {
            setActiveTab('location');
          } else {
            setActiveTab('matches');
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, [creators.length]);

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

  const handleLocationSaved = (updatedUser) => {
    setUserProfile(updatedUser);
    setActiveTab('matches');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'platforms':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Platforms</h2>
            <p className="text-gray-600 mb-6">Connect your social media accounts to get started with AI-powered collaboration matching.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['instagram', 'tiktok', 'youtube'].map(platform => (
                <PlatformConnect key={platform} platform={platform} />
              ))}
            </div>

            {creators.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Accounts ({creators.length})</h3>
                {creators.map(creator => (
                  <div key={creator.id} className="mb-3">
                    <CreatorCard
                      creator={creator}
                      onReachOut={generateOutreach}
                      onSave={handleSave}
                      isSaved={savedIds.has(creator.id)}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setActiveTab('location')}
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue to Location Setup
                </button>
              </div>
            )}
          </div>
        );

      case 'location':
        return <LocationSetup user={user} onLocationSaved={handleLocationSaved} />;

      case 'matches':
        return <CollaboratorMatches user={user} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
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

          <p className="text-gray-600 mb-6">AI-powered collaboration matching for local content creators</p>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'platforms'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Connected Platforms
                {creators.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {creators.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('location')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'location'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Setup
                {userProfile?.city && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              disabled={!userProfile?.city || creators.length === 0}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'matches'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              } ${(!userProfile?.city || creators.length === 0) && 'opacity-50 cursor-not-allowed'}`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Find Collaborators
              </span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && !selectedCreator && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connecting your account...</h3>
            <p className="text-gray-600">Please wait while we fetch your profile data</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && renderTabContent()}
      </div>
    </div>
  );
}