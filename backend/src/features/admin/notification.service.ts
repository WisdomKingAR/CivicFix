// src/features/admin/notification.service.ts
import { ComplaintStatus } from '@prisma/client';

export class NotificationService {
  /**
   * Logs or dispatches status change notifications to citizens and officers.
   */
  public static async notifyStatusChange(
    userId: string,
    complaintId: string,
    newStatus: ComplaintStatus
  ) {
    console.log(
      `🔔 [Notification] Citizen ${userId}: Your complaint #${complaintId} status changed to ${newStatus}`
    );
  }

  /**
   * Prompts citizen to confirm resolution after authority marked work finished.
   */
  public static async notifyResolutionConfirmationRequest(
    userId: string,
    complaintId: string
  ) {
    console.log(
      `🔔 [Notification] Citizen ${userId}: Authority marked complaint #${complaintId} resolved. Please confirm or reject the resolution in your app.`
    );
  }

  /**
   * Alerts authority that a citizen rejected a repair resolution.
   */
  public static async notifyCitizenRejection(
    authorityId: string,
    complaintId: string
  ) {
    console.log(
      `⚠️ [Alert] Authority ${authorityId}: Citizen rejected resolution for complaint #${complaintId}. Complaint reopened to IN_PROGRESS.`
    );
  }
}
