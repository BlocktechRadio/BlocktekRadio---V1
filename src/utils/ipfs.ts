import axios from 'axios';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const API_BASE_URL = 'http://localhost:3001/api';

export interface UploadResult {
  audioHash?: string;
  imageHash?: string;
}

/**
 * Upload files to IPFS via backend
 */
export const uploadToIPFS = async (
  audioFile?: File,
  imageFile?: File
): Promise<UploadResult> => {
  const formData = new FormData();
  
  if (audioFile) {
    formData.append('audio', audioFile);
  }
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for large files
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

/**
 * Get IPFS URL for a hash
 */
export const getIPFSUrl = (hash: string): string => {
  if (!hash) return '';
  return `${IPFS_GATEWAY}${hash}`;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File, type: 'audio' | 'image'): string | null => {
  const maxSizes = {
    audio: 100 * 1024 * 1024, // 100MB
    image: 10 * 1024 * 1024,  // 10MB
  };
  
  const allowedTypes = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  };
  
  if (file.size > maxSizes[type]) {
    return `File too large. Maximum size for ${type} is ${maxSizes[type] / (1024 * 1024)}MB`;
  }
  
  if (!allowedTypes[type].includes(file.type)) {
    return `Invalid file type. Allowed types for ${type}: ${allowedTypes[type].join(', ')}`;
  }
  
  return null;
};

/**
 * Generate metadata for NFT
 */
export const generateNFTMetadata = (
  title: string,
  description: string,
  audioHash: string,
  imageHash?: string,
  attributes?: Array<{ trait_type: string; value: string }>
) => {
  return {
    name: title,
    description: description,
    image: imageHash ? getIPFSUrl(imageHash) : '',
    animation_url: getIPFSUrl(audioHash),
    attributes: attributes || [],
    properties: {
      category: 'Audio',
      type: 'Music NFT',
      created_with: 'BlockTek Radio'
    }
  };
};

/**
 * Upload metadata to IPFS
 */
export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  try {
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json'
    });
    
    const formData = new FormData();
    formData.append('metadata', metadataFile);
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success && response.data.data.metadataHash) {
      return response.data.data.metadataHash;
    } else {
      throw new Error('Failed to upload metadata');
    }
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw error;
  }
};

/**
 * Fetch content from IPFS
 */
export const fetchFromIPFS = async (hash: string): Promise<any> => {
  try {
    const response = await axios.get(getIPFSUrl(hash), {
      timeout: 30000, // 30 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw error;
  }
};

/**
 * Check if IPFS hash is valid
 */
export const isValidIPFSHash = (hash: string): boolean => {
  // Basic IPFS hash validation (simplified)
  const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  return ipfsHashRegex.test(hash);
};

/**
 * Get file info from IPFS
 */
export const getIPFSFileInfo = async (hash: string): Promise<{
  size?: number;
  type?: string;
  exists: boolean;
}> => {
  try {
    const response = await axios.head(getIPFSUrl(hash), {
      timeout: 10000, // 10 seconds timeout
    });
    
    return {
      size: parseInt(response.headers['content-length'] || '0'),
      type: response.headers['content-type'],
      exists: true
    };
  } catch (error) {
    return {
      exists: false
    };
  }
};