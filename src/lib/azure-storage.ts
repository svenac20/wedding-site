import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

const containerName = "home-page-photos";

export async function getHomePagePhotos(): Promise<string[]> {
  // Read environment variables at runtime, not at module load time
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  
  console.log("Azure Storage Account Name:", accountName ? "SET" : "NOT SET");
  console.log("Azure Storage Account Key:", accountKey ? "SET" : "NOT SET");
  
  if (!accountName || !accountKey) {
    console.error("Azure Storage credentials not configured - accountName:", accountName, "accountKey:", accountKey ? "[REDACTED]" : "undefined");
    return [];
  }

  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    console.log("Fetrching photos from Azure container:", containerName);
    
    const imageUrls: string[] = [];
    
    // List all blobs in the container
    for await (const blob of containerClient.listBlobsFlat()) {
      // Only include image files
      console.log("Fetching image with name", blob.name);
      if (blob.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Generate SAS token for each blob (valid for 24 hours)
        const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blob.name}`;
        imageUrls.push(blobUrl);
      }
    }

    // Sort images by name for consistent ordering
    imageUrls.sort();

    return imageUrls;
  } catch (error) {
    console.error("Error fetching photos from Azure:", error);
    return [];
  }
}
