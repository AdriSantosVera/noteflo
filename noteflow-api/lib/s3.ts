import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

function assertS3Config() {
  if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Faltan variables AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY"
    );
  }
}

function sanitizeFileName(fileName: string) {
  const trimmed = fileName.trim();
  const withoutUnsafeChars = trimmed.replace(/[^a-zA-Z0-9._-]/g, "-");
  return withoutUnsafeChars || "avatar.jpg";
}

function buildObjectKey(userId: string, fileName: string) {
  const safeFileName = sanitizeFileName(fileName);
  return `avatars/${userId}/${Date.now()}-${safeFileName}`;
}

export function getPublicAssetUrl(objectKey: string) {
  assertS3Config();
  const safeBucketName = bucketName as string;
  const safeRegion = region as string;

  return `https://${safeBucketName}.s3.${safeRegion}.amazonaws.com/${objectKey}`;
}

export async function createAvatarUploadUrl({
  fileName,
  contentType,
  userId,
}: {
  fileName: string;
  contentType: string;
  userId: string;
}) {
  assertS3Config();
  const safeRegion = region as string;
  const safeBucketName = bucketName as string;
  const safeAccessKeyId = accessKeyId as string;
  const safeSecretAccessKey = secretAccessKey as string;

  const client = new S3Client({
    region: safeRegion,
    credentials: {
      accessKeyId: safeAccessKeyId,
      secretAccessKey: safeSecretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  const objectKey = buildObjectKey(userId, fileName);

  const command = new PutObjectCommand({
    Bucket: safeBucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 5,
  });

  return {
    signedUrl,
    publicUrl: getPublicAssetUrl(objectKey),
    objectKey,
  };
}
