// src/templates/email.templates.ts

// ===============================
// Email Templates Module
// This file contains reusable HTML email templates 
// for notifications in the HR system.
// ===============================

// Template for Leave Application Status Notification
// Parameters:
// - employeeName: name of the employee
// - status: approval status ("Disetujui" or "Ditolak")
// - startDate: leave start date (string format)
// - endDate: leave end date (string format)
// Returns: HTML string for email body
export const leaveStatusTemplate = (
  employeeName: string,
  status: string,
  startDate: string,
  endDate: string
): string => {
  // Format dates into Indonesian readable format (e.g., 12 Januari 2025)
  const formattedStartDate = new Date(startDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedEndDate = new Date(endDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Pembaruan Status Pengajuan Cuti</h2>
      <p>Halo ${employeeName},</p>
      <p>Pengajuan cuti Anda untuk periode 
        <strong>${formattedStartDate}</strong> sampai 
        <strong>${formattedEndDate}</strong> telah di-update.</p>
      <p>Status terbaru: 
        <strong style="color: ${status === 'Disetujui' ? 'green' : 'red'};">
          ${status}
        </strong>
      </p>
      <p>Terima kasih,</p>
      <p><strong>Tim HR</strong></p>
    </div>
  `;
};

// Template for Payslip Notification
// Parameters:
// - employeeName: name of the employee
// - period: payroll period (e.g., "Januari 2025")
// Returns: HTML string for email body
export const payslipNotificationTemplate = (
  employeeName: string,
  period: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Slip Gaji Telah Tersedia</h2>
      <p>Halo ${employeeName},</p>
      <p>Kami informasikan bahwa slip gaji Anda untuk periode 
        <strong>${period}</strong> sudah tersedia.</p>
      <p>Anda dapat melihat dan mengunduhnya dengan login ke aplikasi HR.</p>
      <p>Terima kasih,</p>
      <p><strong>Tim HR & Finance</strong></p>
    </div>
  `;
};
