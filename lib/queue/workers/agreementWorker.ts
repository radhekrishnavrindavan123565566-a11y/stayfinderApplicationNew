import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../config';
import { AgreementJob } from '../queues';
import { connectDB } from '@/lib/mongodb';
import RentAgreement from '@/models/RentAgreement';
import { addEmailJob } from '../queues';

// Agreement worker processor
async function processAgreementJob(job: Job<AgreementJob>) {
  const { agreementId, action, userId } = job.data;

  console.log(`[AgreementWorker] Processing job ${job.id}: ${action} for agreement ${agreementId}`);

  await connectDB();

  try {
    const agreement = await RentAgreement.findById(agreementId)
      .populate('tenantId', 'email username')
      .populate('ownerId', 'email username');

    if (!agreement) {
      throw new Error(`Agreement ${agreementId} not found`);
    }

    switch (action) {
      case 'generate':
        // Send notification emails to both parties
        await addEmailJob({
          to: agreement.tenantId.email,
          subject: 'Your Rental Agreement is Ready',
          html: `<p>Hi ${agreement.tenantId.username},</p>
                 <p>Your rental agreement has been generated and is ready for review.</p>
                 <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">View Agreement</a></p>`,
        });

        await addEmailJob({
          to: agreement.ownerId.email,
          subject: 'New Rental Agreement Generated',
          html: `<p>Hi ${agreement.ownerId.username},</p>
                 <p>A new rental agreement has been generated.</p>
                 <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">View Agreement</a></p>`,
        });
        break;

      case 'sign':
        // Notify the other party when one party signs
        const isTenantSigned = !!agreement.tenantSignature;
        const isOwnerSigned = !!agreement.ownerSignature;

        if (isTenantSigned && !isOwnerSigned) {
          await addEmailJob({
            to: agreement.ownerId.email,
            subject: 'Tenant Signed the Agreement',
            html: `<p>Hi ${agreement.ownerId.username},</p>
                   <p>The tenant has signed the rental agreement. Please review and sign.</p>
                   <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">Sign Agreement</a></p>`,
          });
        } else if (isOwnerSigned && !isTenantSigned) {
          await addEmailJob({
            to: agreement.tenantId.email,
            subject: 'Owner Signed the Agreement',
            html: `<p>Hi ${agreement.tenantId.username},</p>
                   <p>The owner has signed the rental agreement. Please review and sign.</p>
                   <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">Sign Agreement</a></p>`,
          });
        } else if (isTenantSigned && isOwnerSigned) {
          // Both signed - send completion emails
          await addEmailJob({
            to: agreement.tenantId.email,
            subject: 'Agreement Fully Signed',
            html: `<p>Hi ${agreement.tenantId.username},</p>
                   <p>The rental agreement has been fully signed by both parties.</p>
                   <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">Download Agreement</a></p>`,
          });

          await addEmailJob({
            to: agreement.ownerId.email,
            subject: 'Agreement Fully Signed',
            html: `<p>Hi ${agreement.ownerId.username},</p>
                   <p>The rental agreement has been fully signed by both parties.</p>
                   <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/agreements/${agreementId}">Download Agreement</a></p>`,
          });
        }
        break;

      case 'expire':
        // Handle agreement expiration
        agreement.status = 'expired';
        await agreement.save();

        await addEmailJob({
          to: agreement.tenantId.email,
          subject: 'Rental Agreement Expired',
          html: `<p>Hi ${agreement.tenantId.username},</p>
                 <p>Your rental agreement has expired.</p>`,
        });

        await addEmailJob({
          to: agreement.ownerId.email,
          subject: 'Rental Agreement Expired',
          html: `<p>Hi ${agreement.ownerId.username},</p>
                 <p>The rental agreement has expired.</p>`,
        });
        break;
    }

    console.log(`[AgreementWorker] Successfully processed ${action} for agreement ${agreementId}`);
    return { success: true, agreementId, action };
  } catch (error) {
    console.error(`[AgreementWorker] Failed to process agreement ${agreementId}:`, error);
    throw error;
  }
}

// Create and export the worker
export const agreementWorker = new Worker(
  QUEUE_NAMES.AGREEMENT,
  processAgreementJob,
  {
    connection: queueConnection,
    concurrency: 3,
  }
);

// Worker event handlers
agreementWorker.on('completed', (job) => {
  console.log(`[AgreementWorker] Job ${job.id} completed`);
});

agreementWorker.on('failed', (job, err) => {
  console.error(`[AgreementWorker] Job ${job?.id} failed:`, err.message);
});

agreementWorker.on('error', (err) => {
  console.error('[AgreementWorker] Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[AgreementWorker] Shutting down gracefully...');
  await agreementWorker.close();
});
