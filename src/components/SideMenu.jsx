import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { kycAPI } from '../services/api';
import KYCForm from '../components/KYCForm';

export default function SideMenu({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('bonus');
  const [kycStatus, setKycStatus] = useState(null);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [status, submissions] = await Promise.all([
        kycAPI.getStatus(),
        kycAPI.getMySubmissions()
      ]);
      setKycStatus(status);
      setKycSubmissions(submissions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCreditScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCreditScoreBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Menu */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-gray-900 border-l border-white/10 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Account Menu</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Quick Links */}
          <div className="mb-6">
            <Link
              to="/about"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition"
            >
              <div className="bg-purple-500/20 rounded-lg p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">About OnchainWeb</div>
                <div className="text-xs text-gray-400">Security, Company Info & More</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('bonus')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'bonus'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bonus
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'kyc'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              KYC Status
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'credit'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Credit Score
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <>
              {/* Bonus Program Tab */}
              {activeTab === 'bonus' && (
                <div className="space-y-6">
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">🎉</span>
                        <h3 className="text-2xl font-bold text-white">Welcome Bonus!</h3>
                      </div>
                      <p className="text-white/90 text-lg mb-4">
                        New users get up to <span className="font-bold text-yellow-300">$500</span> in trading bonuses!
                      </p>
                      <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                        <span className="text-white font-semibold">Limited Time Offer</span>
                      </div>
                    </div>
                  </div>

                  {/* Bonus Tiers */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>💰</span> Deposit Bonus Tiers
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-500/10 to-transparent rounded-lg p-4 border border-green-500/20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Starter Bonus</span>
                          <span className="text-green-400 font-bold">100% Match</span>
                        </div>
                        <p className="text-sm text-gray-400">Deposit $50 - $100, get 100% bonus up to $100</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg p-4 border border-blue-500/20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Silver Bonus</span>
                          <span className="text-blue-400 font-bold">75% Match</span>
                        </div>
                        <p className="text-sm text-gray-400">Deposit $101 - $500, get 75% bonus up to $250</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-4 border border-purple-500/20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Gold Bonus</span>
                          <span className="text-purple-400 font-bold">50% Match</span>
                        </div>
                        <p className="text-sm text-gray-400">Deposit $501+, get 50% bonus up to $500</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Bonuses */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>🎁</span> Extra Rewards
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-500/20 rounded-full p-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">KYC Verification Bonus</div>
                          <p className="text-sm text-gray-400">Complete KYC and earn $10 credit instantly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500/20 rounded-full p-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">First Trade Cashback</div>
                          <p className="text-sm text-gray-400">Get 10% cashback on your first 5 trades (up to $50)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Referral Bonus</div>
                          <p className="text-sm text-gray-400">Invite friends and earn $25 for each verified referral</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500/20 rounded-full p-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Daily Login Rewards</div>
                          <p className="text-sm text-gray-400">Login daily to collect points redeemable for cash</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-white/3 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      * Bonus terms apply. Deposit bonuses require 3x trading volume before withdrawal. 
                      KYC verification must be completed within 7 days of registration. 
                      Referral bonuses are credited after referee completes first deposit. 
                      OnchainWeb reserves the right to modify bonus programs at any time.
                    </p>
                  </div>
                </div>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4">KYC Status</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getStatusColor(
                          kycStatus?.kyc_status
                        )}`}
                      >
                        {kycStatus?.kyc_status?.replace('_', ' ') || 'Not Submitted'}
                      </span>
                    </div>
                  </div>

                  {/* Submit KYC Form */}
                  {(!kycStatus?.kyc_status || kycStatus?.kyc_status === 'not_submitted' || kycStatus?.kyc_status === 'rejected') && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {kycStatus?.kyc_status === 'rejected' ? 'Resubmit KYC' : 'Submit KYC Verification'}
                      </h3>
                      <KYCForm onSuccess={loadData} />
                    </div>
                  )}

                  {/* Submission History */}
                  {kycSubmissions.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4">Submission History</h3>
                      <div className="space-y-3">
                        {kycSubmissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="bg-white/3 rounded-lg p-4 border border-white/5"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{submission.document_type}</div>
                                <div className="text-sm text-gray-400">
                                  {new Date(submission.submitted_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(
                                  submission.status
                                )}`}
                              >
                                {submission.status}
                              </span>
                            </div>
                            {submission.admin_notes && (
                              <div className="mt-2 p-2 bg-white/5 rounded text-sm text-gray-300">
                                <strong>Note:</strong> {submission.admin_notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Credit Score Tab */}
              {activeTab === 'credit' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 p-8">
                    <div>
                      <p className="text-gray-400 text-sm mb-4">Your Credit Score</p>
                      <div className="flex items-end gap-3 mb-6">
                        <p
                          className={`text-6xl font-bold ${getCreditScoreColor(
                            kycStatus?.credit_score || 10
                          )}`}
                        >
                          {kycStatus?.credit_score || 10}
                        </p>
                        <p className="text-gray-400 text-2xl mb-2">/ 100</p>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-4">
                        <div
                          className={`h-full ${getCreditScoreBarColor(
                            kycStatus?.credit_score || 10
                          )} transition-all duration-500`}
                          style={{ width: `${kycStatus?.credit_score || 10}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-300">
                        {(kycStatus?.credit_score || 10) >= 80
                          ? 'Excellent Credit - You have outstanding creditworthiness'
                          : (kycStatus?.credit_score || 10) >= 50
                          ? 'Good Credit - You have good creditworthiness'
                          : (kycStatus?.credit_score || 10) >= 30
                          ? 'Fair Credit - Continue building your credit history'
                          : 'Building Credit - Complete KYC and maintain good trading activity'}
                      </p>
                    </div>
                  </div>

                  {/* Credit Score Info */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4">About Credit Score</h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Your credit score reflects your account trustworthiness</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Complete KYC verification to improve your score</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Maintain regular trading activity to build credit</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Higher scores unlock better trading conditions</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
