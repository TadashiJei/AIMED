const { BlobServiceClient } = require('@azure/storage-blob');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Container for health records
const recordsContainer = process.env.AZURE_STORAGE_CONTAINER || 'health-records';

// Initialize container
const initializeContainer = async () => {
  try {
    const containerClient = blobServiceClient.getContainerClient(recordsContainer);
    await containerClient.createIfNotExists({
      access: 'private'
    });
    console.log('Storage container initialized');
  } catch (error) {
    console.error('Error initializing storage container:', error);
    throw error;
  }
};

module.exports = {
  blobServiceClient,
  recordsContainer,
  initializeContainer
};
