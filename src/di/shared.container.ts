import { IUnitOfWork } from '@application/ports/IUnitOfWork'
import { IEmailService } from '@application/ports/IEmailService'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { INotificationService } from '@application/ports/INotificationService'
import { IFileStorageService } from '@application/ports/IFileStorageService'
import { IAccessibilityCheckerService } from '@application/ports/IAccessibilityCheckerService'
import { IExcelGeneratorService, IPdfGeneratorService } from '@application/ports/IDocumentGeneratorService'
import { ILogger } from '@application/ports/ILogger'

import { IPasswordHasher } from '@domain/services/IPasswordHasher'
import { ITokenGenerator } from '@domain/services/ITokenGenerator'

import { PostgresUnitOfWork } from '@infrastructure/persistence/postgres/PostgresUnitOfWork'

import { BcryptPasswordHasher } from '@infrastructure/services/auth/BcryptPasswordHasher'
import { JwtTokenGenerator } from '@infrastructure/services/auth/JwtTokenGenerator'
import { NodemailerEmailService } from '@infrastructure/services/email/NodemailerEmailService'
import { DatabaseAuditLoggerService } from '@infrastructure/services/audit/DatabaseAuditLoggerService'
import { InAppNotificationService } from '@infrastructure/services/notifications/InAppNotificationService'
import { createFileStorageService } from '@infrastructure/services/storage/FileStorageFactory'
import { WcagAccessibilityChecker } from '@infrastructure/services/accessibility/WcagAccessibilityChecker'
import { PdfKitGeneratorService } from '@infrastructure/services/documents/PdfKitGeneratorService'
import { ExcelJsGeneratorService } from '@infrastructure/services/documents/ExcelJsGeneratorService'

import { createAuthMiddleware, AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'

import { PinoLogger } from '@infrastructure/logging/PinoLogger'

import { Repositories } from './repositories'


export interface SharedServices {
  unitOfWork: IUnitOfWork
  passwordHasher: IPasswordHasher
  tokenGenerator: ITokenGenerator
  emailService: IEmailService
  pdfService: IPdfGeneratorService
  excelService: IExcelGeneratorService
  auditLogger: IAuditLoggerService
  notificationService: INotificationService
  fileStorage: IFileStorageService
  accessibilityChecker: IAccessibilityCheckerService
  authMiddleware: AuthMiddleware
  logger: ILogger
}

export function buildSharedServices(
  repos: Pick<
    Repositories, 
    'auditoriaRepo' 
    | 'notificacionRepo'
  >,
): SharedServices {
  const tokenGenerator = new JwtTokenGenerator()

  return {
    unitOfWork: new PostgresUnitOfWork(),
    passwordHasher: new BcryptPasswordHasher(),
    tokenGenerator,
    emailService: new NodemailerEmailService(),
    pdfService: new PdfKitGeneratorService(),
    excelService: new ExcelJsGeneratorService(),
    auditLogger: new DatabaseAuditLoggerService(repos.auditoriaRepo),
    notificationService: new InAppNotificationService(repos.notificacionRepo),
    fileStorage: createFileStorageService(),
    accessibilityChecker: new WcagAccessibilityChecker(),
    authMiddleware: createAuthMiddleware(tokenGenerator),
    logger: new PinoLogger()
  }
}