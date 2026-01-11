import React, { useState, useEffect } from 'react';
import { Users, MapPin, Star, TrendingUp, Mail, Check, X, Sparkles, Loader } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Match card component
const MatchCard = ({ match, onGenerateOutreach, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const primaryAccount = match.matchedUser.socialAccounts[0] || {};

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      archived: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || colors.pending;
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {(match.matchedUser.name || primaryAccount.displayName)?.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {match.matchedUser.name || primaryAccount.displayName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                {match.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">@{primaryAccount.username} • {primaryAccount.platform}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {match.distance} mi • {match.matchedUser.city}, {match.matchedUser.state}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {primaryAccount.followers?.toLocaleString()} followers
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {primaryAccount.engagement}% engagement
              </span>
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
            {match.matchScore}
          </div>
          <div className="text-xs text-gray-500">Match Score</div>
        </div>
      </div>

      {/* Content Topics */}
      {primaryAccount.recentTopics && primaryAccount.recentTopics.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2 font-medium">Content topics:</p>
          <div className="flex flex-wrap gap-2">
            {primaryAccount.recentTopics.slice(0, 5).map((topic, idx) => (
              <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Collaboration Formats */}
      {match.collaborationFormats && match.collaborationFormats.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI-Suggested Collaborations:
          </p>
          <div className="space-y-2">
            {match.collaborationFormats.slice(0, expanded ? 10 : 2).map((format, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium text-gray-900">{format.type}</span>
                {format.inPerson && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">IRL</span>
                )}
                <p className="text-gray-600 ml-2">• {format.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Insights */}
      {expanded && match.audienceInsights && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">Audience Compatibility Analysis:</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Compatibility:</span>
              <span className="ml-2 font-medium">{match.audienceInsights.compatibilityScore}/100</span>
            </div>
            <div>
              <span className="text-gray-600">Topic Overlap:</span>
              <span className="ml-2 font-medium capitalize">{match.audienceInsights.topicOverlap}</span>
            </div>
            <div>
              <span className="text-gray-600">Audience Size:</span>
              <span className="ml-2 font-medium capitalize">{match.audienceInsights.audienceSizeCompatibility?.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Engagement:</span>
              <span className="ml-2 font-medium capitalize">{match.audienceInsights.engagementCompatibility?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {match.audienceInsights.strengths && match.audienceInsights.strengths.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Strengths:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {match.audienceInsights.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          {expanded ? 'Show Less' : 'View Full Analysis'}
        </button>

        <button
          onClick={() => onGenerateOutreach(match)}
          disabled={match.outreachSent}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-4 h-4" />
          {match.outreachSent ? 'Outreach Sent' : 'Generate Outreach'}
        </button>

        {match.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(match.id, 'archived')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            title="Archive"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {match.outreachSent && match.outreachSentAt && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Outreach sent on {new Date(match.outreachSentAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

// Main component
export default function CollaboratorMatches({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [generatingOutreach, setGeneratingOutreach] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
    setLoading(false);
  };

  const generateMatches = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/matches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          limit: 10
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await loadMatches();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate matches');
      }
    } catch (error) {
      console.error('Failed to generate matches:', error);
      alert('Failed to generate matches. Please try again.');
    }
    setGenerating(false);
  };

  const handleGenerateOutreach = async (match) => {
    setSelectedMatch(match);
    setGeneratingOutreach(true);
    setOutreachMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/matches/${match.id}/outreach`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOutreachMessage(result.message);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate outreach message');
      }
    } catch (error) {
      console.error('Failed to generate outreach:', error);
      alert('Failed to generate outreach message. Please try again.');
    }

    setGeneratingOutreach(false);
  };

  const handleUpdateStatus = async (matchId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await loadMatches();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleMarkOutreachSent = async () => {
    if (!selectedMatch) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/matches/${selectedMatch.id}/outreach/sent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Outreach marked as sent!');
        setSelectedMatch(null);
        setOutreachMessage('');
        await loadMatches();
      }
    } catch (error) {
      console.error('Failed to mark outreach as sent:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Find Matches button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Potential Collaborators</h2>
            <p className="text-gray-600 mt-1">AI-powered matches based on location and audience compatibility</p>
          </div>
          <button
            onClick={generateMatches}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Find Collaborators
              </>
            )}
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches List */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading matches...</p>
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Yet</h3>
              <p className="text-gray-600 mb-4">
                Click "Find Collaborators" to discover local creators in your area
              </p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                Showing {matches.length} potential collaborator{matches.length !== 1 ? 's' : ''}
              </div>
              {matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onGenerateOutreach={handleGenerateOutreach}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Outreach Panel */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Outreach Generator</h3>

            {!selectedMatch && !generatingOutreach && (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click "Generate Outreach" on any match to create a personalized message</p>
              </div>
            )}

            {generatingOutreach && (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Crafting personalized outreach...</p>
              </div>
            )}

            {selectedMatch && !generatingOutreach && outreachMessage && (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">To:</span>{' '}
                    {selectedMatch.matchedUser.name || selectedMatch.matchedUser.socialAccounts[0]?.displayName}
                  </p>
                </div>

                <textarea
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <div className="flex gap-3">
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
                      setSelectedMatch(null);
                      setOutreachMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleMarkOutreachSent}
                  className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Mark as Sent
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
