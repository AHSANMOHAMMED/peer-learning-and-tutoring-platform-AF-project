import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Download, Share2, ExternalLink, CheckCircle, 
  Clock, QrCode, Shield, Globe, Linkedin, Twitter,
  Loader, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const NFTCertificateCard = ({ certificate, onShare }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'minted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'minting': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async () => {
    try {
      // In a real implementation, this would download the certificate image
      toast.success('Certificate download started');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handleShare = async (platform) => {
    try {
      const endpoint = platform === 'linkedin' 
        ? `/api/certificates/${certificate._id}/share-linkedin`
        : `/api/certificates/${certificate._id}/share-twitter`;
      
      const response = await api.post(endpoint);
      
      if (response.data.success) {
        window.open(response.data.data.shareUrl, '_blank');
        onShare?.(platform);
      }
    } catch (error) {
      toast.error(`Failed to share on ${platform}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      {/* Certificate Preview */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-2" />
            <h3 className="text-lg font-bold">{certificate.courseTitle}</h3>
            <p className="text-sm opacity-90">Certificate of {certificate.certificateType}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
            {certificate.status === 'minted' && <Shield className="w-3 h-3 inline mr-1" />}
            {certificate.status}
          </span>
        </div>

        {/* Hover Overlay */}
        {isHovered && certificate.status === 'minted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4"
          >
            <button
              onClick={handleDownload}
              className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => window.open(certificate.blockchain?.metadataUri, '_blank')}
              className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="View on IPFS"
            >
              <Globe className="w-5 h-5 text-gray-700" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Certificate Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">{certificate.courseTitle}</h4>
            <p className="text-sm text-gray-600">Instructor: {certificate.courseInstructor}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{certificate.grade}</span>
            <p className="text-xs text-gray-500">Grade</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-semibold text-gray-900">{certificate.score}%</p>
            <p className="text-xs text-gray-600">Score</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-semibold text-gray-900">{certificate.sessionsAttended}</p>
            <p className="text-xs text-gray-600">Sessions</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-semibold text-gray-900">
              {new Date(certificate.completionDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>

        {/* Skills */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Skills Acquired:</p>
            <div className="flex flex-wrap gap-2">
              {certificate.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {certificate.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{certificate.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {certificate.status === 'minted' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleShare('linkedin')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Tweet
            </button>
          </div>
        )}

        {/* Verification Link */}
        {certificate.status === 'minted' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href={`/certificates/verify/${certificate.verificationCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Shield className="w-4 h-4 mr-1" />
              Verify Certificate
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}

        {/* Pending State */}
        {certificate.status === 'pending' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Minting in progress...</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CertificatesPage = () => {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/api/certificates/my-certificates');
      if (response.data.success) {
        setCertificates(response.data.data.certificates);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-500" />
            My NFT Certificates
          </h1>
          <p className="text-gray-600 mt-2">
            Verifiable blockchain certificates for your achievements
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <NFTCertificateCard
                key={certificate._id}
                certificate={certificate}
                onShare={(platform) => toast.success(`Shared on ${platform}!`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete courses to earn blockchain-verified NFT certificates that you can share on LinkedIn and Twitter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Certificate Verification Component
export const CertificateVerification = ({ verificationCode }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [verificationCode]);

  const verifyCertificate = async () => {
    try {
      const response = await api.get(`/api/certificates/verify/${verificationCode}`);
      if (response.data.success) {
        setCertificate(response.data.data.certificate);
      }
    } catch (error) {
      setError('Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Certificate</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Verified Banner */}
          <div className="bg-green-500 text-white py-4 px-6 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            <span className="font-semibold">Verified Certificate</span>
          </div>

          {/* Certificate Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <Award className="w-20 h-20 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {certificate.courseTitle}
              </h1>
              <p className="text-gray-600">
                Certificate of {certificate.certificateType}
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Presented to</p>
                <p className="text-xl font-semibold text-gray-900">{certificate.userName}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="text-2xl font-bold text-blue-600">{certificate.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="text-2xl font-bold text-gray-900">{certificate.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Blockchain Verification
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">{certificate.blockchain?.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token ID:</span>
                  <span className="font-medium">{certificate.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-medium text-xs">
                    {certificate.blockchain?.contractAddress?.slice(0, 20)}...
                  </span>
                </div>
              </div>
            </div>

            {/* View on OpenSea */}
            <div className="text-center">
              <a
                href={certificate.openseaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Globe className="w-5 h-5 mr-2" />
                View on OpenSea
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CertificatesPage;
