import { useState } from 'react';
import { kycAPI } from '../services/api';

export default function KYCForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    document_type: 'ID',
    document_number: '',
    front_image_url: '',
    back_image_url: ''
  });
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        if (side === 'front') {
          setFrontPreview(base64String);
          setFormData(prev => ({ ...prev, front_image_url: base64String }));
        } else {
          setBackPreview(base64String);
          setFormData(prev => ({ ...prev, back_image_url: base64String }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.front_image_url || !formData.back_image_url) {
      alert('Please upload both front and back images of your document');
      return;
    }

    setSubmitting(true);

    try {
      await kycAPI.submitKYC(formData);
      alert('KYC submitted successfully! Your submission is under review.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('KYC submission error:', error);
      alert(error.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your full legal name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Document Type</label>
        <select
          name="document_type"
          value={formData.document_type}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="ID">National ID Card</option>
          <option value="Passport">Passport</option>
          <option value="Driver License">Driver's License</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Document Number</label>
        <input
          type="text"
          name="document_number"
          value={formData.document_number}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your document number"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Front Side of Document
          </label>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-purple-500 transition">
            {frontPreview ? (
              <div className="space-y-3">
                <img
                  src={frontPreview}
                  alt="Front preview"
                  className="w-full h-48 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFrontPreview(null);
                    setFormData(prev => ({ ...prev, front_image_url: '' }));
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'front')}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-400">
                    {uploading ? 'Uploading...' : 'Click to upload front image'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Back Side of Document
          </label>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-purple-500 transition">
            {backPreview ? (
              <div className="space-y-3">
                <img
                  src={backPreview}
                  alt="Back preview"
                  className="w-full h-48 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBackPreview(null);
                    setFormData(prev => ({ ...prev, back_image_url: '' }));
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'back')}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-400">
                    {uploading ? 'Uploading...' : 'Click to upload back image'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit KYC'}
      </button>
    </form>
  );
}
