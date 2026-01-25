import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import * as path from 'path';
import { EventsGateway } from '@/common/gateways/events.gateway';

@Injectable()
export class AuditLogsService {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFile = path.join(this.logDir, 'audit.log');

  constructor(private readonly eventsGateway: EventsGateway) {}

  private async ensureLogFile() {
    await fs.mkdir(this.logDir, { recursive: true });
    try {
      await fs.access(this.logFile);
    } catch {
      await fs.writeFile(this.logFile, '', 'utf8');
    }
  }

  async appendLog(entry: string) {
    await this.ensureLogFile();
    await fs.appendFile(this.logFile, `${entry}\n`, 'utf8');
    this.eventsGateway.broadcastAuditLog(entry);
  }

  async getLogContent(): Promise<string> {
    await this.ensureLogFile();
    return fs.readFile(this.logFile, 'utf8');
  }

  async getLogStream() {
    await this.ensureLogFile();
    return createReadStream(this.logFile);
  }
}
