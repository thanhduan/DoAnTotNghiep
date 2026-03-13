import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import {
  BOOKING_REMINDER_JOB_NAME,
  NOTIFICATION_QUEUE_NAME,
  NotificationsQueueService,
  TRANSFER_CANCELLED_JOB_NAME,
} from './notifications.queue';
import { NotificationsService } from './notifications.service';
import { BookingReminderJobPayload, TransferCancelledJobPayload } from './notifications.types';

@Injectable()
export class NotificationsWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsWorker.name);

  private worker: Worker<BookingReminderJobPayload | TransferCancelledJobPayload> | null = null;

  constructor(
    private readonly notificationsQueueService: NotificationsQueueService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.notificationsQueueService.isEnabled()) {
      this.logger.log('Notification worker disabled (REDIS_ENABLED=false).');
      return;
    }

    const concurrency = Number(this.configService.get<string>('NOTIFICATION_WORKER_CONCURRENCY') || 5);

    this.worker = new Worker<BookingReminderJobPayload | TransferCancelledJobPayload>(
      NOTIFICATION_QUEUE_NAME,
      async (job) => {
        if (job.name === BOOKING_REMINDER_JOB_NAME) {
          const payload = job.data as BookingReminderJobPayload;
          await this.notificationsService.notifyBookingReminderIfPending(
            payload.bookingId,
            payload.campusId,
          );
          return;
        }

        if (job.name === TRANSFER_CANCELLED_JOB_NAME) {
          if ((process.env.NOTIFICATION_TRANSFER_CANCEL_DEBUG || 'false') === 'true') {
            const payload = job.data as TransferCancelledJobPayload;
            this.logger.log(
              `[transfer-cancel-debug] Worker picked transfer-cancelled job. jobId=${job.id}, traceId=${payload?.traceId || 'n/a'}, transferId=${payload?.transferId || 'n/a'}`,
            );
          }

          await this.notificationsService.notifyTransferCancelledFromQueue(
            job.data as TransferCancelledJobPayload,
          );
        }
      },
      {
        connection: this.notificationsQueueService.getConnectionOptions(),
        concurrency: Number.isNaN(concurrency) ? 5 : concurrency,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Notification job completed: ${job.id}`);

      if (
        (process.env.NOTIFICATION_TRANSFER_CANCEL_DEBUG || 'false') === 'true' &&
        job.name === TRANSFER_CANCELLED_JOB_NAME
      ) {
        const payload = job.data as TransferCancelledJobPayload;
        this.logger.log(
          `[transfer-cancel-debug] Worker completed transfer-cancelled job. jobId=${job.id}, traceId=${payload?.traceId || 'n/a'}, transferId=${payload?.transferId || 'n/a'}`,
        );
      }
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Notification job failed: ${job?.id} - ${error}`);

      if (
        (process.env.NOTIFICATION_TRANSFER_CANCEL_DEBUG || 'false') === 'true' &&
        job?.name === TRANSFER_CANCELLED_JOB_NAME
      ) {
        const payload = (job.data || {}) as TransferCancelledJobPayload;
        this.logger.error(
          `[transfer-cancel-debug] Worker failed transfer-cancelled job. jobId=${job?.id}, traceId=${payload?.traceId || 'n/a'}, transferId=${payload?.transferId || 'n/a'}, error=${error}`,
        );
      }
    });

    this.logger.log('Notification worker initialized.');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
  }
}
